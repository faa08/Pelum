import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { client: admin, error: configError } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: configError || "DB tidak dikonfigurasi." }, { status: 503 });
  }

  const chatId = request.nextUrl.searchParams.get("chatId");
  const returId = request.nextUrl.searchParams.get("returId");
  const listAdmin = request.nextUrl.searchParams.get("list") === "admin";

  try {
    if (chatId) {
      const { data, error } = await admin
        .from("return_chat_message")
        .select("*")
        .eq("id_chat", chatId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return NextResponse.json({ messages: data || [] });
    }

    if (returId) {
      const { data, error } = await admin
        .from("return_chat")
        .select(`*, retur ( alasan, status )`)
        .eq("id_retur", returId)
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json({ room: data });
    }

    if (listAdmin) {
      const { data, error } = await admin
        .from("return_chat")
        .select(`
          *,
          retur ( alasan, status, created_at ),
          users ( nama_lengkap, email )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ rooms: data || [] });
    }

    return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal memuat chat return." }, { status: 500 });
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

    if (action === "send") {
      const chatId = String(body.chatId || "");
      const senderRole = body.senderRole === "admin" ? "admin" : "customer";
      const senderId = body.senderId ? String(body.senderId) : null;
      const text = String(body.text || "").trim();
      if (!chatId || !text) {
        return NextResponse.json({ error: "chatId dan text wajib." }, { status: 400 });
      }

      const { error } = await admin.from("return_chat_message").insert({
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
