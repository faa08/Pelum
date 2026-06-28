"use client";

import { useEffect } from "react";
import { supabase } from "@/backend/supabase";
import { authService } from "@/backend/authService";

export default function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    authService.refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        authService.setCurrentUser(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        authService.refreshSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
