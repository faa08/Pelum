import { supabase } from "./supabase";
import { authService, User } from "./authService";

export interface Seller {
  id_seller: string;
  id_user: string;
  nm_store: string;
  deskripsi: string;
  logo_toko: string;
  email: string;
  no_telp: string;
  addr: string;
  img_ktp: string;
  nik_ktp: string;
  nib: string;
  nama_bank: string;
  no_rek: string;
  atas_nama_rek: string;
  is_verified: boolean;
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

  // Register user as seller
  async registerSeller(
    userId: string,
    nm_store: string,
    email: string,
    no_telp: string,
    nib: string,
    nik_ktp: string,
    rekening: string,
    ktpFileName: string
  ): Promise<Seller | null> {
    console.log("Calling sellerService.registerSeller for store:", nm_store);

    const bankParts = rekening.split("-");
    const nama_bank = bankParts[0]?.trim() || "BCA";
    const no_rek = bankParts[1]?.trim() || rekening;

    const newSeller: Seller = {
      id_seller: typeof crypto !== "undefined" ? crypto.randomUUID() : `s-${Math.random().toString(36).substr(2, 9)}`,
      id_user: userId,
      nm_store,
      deskripsi: `Selamat datang di ${nm_store}`,
      logo_toko: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=100&auto=format&fit=crop",
      email,
      no_telp,
      addr: "Indonesia",
      img_ktp: ktpFileName,
      nik_ktp,
      nib,
      nama_bank,
      no_rek,
      atas_nama_rek: "Pemilik Toko",
      is_verified: false, // verification queue
      created_at: new Date().toISOString()
    };

    if (isPlaceholder()) {
      console.warn("Using fallback local storage register seller");
      const stored = localStorage.getItem("pelum_sellers");
      const sellers = stored ? JSON.parse(stored) : [];
      sellers.push(newSeller);
      localStorage.setItem("pelum_sellers", JSON.stringify(sellers));

      // Sync role change in local storage user
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id_user === userId) {
        currentUser.role = "seller";
        authService.setCurrentUser(currentUser);
      }

      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as User[];
        const idx = users.findIndex(u => u.id_user === userId);
        if (idx !== -1) {
          users[idx].role = "seller";
          localStorage.setItem("pelum_users", JSON.stringify(users));
        }
      }
      return newSeller;
    }

    try {
      // 1. Insert seller record
      const { error: insertErr } = await supabase
        .from("seller")
        .insert({
          id_seller: newSeller.id_seller,
          id_user: newSeller.id_user,
          nm_store: newSeller.nm_store,
          deskripsi: newSeller.deskripsi,
          logo_toko: newSeller.logo_toko,
          email: newSeller.email,
          no_telp: newSeller.no_telp,
          addr: newSeller.addr,
          img_ktp: newSeller.img_ktp,
          nik_ktp: newSeller.nik_ktp,
          nib: newSeller.nib,
          nama_bank: newSeller.nama_bank,
          no_rek: newSeller.no_rek,
          atas_nama_rek: newSeller.atas_nama_rek,
          is_verified: newSeller.is_verified
        });

      if (insertErr) {
        console.error("Supabase insert seller error:", insertErr);
        return null;
      }

      // 2. Update user role in users table to 'seller'
      const { error: updateErr } = await supabase
        .from("users")
        .update({ role: "seller" })
        .eq("id_user", userId);

      if (updateErr) {
        console.error("Supabase update user role to seller failed:", updateErr);
      }

      // 3. Update current logged-in user state
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id_user === userId) {
        currentUser.role = "seller";
        authService.setCurrentUser(currentUser);
      }

      return newSeller;
    } catch (err) {
      console.error("sellerService registerSeller request failed:", err);
      return null;
    }
  },

  // Get all sellers (for superadmin verification list)
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

  // Verify / Approve / Reject seller store
  async verifySeller(sellerId: string, isVerified: boolean): Promise<boolean> {
    console.log(`Calling sellerService.verifySeller for seller ID ${sellerId} with status ${isVerified}`);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      if (stored) {
        const sellers = JSON.parse(stored) as Seller[];
        const idx = sellers.findIndex(s => s.id_seller === sellerId);
        if (idx !== -1) {
          sellers[idx].is_verified = isVerified;
          localStorage.setItem("pelum_sellers", JSON.stringify(sellers));
          return true;
        }
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from("seller")
        .update({ is_verified: isVerified })
        .eq("id_seller", sellerId);

      if (error) {
        console.error("Supabase update verify status error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("sellerService verifySeller failed:", err);
      return false;
    }
  }
};
