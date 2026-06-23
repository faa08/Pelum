import { supabase } from "./supabase";

export interface User {
  id_user: string;
  username: string;
  email: string;
  nama_lengkap: string;
  no_telp: string;
  avatar: string;
  role: "customer" | "seller" | "admin";
  created_at: string;
  nama_toko?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
}

export interface ProfileUpdate {
  nama_lengkap?: string;
  no_telp?: string;
  username?: string;
  avatar?: string;
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

export const authService = {
  // Save active user session locally
  setCurrentUser(user: User | null): void {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("pelum_current_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("pelum_current_user");
      }
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pelum_current_user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  // Login authentication
  async login(email: string, password?: string): Promise<User | null> {
    console.log("Calling authService.login for email:", email);
    
    if (isPlaceholder()) {
      console.warn("Using fallback local storage login (no Supabase config found)");
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as any[];
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          if (password && user.password && user.password !== password) {
            console.error("Login failed: password mismatch");
            return null;
          }
          this.setCurrentUser(user);
          return user;
        }
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.warn("Supabase login: Email not found in database:", email);
        } else {
          console.error("Supabase login query error:", error.message || error);
        }
        return null;
      }

      if (data) {
        // Password verification (check plain text password)
        if (password && data.password && data.password !== password) {
          console.error("Login failed: password mismatch");
          return null;
        }

        let userRole = data.role;
        if (data.username === "admin_pelum" || data.username === "admin" || (data.email && data.email.includes("admin"))) {
          userRole = "admin";
        }

        const loggedUser: User = {
          id_user: data.id_user,
          username: data.username,
          email: data.email,
          nama_lengkap: data.nama_lengkap || data.username,
          no_telp: data.no_telp || "",
          avatar: data.avatar || "",
          role: userRole,
          created_at: data.created_at
        };
        this.setCurrentUser(loggedUser);
        return loggedUser;
      }
      return null;
    } catch (err) {
      console.error("Auth login request failed:", err);
      return null;
    }
  },

  // Google OAuth Login
  async loginWithGoogle(): Promise<any> {
    console.log("Calling authService.loginWithGoogle");
    if (isPlaceholder()) {
      alert("Google OAuth tidak aktif pada environment lokal tanpa konfigurasi Supabase.");
      return null;
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Google OAuth sign in failed:", err);
      return null;
    }
  },

  // Register new user
  async register(username: string, email: string, no_telp: string, password?: string, tanggal_lahir?: string): Promise<User | null> {
    console.log("Calling authService.register for:", username);

    // Check if email already exists first to avoid duplicate DB insertion errors
    const emailExists = await this.checkEmailExists(email);
    if (emailExists) {
      throw new Error("Email sudah terdaftar! Silakan gunakan email lain atau masuk.");
    }

    const newUser: User = {
      id_user: typeof crypto !== "undefined" ? crypto.randomUUID() : `u-${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      nama_lengkap: username,
      no_telp,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
      role: "customer",
      created_at: new Date().toISOString(),
      tanggal_lahir
    };

    if (isPlaceholder()) {
      console.warn("Using fallback local storage register (no Supabase config found)");
      const storedUsers = localStorage.getItem("pelum_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      users.push({ ...newUser, password });
      localStorage.setItem("pelum_users", JSON.stringify(users));
      return newUser;
    }

    try {
      const { error } = await supabase
        .from("users")
        .insert({
          id_user: newUser.id_user,
          username: newUser.username,
          password: password || "no-password-plain", 
          email: newUser.email,
          nama_lengkap: newUser.nama_lengkap,
          no_telp: newUser.no_telp,
          avatar: newUser.avatar,
          role: newUser.role,
          tanggal_lahir: newUser.tanggal_lahir
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Email atau Username sudah terdaftar!");
        }
        console.error("Supabase insert user failed:", error.message || error);
        throw new Error(error.message);
      }

      return newUser;
    } catch (err: any) {
      console.error("Auth register failed:", err);
      throw err;
    }
  },

  // Reset password
  async resetPassword(email: string, newPassword?: string): Promise<boolean> {
    console.log("Calling authService.resetPassword for:", email);

    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as any[];
        const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (idx !== -1) {
          users[idx].password = newPassword;
          localStorage.setItem("pelum_users", JSON.stringify(users));
          return true;
        }
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ password: newPassword })
        .eq("email", email);

      if (error) {
        console.error("Supabase reset password failed:", error.message || error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Auth resetPassword failed:", err);
      return false;
    }
  },

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    console.log("Calling authService.checkEmailExists for:", email);

    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as any[];
        return users.some(u => u.email.toLowerCase() === email.toLowerCase());
      }
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        console.error("Supabase checkEmailExists failed:", error.message || error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error("Auth checkEmailExists failed:", err);
      return false;
    }
  },

  async updateProfile(id_user: string, nama_lengkap: string, no_telp: string, extra?: ProfileUpdate): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    // Merge all fields that can be updated
    const fields: ProfileUpdate = {
      nama_lengkap,
      no_telp,
      ...extra,
    };

    const updatedUser: User = { ...currentUser, ...fields };
    this.setCurrentUser(updatedUser);

    if (isPlaceholder()) {
      const storedUsers = localStorage.getItem("pelum_users");
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as User[];
        const idx = users.findIndex(u => u.id_user === id_user);
        if (idx !== -1) {
          users[idx] = updatedUser;
          localStorage.setItem("pelum_users", JSON.stringify(users));
        }
      }
      return true;
    }

    try {
      // Build only non-undefined fields to avoid overwriting with null
      const supabaseFields: Record<string, string> = {};
      if (fields.nama_lengkap !== undefined) supabaseFields.nama_lengkap = fields.nama_lengkap;
      if (fields.no_telp !== undefined)      supabaseFields.no_telp      = fields.no_telp;
      if (fields.username !== undefined)     supabaseFields.username     = fields.username;
      if (fields.avatar !== undefined)       supabaseFields.avatar       = fields.avatar;

      const { error } = await supabase
        .from("users")
        .update(supabaseFields)
        .eq("id_user", id_user);

      if (error) {
        console.error("Supabase update profile failed:", error.message || error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Auth updateProfile failed:", err);
      return false;
    }
  },

  logout(): void {
    this.setCurrentUser(null);
  }
};
