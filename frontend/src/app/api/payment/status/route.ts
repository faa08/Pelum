import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { findOrderIdsByTransactionRef } from "@/lib/completeCheckoutPayment";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "ref wajib." }, { status: 400 });
  }

  const orderIds = await findOrderIdsByTransactionRef(auth.ctx.admin, ref);
  if (!orderIds.length) {
    return NextResponse.json({ paid: false, orders: [] });
  }

  const { data: orders, error } = await auth.ctx.admin
    .from("order")
    .select("id_order, stat_order, id_user, payment ( stat_pay )")
    .in("id_order", orderIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const owned = (orders || []).filter((o) => o.id_user === auth.ctx.user.id_user);
  if (!owned.length) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  const paid = owned.every((o) => {
    const pay = Array.isArray(o.payment) ? o.payment[0] : o.payment;
    return o.stat_order === "diproses" && pay?.stat_pay === "success";
  });

  return NextResponse.json({
    paid,
    orders: owned.map((o) => ({ id_order: o.id_order, stat_order: o.stat_order })),
  });
}
