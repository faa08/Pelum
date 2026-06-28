import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyOrderOwnership } from "@/lib/api-auth";
import { completeCheckoutPayment } from "@/lib/completeCheckoutPayment";

function allowClientDigitalComplete(): boolean {
  if (process.env.ALLOW_PAYMENT_SIMULATOR === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { orderIds, success = true, createChat = false, paymentType } = await request.json();
    if (!Array.isArray(orderIds) || !orderIds.length) {
      return NextResponse.json({ error: "orderIds wajib diisi." }, { status: 400 });
    }

    const ownership = await verifyOrderOwnership(auth.ctx.admin, orderIds, auth.ctx.user.id_user);
    if (!ownership.ok) return ownership.response;

    const isOffline = paymentType === "offline";
    const isDigital = paymentType === "digital" || (!isOffline && paymentType !== "offline");

    if (isDigital && success && !allowClientDigitalComplete()) {
      return NextResponse.json(
        {
          error:
            "Konfirmasi pembayaran digital hanya melalui Midtrans. Cek status di Pesanan Saya.",
        },
        { status: 403 }
      );
    }

    const { chatIds } = await completeCheckoutPayment(auth.ctx.admin, orderIds, {
      success,
      createChat,
      paymentType: isOffline ? "offline" : "digital",
    });

    return NextResponse.json({ ok: true, chatIds });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("API checkout complete failed:", e.message || err);
    return NextResponse.json({ error: e.message || "Gagal menyelesaikan pembayaran." }, { status: 500 });
  }
}
