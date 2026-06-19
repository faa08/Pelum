"use client";

import React from "react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Dashboard</h2>
        <p className="font-body text-body-md text-[#8E8680] mt-1">
          Ringkasan performa platform Pelataran UMKM hari ini.
        </p>
      </header>

      {/* 4 Stats Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total UMKM Terdaftar */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#FFF3ED] flex items-center justify-center text-[#E8600A] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Total UMKM Terdaftar</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] leading-none">24,512</h3>
                <span className="flex items-center text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold">
                  <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
                  12%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Produk Aktif */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#F5F3F0] flex items-center justify-center text-[#5C5550] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Produk Aktif</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] leading-none">142,082</h3>
                <span className="flex items-center text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold">
                  <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
                  8%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Transaksi */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#F5F3F0] flex items-center justify-center text-[#5C5550] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Total Transaksi</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] leading-none">Rp 4.2B</h3>
                <span className="flex items-center text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold">
                  <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
                  15.4%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Antrian Verifikasi */}
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#FFF3ED] flex items-center justify-center text-[#E8600A] flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">assignment_turned_in</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8E8680] tracking-wider">Antrian Verifikasi</p>
              <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18] mt-1 leading-none">184 Toko</h3>
              <p className="text-[9px] text-[#E8600A] font-bold mt-1">24 Pending</p>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Growth Chart Section */}
      <section className="bg-white border border-[#EAE5E0] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-headline text-lg font-bold text-[#1F1B18]">Grafik Pertumbuhan Transaksi</h3>
            <p className="text-xs text-[#8E8680] mt-0.5">Data akumulasi transaksi UMKM periode 2024</p>
          </div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 border border-[#EAE5E0] text-[#5C5550] font-semibold text-xs rounded hover:bg-[#F5F3F0] transition">
              <span>Bulanan</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        </div>

        {/* Custom SVG Chart Area */}
        <div className="relative w-full h-[300px]">
          <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8600A" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#E8600A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="#F5F3F0" strokeWidth="1" />
            <line x1="0" y1="110" x2="800" y2="110" stroke="#F5F3F0" strokeWidth="1" />
            <line x1="0" y1="170" x2="800" y2="170" stroke="#F5F3F0" strokeWidth="1" />
            <line x1="0" y1="230" x2="800" y2="230" stroke="#F5F3F0" strokeWidth="1" />
            <line x1="0" y1="290" x2="800" y2="290" stroke="#F5F3F0" strokeWidth="1" />

            {/* Smooth Spline Curve Area */}
            <path
              d="M 0 280 C 100 240, 150 270, 220 220 C 290 170, 310 240, 360 210 C 410 180, 450 120, 520 230 C 590 320, 620 180, 680 140 C 740 100, 760 180, 800 270 L 800 300 L 0 300 Z"
              fill="url(#chartGradient)"
            />

            {/* Smooth Spline Curve Line */}
            <path
              d="M 0 280 C 100 240, 150 270, 220 220 C 290 170, 310 240, 360 210 C 410 180, 450 120, 520 230 C 590 320, 620 180, 680 140 C 740 100, 760 180, 800 270"
              fill="none"
              stroke="#E8600A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}
