import { NextRequest, NextResponse } from "next/server";
import { requireAuth, denyForeignUser } from "@/lib/api-auth";

function tableMissingMessage(err: { message?: string; code?: string }): string | null {
  const msg = (err.message || "").toLowerCase();
  if (
    err.code === "PGRST205" ||
    msg.includes("could not find") ||
    (msg.includes("ikut_toko") && msg.includes("schema"))
  ) {
    return "Tabel pengikut toko belum dibuat. Jalankan bagian MIGRASI ikut_toko di db.sql pada Supabase SQL Editor, lalu coba lagi.";
  }
  return null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const queryUserId = request.nextUrl.searchParams.get("userId");
  const sellerId = request.nextUrl.searchParams.get("sellerId");
  const denied = denyForeignUser(auth.ctx, queryUserId);
  if (denied) return denied;

  if (!sellerId) {
    return NextResponse.json({ error: "sellerId wajib." }, { status: 400 });
  }

  const client = auth.ctx.admin;
  const userId = auth.ctx.user.id_user;

  const { data, error } = await client
    .from("ikut_toko")
    .select("id_ikut")
    .eq("id_user", userId)
    .eq("id_seller", sellerId)
    .maybeSingle();

  if (error) {
    const missing = tableMissingMessage(error);
    if (missing) return NextResponse.json({ error: missing, following: false }, { status: 503 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ following: !!data });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: { userId?: string; sellerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  const denied = denyForeignUser(auth.ctx, body.userId ? String(body.userId) : null);
  if (denied) return denied;

  const sellerId = body.sellerId ? String(body.sellerId) : "";
  if (!sellerId) {
    return NextResponse.json({ error: "sellerId wajib." }, { status: 400 });
  }

  const client = auth.ctx.admin;
  const userId = auth.ctx.user.id_user;

  const { data: seller } = await client
    .from("seller")
    .select("id_seller")
    .eq("id_seller", sellerId)
    .maybeSingle();

  if (!seller) {
    return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
  }

  const { error } = await client.from("ikut_toko").insert({ id_user: userId, id_seller: sellerId });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyFollowing: true });
    }
    const missing = tableMissingMessage(error);
    if (missing) return NextResponse.json({ error: missing }, { status: 503 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const queryUserId = request.nextUrl.searchParams.get("userId");
  const sellerId = request.nextUrl.searchParams.get("sellerId");
  const denied = denyForeignUser(auth.ctx, queryUserId);
  if (denied) return denied;

  if (!sellerId) {
    return NextResponse.json({ error: "sellerId wajib." }, { status: 400 });
  }

  const client = auth.ctx.admin;
  const userId = auth.ctx.user.id_user;

  const { error } = await client
    .from("ikut_toko")
    .delete()
    .eq("id_user", userId)
    .eq("id_seller", sellerId);

  if (error) {
    const missing = tableMissingMessage(error);
    if (missing) return NextResponse.json({ error: missing }, { status: 503 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
