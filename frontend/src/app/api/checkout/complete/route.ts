import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { setupShippingChatAfterDigitalPay } from "@/lib/shippingChatSetup";

export async function POST(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "Database admin tidak dikonfigurasi." }, { status: 503 });
  }

  try {
    const { orderIds, success = true, createChat = false, paymentType } = await request.json();
    if (!Array.isArray(orderIds) || !orderIds.length) {
      return NextResponse.json({ error: "orderIds wajib diisi." }, { status: 400 });
    }

    const isOffline = paymentType === "offline";
    const orderStatus = success ? "diproses" : "dibatalkan";
    const payStatus = success ? (isOffline ? "pending" : "success") : "failed";
    const now = new Date().toISOString();
    const chatIds: string[] = [];

    for (const id_order of orderIds) {
      const { error: payErr } = await admin
        .from("payment")
        .update({ stat_pay: payStatus, tgl_pay: success && !isOffline ? now : null })
        .eq("id_order", id_order);
      if (payErr) throw payErr;

      const { error: orderErr } = await admin
        .from("order")
        .update({ stat_order: orderStatus })
        .eq("id_order", id_order);
      if (orderErr) throw orderErr;

      if (success && !isOffline && (createChat || paymentType === "digital")) {
        const chatId = await setupShippingChatAfterDigitalPay(admin, id_order);
        if (chatId) chatIds.push(chatId);
      }

      if (success && isOffline) {
        const { data: order } = await admin
          .from("order")
          .select("id_user")
          .eq("id_order", id_order)
          .maybeSingle();
        if (order?.id_user) {
          await admin.from("notifikasi").insert({
            id_user: order.id_user,
            judul: "Pesanan Pickup Dikonfirmasi",
            pesan: "Pesanan pickup Anda siap. Datang ke toko kami untuk bayar dan ambil barang.",
            tipe: "order",
            link: "/account/orders",
            id_order,
            is_read: false,
          });
        }
      }
    }

    return NextResponse.json({ ok: true, chatIds });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("API checkout complete failed:", e.message || err);
    return NextResponse.json({ error: e.message || "Gagal menyelesaikan pembayaran." }, { status: 500 });
  }
}
