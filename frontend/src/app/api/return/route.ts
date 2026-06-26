import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "DB tidak dikonfigurasi." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const userId = String(body.userId || "");
    const orderItemId = String(body.orderItemId || "");
    const alasan = String(body.alasan || "").trim();

    if (!userId || !orderItemId || !alasan) {
      return NextResponse.json({ error: "Data pengajuan return tidak lengkap." }, { status: 400 });
    }

    const { data: item, error: itemErr } = await admin
      .from("order_item")
      .select(`
        id_order_item, id_produk,
        order ( id_order, id_user, stat_order )
      `)
      .eq("id_order_item", orderItemId)
      .maybeSingle();

    if (itemErr) throw itemErr;

    const orderRaw = item?.order;
    const order = Array.isArray(orderRaw) ? orderRaw[0] : orderRaw;
    if (!order || order.id_user !== userId) {
      return NextResponse.json({ error: "Item pesanan tidak ditemukan." }, { status: 404 });
    }
    if (order.stat_order !== "selesai") {
      return NextResponse.json(
        { error: "Return hanya bisa diajukan untuk pesanan yang sudah selesai." },
        { status: 400 }
      );
    }

    const { data: existing } = await admin
      .from("retur")
      .select("id_retur")
      .eq("id_order_item", orderItemId)
      .eq("id_user", userId)
      .maybeSingle();

    if (existing?.id_retur) {
      return NextResponse.json({ id_retur: existing.id_retur, existing: true });
    }

    const id_retur = crypto.randomUUID();
    const { error: returErr } = await admin.from("retur").insert({
      id_retur,
      id_order_item: orderItemId,
      id_user: userId,
      alasan,
      status: "diajukan",
    });
    if (returErr) throw returErr;

    const { data: chat, error: chatErr } = await admin
      .from("return_chat")
      .insert({ id_retur, id_user: userId })
      .select("id_chat")
      .single();
    if (chatErr) throw chatErr;

    await admin.from("return_chat_message").insert({
      id_chat: chat.id_chat,
      sender_role: "customer",
      sender_id: userId,
      text: `Pengajuan return: ${alasan}`,
    });

    await admin.from("return_chat_message").insert({
      id_chat: chat.id_chat,
      sender_role: "admin",
      sender_id: null,
      text: "Halo! Pengajuan return Anda telah kami terima. Admin akan memproses melalui chat ini.",
    });

    await admin.from("notifikasi").insert({
      id_user: userId,
      judul: "Pengajuan Return",
      pesan: "Pengajuan return Anda sedang diproses admin.",
      tipe: "order",
      link: `/account/orders/return/${id_retur}/chat`,
      id_order: order.id_order,
      is_read: false,
    });

    return NextResponse.json({ id_retur, id_chat: chat.id_chat });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal mengajukan return." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "DB tidak dikonfigurasi." }, { status: 503 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId wajib." }, { status: 400 });
  }

  try {
    const { data, error } = await admin
      .from("retur")
      .select(`
        id_retur, alasan, status, created_at,
        order_item (
          id_order_item, qty_orderitem, hrg_saat_beli,
          produk ( id_produk, nama_produk, img ),
          order ( id_order, stat_order, created_at, seller ( nm_store ) )
        )
      `)
      .eq("id_user", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ returns: data || [] });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal memuat return." }, { status: 500 });
  }
}
