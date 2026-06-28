import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  completeCheckoutPayment,
  findOrderIdsByTransactionRef,
} from "@/lib/completeCheckoutPayment";

function verifyMidtransSignature(body: Record<string, string>, serverKey: string): boolean {
  const { order_id, status_code, gross_amount, signature_key } = body;
  if (!order_id || !status_code || !gross_amount || !signature_key) return false;
  const payload = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const expected = createHash("sha512").update(payload).digest("hex");
  return expected === signature_key;
}

export async function POST(request: NextRequest) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json({ error: "Midtrans belum dikonfigurasi." }, { status: 503 });
  }

  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "DB tidak dikonfigurasi." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Record<string, string>;
    if (!verifyMidtransSignature(body, serverKey)) {
      return NextResponse.json({ error: "Signature tidak valid." }, { status: 403 });
    }

    const transactionRef = body.order_id;
    const status = body.transaction_status;
    const orderIds = await findOrderIdsByTransactionRef(admin, transactionRef);

    if (!orderIds.length) {
      return NextResponse.json({ ok: true, skipped: "orders_not_found" });
    }

    if (status === "capture" || status === "settlement") {
      await completeCheckoutPayment(admin, orderIds, {
        success: true,
        createChat: true,
        paymentType: "digital",
      });
    } else if (
      status === "deny" ||
      status === "cancel" ||
      status === "expire" ||
      status === "failure"
    ) {
      await completeCheckoutPayment(admin, orderIds, {
        success: false,
        paymentType: "digital",
        deductInventory: false,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("Midtrans webhook failed:", e.message || err);
    return NextResponse.json({ error: e.message || "Webhook gagal." }, { status: 500 });
  }
}
