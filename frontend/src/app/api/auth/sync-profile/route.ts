import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { mapRowToUser } from "@/lib/auth/mapUser";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Token tidak ditemukan." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase tidak dikonfigurasi." }, { status: 503 });
  }

  const { client: admin, error: adminErr } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: adminErr || "Service role tidak tersedia." }, { status: 503 });
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user: authUser },
    error: authError,
  } = await authClient.auth.getUser(token);

  if (authError || !authUser?.email) {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const meta = { ...authUser.user_metadata, ...(body.metadata || {}) };

  const email = authUser.email.trim().toLowerCase();
  const displayName =
    (meta.nama_lengkap as string) ||
    (meta.full_name as string) ||
    (meta.name as string) ||
    email.split("@")[0];

  // Run both lookups in parallel for speed
  const [{ data: byEmail }, { data: byAuthId }] = await Promise.all([
    admin.from("users").select("*").ilike("email", email).maybeSingle(),
    admin.from("users").select("*").eq("id_user", authUser.id).maybeSingle(),
  ]);

  const existing = byEmail || byAuthId;

  if (existing) {
    const updates: Record<string, string> = {};
    if (!existing.nama_lengkap && displayName) updates.nama_lengkap = displayName;
    if (!existing.avatar && (meta.avatar_url as string)) updates.avatar = meta.avatar_url as string;
    if (meta.username && !existing.username) updates.username = String(meta.username);

    if (Object.keys(updates).length > 0) {
      await admin.from("users").update(updates).eq("id_user", existing.id_user);
      const { data: refreshed } = await admin
        .from("users")
        .select("*")
        .eq("id_user", existing.id_user)
        .single();
      return NextResponse.json({ user: mapRowToUser(refreshed || { ...existing, ...updates }) });
    }

    return NextResponse.json({ user: mapRowToUser(existing) });
  }

  const username =
    (meta.username as string) ||
    `${email.split("@")[0]}_${Math.random().toString(36).slice(2, 6)}`;

  const insertRow: Record<string, unknown> = {
    id_user: authUser.id,
    username,
    email,
    nama_lengkap: displayName,
    avatar: (meta.avatar_url as string) || DEFAULT_AVATAR,
    role: "customer",
    password: null,
  };

  const { data: created, error: insertError } = await admin
    .from("users")
    .insert(insertRow)
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: fallback } = await admin
        .from("users")
        .select("*")
        .ilike("email", email)
        .maybeSingle();
      if (fallback) return NextResponse.json({ user: mapRowToUser(fallback) });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ user: mapRowToUser(created) });
}
