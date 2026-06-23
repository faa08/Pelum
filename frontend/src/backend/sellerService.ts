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
  is_verified?: boolean;
  users?: {
    nama_lengkap: string;
  };
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
      const sellers = stored ? JSON.parse(stored) : [];
      const storedUsers = localStorage.getItem("pelum_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      return sellers.map((s: any) => {
        const foundUser = users.find((u: any) => u.id_user === s.id_user);
        return {
          ...s,
          users: foundUser ? { nama_lengkap: foundUser.nama_lengkap } : { nama_lengkap: "Tanpa Nama" }
        };
      });
    }

    try {
      const { data, error } = await supabase
        .from("seller")
        .select(`
          *,
          users(nama_lengkap)
        `)
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
    atas_nama_rek: string,
    is_verified: boolean = false,
    nama_pemilik?: string,
    logo_toko?: string
  ): Promise<Seller | null> {
    console.log("Calling sellerService.createStore for:", nm_store);

    let id_user = "";

    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      let foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        const generatedUsername = email.split("@")[0] + "_" + Math.random().toString(36).substr(2, 4);
        foundUser = {
          id_user: `u-${Math.random().toString(36).substr(2, 9)}`,
          username: generatedUsername,
          email: email,
          nama_lengkap: nama_pemilik || nm_store,
          no_telp: no_telp || "",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
          role: "seller",
          created_at: new Date().toISOString()
        };
        users.push(foundUser);
        localStorage.setItem("pelum_users", JSON.stringify(users));
      } else {
        foundUser.role = "seller";
        if (nama_pemilik) foundUser.nama_lengkap = nama_pemilik;
        localStorage.setItem("pelum_users", JSON.stringify(users));
      }
      id_user = foundUser.id_user;

      const storedSellers = localStorage.getItem("pelum_sellers");
      const sellers = storedSellers ? JSON.parse(storedSellers) : [];
      
      if (sellers.some((s: any) => s.id_user === id_user)) {
        console.error("User with this email is already a seller.");
        return null;
      }

      const newStore: Seller = {
        id_seller: `s-${Math.random().toString(36).substr(2, 9)}`,
        id_user,
        nm_store,
        deskripsi: deskripsi || `Selamat datang di ${nm_store}`,
        logo_toko: logo_toko || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
        email,
        no_telp,
        addr: addr || "Indonesia",
        nama_bank,
        no_rek,
        atas_nama_rek,
        created_at: new Date().toISOString(),
        is_verified
      };

      sellers.push(newStore);
      localStorage.setItem("pelum_sellers", JSON.stringify(sellers));
      return newStore;
    }

    try {
      const { data: existingUser, error: findUserError } = await supabase
        .from("users")
        .select("id_user, role")
        .eq("email", email)
        .maybeSingle();

      if (findUserError) throw findUserError;

      if (existingUser) {
        id_user = existingUser.id_user;
        const updates: any = {};
        if (existingUser.role !== "seller" && existingUser.role !== "admin") {
          updates.role = "seller";
        }
        if (nama_pemilik) {
          updates.nama_lengkap = nama_pemilik;
        }
        if (Object.keys(updates).length > 0) {
          const { error: updateRoleError } = await supabase
            .from("users")
            .update(updates)
            .eq("id_user", id_user);
          if (updateRoleError) throw updateRoleError;
        }
      } else {
        const generatedId = typeof crypto !== "undefined" ? crypto.randomUUID() : `u-${Math.random().toString(36).substr(2, 9)}`;
        const generatedUsername = email.split("@")[0] + "_" + Math.random().toString(36).substr(2, 4);
        const { error: createUserError } = await supabase
          .from("users")
          .insert({
            id_user: generatedId,
            username: generatedUsername,
            email: email,
            nama_lengkap: nama_pemilik || nm_store,
            no_telp: no_telp,
            password: "no-password-plain",
            role: "seller",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
          });

        if (createUserError) throw createUserError;
        id_user = generatedId;
      }

      const { data: existingSeller } = await supabase
        .from("seller")
        .select("id_seller")
        .eq("id_user", id_user)
        .maybeSingle();

      if (existingSeller) {
        throw new Error("Pengguna dengan email ini sudah terdaftar sebagai toko!");
      }

      const id_seller = typeof crypto !== "undefined" ? crypto.randomUUID() : `s-${Math.random().toString(36).substr(2, 9)}`;
      const { error: insertStoreError } = await supabase
        .from("seller")
        .insert({
          id_seller,
          id_user,
          nm_store,
          deskripsi: deskripsi || `Selamat datang di ${nm_store}`,
          logo_toko: logo_toko || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
          email,
          no_telp,
          addr,
          nama_bank,
          no_rek,
          atas_nama_rek,
          is_verified
        });

      if (insertStoreError) throw insertStoreError;

      return {
        id_seller,
        id_user,
        nm_store,
        deskripsi,
        logo_toko: logo_toko || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
        email,
        no_telp,
        addr,
        nama_bank,
        no_rek,
        atas_nama_rek,
        created_at: new Date().toISOString(),
        is_verified
      };
    } catch (err: any) {
      console.error("sellerService.createStore failed:", err);
      return null;
    }
  },

  // Admin: Verify/Unverify a seller
  async verifySeller(id: string, is_verified: boolean = true): Promise<boolean> {
    console.log(`Calling sellerService.verifySeller for ${id} to ${is_verified}`);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      if (stored) {
        const sellers = JSON.parse(stored) as Seller[];
        const idx = sellers.findIndex(s => s.id_seller === id);
        if (idx !== -1) {
          sellers[idx].is_verified = is_verified;
          localStorage.setItem("pelum_sellers", JSON.stringify(sellers));
          return true;
        }
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from("seller")
        .update({ is_verified })
        .eq("id_seller", id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("sellerService.verifySeller failed:", err);
      return false;
    }
  },

  // Admin: Delete/Block a seller
  async deleteSeller(id: string): Promise<boolean> {
    console.log("Calling sellerService.deleteSeller for:", id);

    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_sellers");
      if (stored) {
        const sellers = JSON.parse(stored) as Seller[];
        const updated = sellers.filter(s => s.id_seller !== id);
        localStorage.setItem("pelum_sellers", JSON.stringify(updated));
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from("seller")
        .delete()
        .eq("id_seller", id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("sellerService.deleteSeller failed:", err);
      return false;
    }
  }
};
