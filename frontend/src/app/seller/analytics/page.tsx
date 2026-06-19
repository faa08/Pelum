"use client";

import React from "react";

export default function SellerAnalyticsPage() {
  const topProducts = [
    {
      nama: "Batik Parang Premium",
      sku: "PRD-0012",
      kategori: "Kain Tradisional",
      terjual: 124,
      stok: "12 Pcs",
      pendapatan: 4340000,
      status: "Stok Menipis",
      logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
    },
    {
      nama: "Syal Sutra Indigo",
      sku: "PRD-0045",
      kategori: "Aksesoris",
      terjual: 98,
      stok: "45 Pcs",
      pendapatan: 2156000,
      status: "Aktif",
      logo: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=100&auto=format&fit=crop",
    },
    {
      nama: "Kemeja Batik Modern",
      sku: "PRD-0089",
      kategori: "Pakaian Pria",
      terjual: 82,
      stok: "30 Pcs",
      pendapatan: 1886000,
      status: "Aktif",
      logo: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=100&auto=format&fit=crop",
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Statistik Penjualan</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Ringkasan performa toko Anda selama 30 hari terakhir.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-surface-container text-secondary font-bold text-xs rounded hover:bg-surface-container transition">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            30 Hari Terakhir
          </button>
          <button 
            onClick={() => alert("Mengunduh laporan analitik seller...")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Unduh Laporan
          </button>
        </div>
      </header>

      {/* Metrics Overview Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Total Pendapatan</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">Rp 12.850.000</h3>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">trending_up</span> +12.5% bln lalu
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">payments</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Total Pesanan</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">482</h3>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">trending_up</span> +8.2% bln lalu
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Rata-rata Pesanan</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">Rp 26.659</h3>
            <p className="text-[10px] text-secondary font-bold">Stabil</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl">receipt_long</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Rating Toko</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">4.9/5.0</h3>
            <p className="text-[10px] text-[#9e4200] font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">check_circle</span> Sangat Memuaskan
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">star</span>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="bg-white border border-surface-container p-6 rounded-xl space-y-6 shadow-sm">
        <div className="flex justify-between items-center">
          <h4 className="font-headline font-bold text-lg text-on-surface">Tren Pendapatan</h4>
          <div className="flex items-center gap-1.5 text-xs font-bold text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
            <span>Pendapatan</span>
          </div>
        </div>
        
        {/* Draw a gorgeous SVG curved area graph */}
        <div className="h-64 w-full relative pt-6">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6f00" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ff6f00" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid helper lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="#eeeeee" strokeWidth="1" strokeDasharray="5" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="#eeeeee" strokeWidth="1" strokeDasharray="5" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="#eeeeee" strokeWidth="1" strokeDasharray="5" />

            {/* Filled area path */}
            <path
              d="M 0 200 L 0 150 C 100 130, 150 180, 200 160 C 300 130, 400 50, 500 80 C 600 130, 700 110, 800 50 L 800 200 Z"
              fill="url(#gradient)"
            />
            {/* Outline curve */}
            <path
              d="M 0 150 C 100 130, 150 180, 200 160 C 300 130, 400 50, 500 80 C 600 130, 700 110, 800 50"
              fill="none"
              stroke="#ff6f00"
              strokeWidth="3"
            />
          </svg>
        </div>
        
        <div className="flex justify-between text-xs font-bold text-secondary tracking-wider">
          <span>Minggu 1</span>
          <span>Minggu 2</span>
          <span>Minggu 3</span>
          <span>Minggu 4</span>
        </div>
      </section>

      {/* Top Performing items */}
      <section className="bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <h4 className="font-headline font-bold text-lg text-on-surface">Produk Terlaris</h4>
          <button className="text-primary font-bold hover:underline text-xs">Lihat Semua</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Produk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Terjual</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Stok</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Pendapatan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {topProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container overflow-hidden">
                        <img src={p.logo} alt={p.nama} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{p.nama}</p>
                        <p className="text-[10px] text-secondary font-medium">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-secondary font-semibold">{p.kategori}</td>
                  <td className="px-6 py-4 text-xs text-on-surface font-extrabold">{p.terjual}</td>
                  <td className="px-6 py-4 text-xs text-on-surface font-semibold">{p.stok}</td>
                  <td className="px-6 py-4 font-bold text-sm text-primary">Rp {p.pendapatan.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${p.status === "Aktif" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
