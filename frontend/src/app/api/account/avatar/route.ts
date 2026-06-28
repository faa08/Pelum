import { NextRequest, NextResponse } from "next/server";
import { requireAuth, denyForeignUser } from "@/lib/api-auth";

const MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const admin = auth.ctx.admin;

  try {
    const form = await request.formData();
    const formUserId = String(form.get("userId") || "").trim();
    const denied = denyForeignUser(auth.ctx, formUserId || null);
    if (denied) return denied;

    const userId = auth.ctx.user.id_user;
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File gambar wajib." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 1 MB." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Format harus JPEG atau PNG." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `avatars/${userId}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await admin.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadErr) throw uploadErr;

    const { data: publicUrlData } = admin.storage.from("products").getPublicUrl(filePath);
    if (!publicUrlData?.publicUrl) {
      return NextResponse.json({ error: "Gagal mendapatkan URL foto profil." }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: unknown) {
    const e = err as { message?: string };
    return NextResponse.json({ error: e.message || "Gagal mengunggah foto profil." }, { status: 500 });
  }
}
