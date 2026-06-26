import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "DB tidak dikonfigurasi." }, { status: 503 });
  }

  try {
    const { orderId, userId } = await request.json();
    if (!orderId || !userId) {
      return NextResponse.json({ error: "orderId dan userId wajib." }, { status: 400 });
    }

    const { data: order, error: orderErr } = await admin
      .from("order")
      .select("id_order, id_user, stat_order, pengiriman ( kurir )")
      .eq("id_order", orderId)
      .maybeSingle();

    if (orderErr) throw orderErr;
    if (!order || order.id_user !== userId) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (order.stat_order === "selesai") {
      return NextResponse.json({ ok: true, already: true });
    }

    const pengiriman = Array.isArray(order.pengiriman) ? order.pengiriman[0] : order.pengiriman;
    const isPickup = pengiriman?.kurir === "Ambil di Toko";
    const canComplete =
      order.stat_order === "dikirim" ||
      (isPickup && order.stat_order === "diproses");

    if (!canComplete) {
      return NextResponse.json(
        { error: "Pesanan belum bisa diselesaikan. Tunggu hingga barang dikirim atau siap diambil." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { error: updateErr } = await admin
      .from("order")
      .update({ stat_order: "selesai", updated_at: now })
      .eq("id_order", orderId);
    if (updateErr) throw updateErr;

    await admin
      .from("pengiriman")
      .update({ stat_kirim: "sampai" })
      .eq("id_order", orderId);

    await admin.from("notifikasi").insert({
      id_user: userId,
      judul: "Pesanan Selesai",
      pesan: "Terima kasih! Pesanan Anda telah diselesaikan. Berikan ulasan untuk produk yang dibeli.",
      tipe: "order",
      link: "/account/orders",
      id_order: orderId,
      is_read: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal menyelesaikan pesanan." }, { status: 500 });
  }
}
