import { NextRequest, NextResponse } from "next/server";
import { requireAuth, denyForeignUser } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;

  try {
    const body = await request.json();
    const denied = denyForeignUser(auth.ctx, body.userId ? String(body.userId) : null);
    if (denied) return denied;

    const userId = auth.ctx.user.id_user;
    const orderId = String(body.orderId || "");
    const productId = String(body.productId || "");
    const rating = Math.round(Number(body.rating) || 0);
    const comment = String(body.comment || "").trim();
    const photoReview = body.photoReview ? String(body.photoReview) : null;

    if (!userId || !orderId || !productId || rating < 1 || rating > 5 || !comment) {
      return NextResponse.json({ error: "Data ulasan tidak lengkap." }, { status: 400 });
    }

    const { data: order, error: orderErr } = await admin
      .from("order")
      .select("id_order, id_user, stat_order")
      .eq("id_order", orderId)
      .maybeSingle();

    if (orderErr) throw orderErr;
    if (!order || order.id_user !== userId) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    if (order.stat_order !== "selesai") {
      return NextResponse.json(
        { error: "Ulasan hanya bisa diberikan untuk pesanan yang sudah selesai." },
        { status: 400 }
      );
    }

    const { data: orderItem } = await admin
      .from("order_item")
      .select("id_order_item")
      .eq("id_order", orderId)
      .eq("id_produk", productId)
      .maybeSingle();

    if (!orderItem) {
      return NextResponse.json({ error: "Produk tidak ada di pesanan ini." }, { status: 400 });
    }

    const { data: existing } = await admin
      .from("review")
      .select("id_review")
      .eq("id_user", userId)
      .eq("id_produk", productId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Anda sudah memberikan ulasan untuk produk ini." }, { status: 409 });
    }

    const { error: insertErr } = await admin.from("review").insert({
      id_user: userId,
      id_produk: productId,
      id_order: orderId,
      rating,
      komentar: comment,
      foto_review: photoReview,
    });
    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal menyimpan ulasan." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const queryUserId = request.nextUrl.searchParams.get("userId");
  const denied = denyForeignUser(auth.ctx, queryUserId);
  if (denied) return denied;

  const productIds = request.nextUrl.searchParams.get("productIds");
  if (!productIds) {
    return NextResponse.json({ reviewed: [] });
  }

  const ids = productIds.split(",").filter(Boolean);
  const { data } = await auth.ctx.admin
    .from("review")
    .select("id_produk")
    .eq("id_user", auth.ctx.user.id_user)
    .in("id_produk", ids);

  return NextResponse.json({ reviewed: (data || []).map((r) => r.id_produk) });
}
