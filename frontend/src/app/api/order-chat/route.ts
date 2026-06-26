import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "DB tidak dikonfigurasi." }, { status: 503 });
  }

  const chatId = request.nextUrl.searchParams.get("chatId");
  const orderId = request.nextUrl.searchParams.get("orderId");
  const userId = request.nextUrl.searchParams.get("userId");
  const listAdmin = request.nextUrl.searchParams.get("list") === "admin";

  try {
    if (chatId) {
      const { data, error } = await admin
        .from("order_chat_message")
        .select("*")
        .eq("id_chat", chatId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return NextResponse.json({ messages: data || [] });
    }

    if (orderId) {
      const { data, error } = await admin
        .from("order_chat")
        .select(`*, order ( stat_order, total_hrg, tipe_pembayaran )`)
        .eq("id_order", orderId)
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json({ room: data });
    }

    if (listAdmin) {
      const { data, error } = await admin
        .from("order_chat")
        .select(`
          *,
          order ( stat_order, total_hrg, tipe_pembayaran ),
          users ( nama_lengkap, email )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ rooms: data || [] });
    }

    if (userId) {
      const { data, error } = await admin
        .from("order_chat")
        .select(`*, order ( stat_order, total_hrg, tipe_pembayaran )`)
        .eq("id_user", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ rooms: data || [] });
    }

    return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal memuat chat." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "DB tidak dikonfigurasi." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "ensure") {
      const orderId = String(body.orderId || "");
      const userId = String(body.userId || "");
      if (!orderId || !userId) {
        return NextResponse.json({ error: "orderId dan userId wajib." }, { status: 400 });
      }

      const { data: existing } = await admin
        .from("order_chat")
        .select("id_chat")
        .eq("id_order", orderId)
        .maybeSingle();

      if (existing?.id_chat) {
        return NextResponse.json({ id_chat: existing.id_chat });
      }

      const { data: created, error } = await admin
        .from("order_chat")
        .insert({ id_order: orderId, id_user: userId })
        .select("id_chat")
        .single();
      if (error) throw error;

      await admin.from("order_chat_message").insert({
        id_chat: created.id_chat,
        sender_role: "admin",
        sender_id: null,
        text: "Halo! Pembayaran Anda sudah kami terima. Admin akan membantu mengatur pengiriman pesanan Anda di chat ini.",
      });

      return NextResponse.json({ id_chat: created.id_chat });
    }

    if (action === "send") {
      const chatId = String(body.chatId || "");
      const senderRole = body.senderRole === "admin" ? "admin" : "customer";
      const senderId = body.senderId ? String(body.senderId) : null;
      const text = String(body.text || "").trim();
      if (!chatId || !text) {
        return NextResponse.json({ error: "chatId dan text wajib." }, { status: 400 });
      }

      const { error } = await admin.from("order_chat_message").insert({
        id_chat: chatId,
        sender_role: senderRole,
        sender_id: senderId,
        text,
      });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action tidak dikenal." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal memproses chat." }, { status: 500 });
  }
}
