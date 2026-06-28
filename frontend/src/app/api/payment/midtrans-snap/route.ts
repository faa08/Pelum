import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const orderId = String(body.orderId || "");
    const grossAmount = Math.round(Number(body.grossAmount) || 0);

    if (!orderId || grossAmount < 1) {
      return NextResponse.json({ error: "orderId dan grossAmount wajib." }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const baseUrl = isProduction
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";

    if (!serverKey) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Pembayaran digital belum dikonfigurasi di server." },
          { status: 503 }
        );
      }
      return NextResponse.json({
        mode: "simulator",
        redirectUrl: `/checkout/payment?orderId=${encodeURIComponent(orderId)}&amount=${grossAmount}`,
      });
    }

    const customer = body.customerDetails || {};
    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");
    const origin = request.nextUrl.origin;

    const snapRes = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        customer_details: {
          first_name: customer.name || "Pelanggan",
          email: customer.email || auth.ctx.user.email,
          phone: customer.phone || "",
        },
        callbacks: {
          finish: `${origin}/checkout/payment?ref=${encodeURIComponent(orderId)}`,
        },
      }),
    });

    const snapData = await snapRes.json();
    if (!snapRes.ok) {
      return NextResponse.json(
        { error: snapData.error_messages?.join(", ") || "Gagal membuat sesi Midtrans." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mode: "midtrans",
      token: snapData.token,
      redirectUrl: snapData.redirect_url,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal Midtrans." }, { status: 500 });
  }
}
