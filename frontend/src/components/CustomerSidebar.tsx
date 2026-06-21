"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/backend/authService";

export default function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    const handleStorage = () => setUser(authService.getCurrentUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  };

  const menuItems = [
    { name: "Biodata", href: "/account/profile", icon: "person" },
    { name: "Alamat", href: "/account/address", icon: "location_on" },
    { name: "Pesanan Saya", href: "/account/orders", icon: "receipt" },
    { name: "Keamanan", href: "/account/security", icon: "shield" },
    { name: "Seller", href: "/account/seller", icon: "storefront" },
  ];

  const displayName = user?.nama_lengkap || user?.username || "Pengguna";
  const avatarSrc = user?.avatar || null;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="space-y-6">
      <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-6">
        {/* User details header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-surface-container-high bg-zinc-200 flex items-center justify-center shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="User Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-zinc-500">{initial}</span>
            )}
          </div>
          <div className="space-y-0.5 min-w-0">
            <h3 className="font-headline font-bold text-on-surface text-base leading-tight truncate">{displayName}</h3>
            <span className="inline-block bg-surface-container text-secondary text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border border-surface-container-high">
              Member Silver
            </span>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider transition ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-secondary hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-surface-container my-3"></div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider text-error hover:bg-error-container/20 transition w-full text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Keluar</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
