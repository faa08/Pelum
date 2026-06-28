import { supabase } from "./supabase";

export type Alamat = {
  id_alamat: string;
  id_user: string;
  label: string;
  nama_penerima: string;
  no_telp: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kode_pos: string | null;
  detail_alamat: string;
  lat?: number | null;
  lng?: number | null;
  is_utama: boolean;
};

export type AlamatInput = Omit<Alamat, "id_alamat" | "id_user" | "is_utama">;

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export function formatAlamatLines(addr: Alamat) {
  const line1 = `${addr.nama_penerima}${addr.is_utama ? " (Utama)" : ""}`;
  const line2 = `${addr.detail_alamat}, ${addr.kecamatan}, ${addr.kota}, ${addr.provinsi}${
    addr.kode_pos ? ` ${addr.kode_pos}` : ""
  }`;
  return { name: line1, phone: addr.no_telp, details: line2 };
}

export const addressService = {
  async getAddresses(userId: string): Promise<Alamat[]> {
    if (!userId || isPlaceholder()) return [];

    const { data, error } = await supabase
      .from("alamat")
      .select("*")
      .eq("id_user", userId)
      .order("is_utama", { ascending: false });

    if (error) {
      console.error("getAddresses failed:", error.message);
      return [];
    }
    return (data || []) as Alamat[];
  },

  async createAddress(userId: string, input: AlamatInput, isUtama?: boolean): Promise<Alamat | null> {
    if (!userId || isPlaceholder()) return null;

    const existing = await this.getAddresses(userId);
    const makePrimary = isUtama ?? existing.length === 0;

    if (makePrimary && existing.length > 0) {
      await supabase.from("alamat").update({ is_utama: false }).eq("id_user", userId);
    }

    const { data, error } = await supabase
      .from("alamat")
      .insert({
        ...input,
        kode_pos: input.kode_pos || null,
        id_user: userId,
        is_utama: makePrimary,
      })
      .select("*")
      .single();

    if (error) {
      console.error("createAddress failed:", error.message);
      return null;
    }
    return data as Alamat;
  },

  async updateAddress(
    addressId: string,
    userId: string,
    input: AlamatInput
  ): Promise<boolean> {
    if (!addressId || !userId || isPlaceholder()) return false;

    const { error } = await supabase
      .from("alamat")
      .update({
        ...input,
        kode_pos: input.kode_pos || null,
      })
      .eq("id_alamat", addressId)
      .eq("id_user", userId);

    if (error) {
      console.error("updateAddress failed:", error.message);
      return false;
    }
    return true;
  },
};
