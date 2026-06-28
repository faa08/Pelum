import { supabase } from "./supabase";
import { apiFetch } from "@/lib/api-client";
import {
  DEFAULT_CATEGORY_HERO,
  DEFAULT_HOME_HERO_SLIDES,
} from "@/lib/defaultBanners";

export interface SiteBanner {
  id_banner: string;
  banner_kind: "home_hero" | "category_hero";
  category_slug: string;
  badge: string | null;
  title_line1: string | null;
  title_line2: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string;
  image_position: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SiteBannerInput = Omit<
  SiteBanner,
  "id_banner" | "created_at" | "updated_at"
>;

function mapHomeDefaults(): SiteBanner[] {
  return DEFAULT_HOME_HERO_SLIDES.map((row, i) => ({
    ...row,
    id_banner: `default-home-${i}`,
  }));
}

function mapCategoryDefault(slug: string): SiteBanner | null {
  const row = DEFAULT_CATEGORY_HERO[slug];
  if (!row) return null;
  return {
    id_banner: `default-cat-${slug || "all"}`,
    banner_kind: "category_hero",
    sort_order: 0,
    is_active: true,
    button_text: null,
    button_link: null,
    title_line2: null,
    ...row,
  };
}

export async function fetchHomeHeroSlides(): Promise<SiteBanner[]> {
  try {
    const res = await apiFetch("/api/banners?kind=home_hero");
    if (!res.ok) return mapHomeDefaults();
    const data = await res.json();
    const rows = (data.banners || []) as SiteBanner[];
    return rows.length ? rows : mapHomeDefaults();
  } catch {
    return mapHomeDefaults();
  }
}

export async function fetchCategoryHero(slug: string): Promise<SiteBanner | null> {
  try {
    const res = await apiFetch(
      `/api/banners?kind=category_hero&slug=${encodeURIComponent(slug)}`
    );
    if (!res.ok) return mapCategoryDefault(slug);
    const data = await res.json();
    return (data.banner as SiteBanner) || mapCategoryDefault(slug);
  } catch {
    return mapCategoryDefault(slug);
  }
}

export async function fetchAllBannersAdmin(): Promise<SiteBanner[]> {
  const res = await apiFetch("/api/banners?admin=1");
  if (!res.ok) throw new Error("Gagal memuat banner.");
  const data = await res.json();
  return (data.banners || []) as SiteBanner[];
}

export async function saveBanner(
  input: SiteBannerInput & { id_banner?: string }
): Promise<SiteBanner> {
  const res = await apiFetch("/api/banners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Gagal menyimpan banner.");
  return data.banner as SiteBanner;
}

export async function deleteBanner(id: string): Promise<void> {
  const res = await apiFetch(`/api/banners?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Gagal menghapus banner.");
  }
}

export async function uploadBannerImage(file: File): Promise<string> {
  if (file.size > 3 * 1024 * 1024) {
    throw new Error("Ukuran gambar terlalu besar. Maksimal 3MB.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `banners/${crypto.randomUUID()}.${ext}`;

  try {
    const { error } = await supabase.storage.from("products").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    if (data?.publicUrl) return data.publicUrl;
    throw new Error("Gagal mendapatkan URL gambar.");
  } catch (err) {
    console.warn("Upload banner ke storage gagal, pakai base64:", err);
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve((event.target?.result as string) || "");
      reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
      reader.readAsDataURL(file);
    });
  }
}
