import { supabase } from "./supabase";

export interface Seller {
  id_seller: string;
  id_user: string;
  nm_store: string;
  deskripsi: string;
  logo_toko: string;
  email: string;
  no_telp: string;
  addr: string;
  nama_bank: string;
  no_rek: string;
  atas_nama_rek: string;
  created_at: string;
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

export const sellerService = {
  // Retrieve seller profile by user ID
  async getSellerByUserId(userId: string): Promise<Seller | null> {
    console.log("Calling sellerService.getSellerByUserId for:", userId);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      const sellers = stored ? JSON.parse(stored) : [];
      return sellers.find((s: any) => s.id_user === userId) || null;
    }

    try {
      const { data, error } = await supabase
        .from("seller")
        .select("*")
        .eq("id_user", userId)
        .single();

      if (error) {
        console.error("Supabase get seller error:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("sellerService getSellerByUserId failed:", err);
      return null;
    }
  },

  // Get all sellers/stores (for superadmin management)
  async getSellers(): Promise<Seller[]> {
    console.log("Calling sellerService.getSellers");

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const { data, error } = await supabase
        .from("seller")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase get sellers error:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("sellerService getSellers failed:", err);
      return [];
    }
  },

  // Get seller by ID or slug/name
  async getSellerByIdOrSlug(idOrSlug: string): Promise<Seller | null> {
    console.log("Calling sellerService.getSellerByIdOrSlug:", idOrSlug);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      const sellers = stored ? JSON.parse(stored) : [];
      return sellers.find((s: any) => s.id_seller === idOrSlug || s.nm_store?.toLowerCase().replace(/\s+/g, "-") === idOrSlug) || null;
    }

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      let query = supabase.from("seller").select("*");
      if (isUuid) {
        query = query.eq("id_seller", idOrSlug);
      } else {
        query = query.ilike("nm_store", `%${idOrSlug.replace(/-/g, " ")}%`);
      }
      
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("sellerService.getSellerByIdOrSlug failed:", err);
      return null;
    }
  },

  // Admin: Create a new store/toko
  async createStore(
    nm_store: string,
    email: string,
    no_telp: string,
    deskripsi: string,
    addr: string,
    nama_bank: string,
    no_rek: string,
    atas_nama_rek: string
  ): Promise<Seller | null> {
    console.log("Calling sellerService.createStore for:", nm_store);

    const newStore: Seller = {
      id_seller: typeof crypto !== "undefined" ? crypto.randomUUID() : `s-${Math.random().toString(36).substr(2, 9)}`,
      id_user: "",
      nm_store,
      deskripsi: deskripsi || `Selamat datang di ${nm_store}`,
      logo_toko: "",
      email,
      no_telp,
      addr: addr || "Indonesia",
      nama_bank,
      no_rek,
      atas_nama_rek,
      created_at: new Date().toISOString()
    };

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      const sellers = stored ? JSON.parse(stored) : [];
      sellers.push(newStore);
      localStorage.setItem("pelum_sellers", JSON.stringify(sellers));
      return newStore;
    }

    try {
      const { error } = await supabase
        .from("seller")
        .insert({
          id_seller: newStore.id_seller,
          nm_store: newStore.nm_store,
          deskripsi: newStore.deskripsi,
          email: newStore.email,
          no_telp: newStore.no_telp,
          addr: newStore.addr,
          nama_bank: newStore.nama_bank,
          no_rek: newStore.no_rek,
          atas_nama_rek: newStore.atas_nama_rek
        });

      if (error) {
        console.error("Supabase insert store error:", error);
        return null;
      }
      return newStore;
    } catch (err) {
      console.error("sellerService createStore failed:", err);
      return null;
    }
  }
};
