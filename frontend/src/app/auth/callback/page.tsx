"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/backend/supabase";
import { authService } from "@/backend/authService";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Memverifikasi akun Anda...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const isPlaceholder =
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

        if (isPlaceholder) {
          router.push("/masuk?error=no_supabase");
          return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const urlError = searchParams.get("error");
        if (urlError) {
          router.push(`/masuk?error=${urlError}`);
          return;
        }

        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("Code exchange failed:", exchangeError);
            router.push("/masuk?error=oauth_failed");
            return;
          }
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user?.email) {
          router.push("/masuk?error=oauth_failed");
          return;
        }

        setMessage("Menyinkronkan profil...");

        const res = await fetch("/api/auth/sync-profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ metadata: session.user.user_metadata }),
        });

        const data = await res.json();
        if (!res.ok || !data.user) {
          console.error("sync-profile failed:", data.error);
          router.push("/masuk?error=profile_sync_failed");
          return;
        }

        authService.setCurrentUser(data.user);

        if (typeof window !== "undefined") {
          localStorage.setItem("pelum-auth-verified", String(Date.now()));
        }

        if (data.user.role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/account/profile");
        }
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
        <p className="text-sm text-secondary font-medium">{message}</p>
      </div>
    </div>
  );
}
