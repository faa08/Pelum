"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { authService } from "@/backend/authService";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== "admin") {
      router.replace("/masuk?msg=please_login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FCFCFA] text-[#5C5550] text-sm font-semibold">
        Memverifikasi sesi superadmin...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FCFCFA]">
      {/* Superadmin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="ml-72 flex-1 p-8 min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
