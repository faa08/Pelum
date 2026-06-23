"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Headphones } from "lucide-react";
import Footer from "@/components/Footer";
import { useCustomerService } from "@/components/CustomerServiceProvider";

const NAV_ITEMS = [
  { label: "Pusat Bantuan", href: "/bantuan" },
  { label: "FAQ / Tanya Jawab", href: "/bantuan/faq" },
  { label: "Informasi Pengiriman", href: "/bantuan/info-pengiriman" },
  { label: "Syarat & Ketentuan", href: "/bantuan/syarat-ketentuan" },
];

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { open: openCustomerService } = useCustomerService();

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ── CUSTOM CARE HEADER ── */}
      <header className="bg-white border-b border-[#EAE5E0] sticky top-0 z-50 shadow-xs">
        <div className="max-w-[1200px] w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-secondary hover:text-primary transition"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="h-5 w-[1px] bg-[#EAE5E0]" />
            <Link href="/bantuan" className="flex items-center gap-2">
              <div className="logo-stripes-small">
                <span className="stripe-orange-small"></span>
                <span className="stripe-gray-small"></span>
              </div>
              <span className="logo-text-bold-small text-on-surface">Pelataran</span>
              <span className="bg-primary text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide">CARE</span>
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={openCustomerService}
              className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-[#1D4ED8] transition"
            >
              <Headphones size={15} />
              Customer Service
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-blue-950 flex items-center justify-center text-white text-xs font-bold border border-[#EAE5E0]">
              G
            </div>
            <span className="text-xs font-bold text-on-surface hidden sm:inline">game</span>
          </div>
        </div>
      </header>

      {/* ── HELP CENTER SUB-NAVBAR ── */}
      <div className="bg-white border-b border-[#EAE5E0] sticky top-16 z-40">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-6 h-12 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-bold transition-all relative py-3 h-full flex items-center whitespace-nowrap ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* Floating widget di halaman bantuan memakai tombol CS global (pojok kanan bawah) */}
      <Footer />
    </div>
  );
}
