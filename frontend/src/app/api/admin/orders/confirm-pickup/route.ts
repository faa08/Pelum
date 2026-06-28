import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { confirmPickupOrder } from "@/lib/confirmPickupOrder";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const orderId = String(body.orderId || "");
    if (!orderId) {
      return NextResponse.json({ error: "orderId wajib." }, { status: 400 });
    }

    const result = await confirmPickupOrder(auth.ctx.admin, orderId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json(
      { error: e.message || "Gagal mengonfirmasi pickup." },
      { status: 500 }
    );
  }
}
