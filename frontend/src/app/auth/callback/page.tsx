"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/backend/supabase";
import { authService } from "@/backend/authService";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // If Supabase is not configured, redirect back with error
        const isPlaceholder =
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

        if (isPlaceholder) {
          router.push("/masuk?error=no_supabase");
          return;
        }

        // Check for error parameters in URL query
        const searchParams = new URLSearchParams(window.location.search);
        const urlError = searchParams.get("error");
        const urlErrorDesc = searchParams.get("error_description");
        if (urlError) {
          console.error("OAuth error returned in URL query:", urlError, urlErrorDesc);
          router.push(`/masuk?error=${urlError}`);
          return;
        }

        // Exchange OAuth PKCE code if present in the query string
        const code = searchParams.get("code");
        if (code) {
          console.log("Exchanging auth code for session...");
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Code exchange failed:", exchangeError);
            router.push("/masuk?error=oauth_failed");
            return;
          }
        }

        // Fetch session
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.error("OAuth callback error: Session not found.", error);
          router.push("/masuk?error=oauth_failed");
          return;
        }

        const oauthUser = data.session.user;

        // Try to find existing user in our users table
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", oauthUser.email)
          .single();

        if (existingUser) {
          // User already exists — just log them in
          authService.setCurrentUser({
            id_user: existingUser.id_user,
            username: existingUser.username,
            email: existingUser.email,
            nama_lengkap: existingUser.nama_lengkap || existingUser.username,
            no_telp: existingUser.no_telp || "",
            avatar: existingUser.avatar || oauthUser.user_metadata?.avatar_url || "",
            role: existingUser.role,
            created_at: existingUser.created_at,
          });
        } else {
          // New user via Google — auto-register
          const displayName =
            oauthUser.user_metadata?.full_name ||
            oauthUser.user_metadata?.name ||
            oauthUser.email?.split("@")[0] ||
            "User";

          const newUser = {
            id_user: oauthUser.id,
            username: displayName,
            email: oauthUser.email ?? "",
            nama_lengkap: displayName,
            no_telp: "",
            avatar: oauthUser.user_metadata?.avatar_url || "",
            role: "customer" as const,
            created_at: new Date().toISOString(),
          };

          await supabase.from("users").insert({
            id_user: newUser.id_user,
            username: newUser.username,
            email: newUser.email,
            nama_lengkap: newUser.nama_lengkap,
            no_telp: newUser.no_telp,
            avatar: newUser.avatar,
            role: newUser.role,
          });

          authService.setCurrentUser(newUser);
        }

        router.push("/account/profile");
      } catch (err) {
        console.error("Auth callback failed:", err);
        router.push("/masuk?error=oauth_failed");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0EDEA]">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-secondary font-medium">Memverifikasi akun Anda...</p>
      </div>
    </div>
  );
}
