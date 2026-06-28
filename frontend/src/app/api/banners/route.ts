import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import type { SiteBannerInput } from "@/backend/bannerService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const slug = searchParams.get("slug") ?? "";
  const isAdmin = searchParams.get("admin") === "1";

  const { createSupabaseAdmin } = await import("@/lib/supabase-admin");
  const { client: admin, error: adminErr } = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: adminErr || "DB tidak tersedia." }, { status: 503 });
  }

  if (isAdmin) {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const { data, error } = await admin
      .from("site_banner")
      .select("*")
      .order("banner_kind")
      .order("sort_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ banners: data || [] });
  }

  if (kind === "home_hero") {
    const { data, error } = await admin
      .from("site_banner")
      .select("*")
      .eq("banner_kind", "home_hero")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ banners: data || [] });
  }

  if (kind === "category_hero") {
    const { data, error } = await admin
      .from("site_banner")
      .select("*")
      .eq("banner_kind", "category_hero")
      .eq("category_slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ banner: data });
  }

  return NextResponse.json({ error: "Parameter kind wajib." }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as SiteBannerInput & { id_banner?: string };
    const now = new Date().toISOString();
    const row = {
      banner_kind: body.banner_kind,
      category_slug: body.category_slug ?? "",
      badge: body.badge ?? null,
      title_line1: body.title_line1 ?? null,
      title_line2: body.title_line2 ?? null,
      description: body.description ?? null,
      button_text: body.button_text ?? null,
      button_link: body.button_link ?? null,
      image_url: body.image_url || "",
      image_position: body.image_position ?? "center center",
      sort_order: Number(body.sort_order) || 0,
      is_active: body.is_active !== false,
      updated_at: now,
    };

    if (body.id_banner && !body.id_banner.startsWith("default-")) {
      const { data, error } = await auth.ctx.admin
        .from("site_banner")
        .update(row)
        .eq("id_banner", body.id_banner)
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ banner: data });
    }

    const { data, error } = await auth.ctx.admin
      .from("site_banner")
      .insert({ ...row, created_at: now })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505" && body.banner_kind === "category_hero") {
        const { data: updated, error: upErr } = await auth.ctx.admin
          .from("site_banner")
          .update(row)
          .eq("banner_kind", "category_hero")
          .eq("category_slug", body.category_slug ?? "")
          .select("*")
          .single();
        if (upErr) throw upErr;
        return NextResponse.json({ banner: updated });
      }
      throw error;
    }

    return NextResponse.json({ banner: data });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal menyimpan." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id wajib." }, { status: 400 });
  }

  const { error } = await auth.ctx.admin.from("site_banner").delete().eq("id_banner", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
