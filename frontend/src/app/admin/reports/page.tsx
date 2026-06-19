"use client";

import React, { useState } from "react";

export default function AdminReportsPage() {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const chartData = [
    { label: "01 Jan", height: "40%", revenue: "Rp 8.5M" },
    { label: "03 Jan", height: "45%", revenue: "Rp 9.2M" },
    { label: "05 Jan", height: "35%", revenue: "Rp 7.0M" },
    { label: "07 Jan", height: "60%", revenue: "Rp 12.4M" },
    { label: "10 Jan", height: "55%", revenue: "Rp 11.0M" },
    { label: "14 Jan", height: "75%", revenue: "Rp 15.8M" },
    { label: "18 Jan", height: "90%", revenue: "Rp 18.5M" },
    { label: "21 Jan", height: "85%", revenue: "Rp 17.2M" },
    { label: "25 Jan", height: "80%", revenue: "Rp 16.0M" },
    { label: "28 Jan", height: "95%", revenue: "Rp 19.8M" },
    { label: "29 Jan", height: "70%", revenue: "Rp 14.5M" },
    { label: "31 Jan", height: "65%", revenue: "Rp 13.0M" },
  ];

  const stores = [
    {
      nama: "Batik Serayu",
      lokasi: "Pekalongan, Jawa Tengah",
      kategori: "Fashion",
      pesanan: "1,420",
      omzet: 82500000,
      rating: 4.9,
      status: "Verified",
      logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
    },
    {
      nama: "Sambal Mak Ijah",
      lokasi: "Surabaya, Jawa Timur",
      kategori: "Kuliner",
      pesanan: "2,850",
      omzet: 56700000,
      rating: 4.8,
      status: "Verified",
      logo: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=100&auto=format&fit=crop",
    },
    {
      nama: "Rotan Art Studio",
      lokasi: "Cirebon, Jawa Barat",
      kategori: "Kriya",
      pesanan: "430",
      omzet: 42100000,
      rating: 4.7,
      status: "Verified",
      logo: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=100&auto=format&fit=crop",
    },
    {
      nama: "Kopi Nusantara",
      lokasi: "Gayo, Aceh",
      kategori: "Kuliner",
      pesanan: "1,890",
      omzet: 38450000,
      rating: 4.9,
      status: "Premium",
      logo: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=100&auto=format&fit=crop",
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Laporan & Analitik</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Pantau performa ekosistem UMKM dan pertumbuhan pendapatan secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 border border-surface-container rounded-lg shadow-sm">
          <div className="flex items-center px-4 py-2 border-r border-surface-container text-sm">
            <span className="material-symbols-outlined text-secondary mr-2">calendar_today</span>
            <span className="font-semibold text-on-surface">1 Jan 2024 - 31 Jan 2024</span>
          </div>
          <button 
            onClick={() => alert("Mengekspor data analitik...")}
            className="px-4 py-2 bg-primary text-white font-bold text-sm rounded hover:brightness-95 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Data
          </button>
        </div>
      </header>

      {/* Analytics Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-2 hover:shadow-md transition">
          <div className="flex justify-between items-start text-secondary">
            <p className="text-xs uppercase font-bold tracking-wider">Total Pendapatan</p>
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
          </div>
          <h3 className="font-headline text-2xl font-extrabold text-on-surface">Rp 245.8M</h3>
          <div className="flex items-center gap-1 text-green-600 font-semibold text-xs">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12.4% vs bln lalu</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-2 hover:shadow-md transition">
          <div className="flex justify-between items-start text-secondary">
            <p className="text-xs uppercase font-bold tracking-wider">UMKM Aktif</p>
            <span className="material-symbols-outlined text-primary text-[20px]">store</span>
          </div>
          <h3 className="font-headline text-2xl font-extrabold text-on-surface">1,284</h3>
          <div className="flex items-center gap-1 text-green-600 font-semibold text-xs">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+85 toko baru</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-2 hover:shadow-md transition">
          <div className="flex justify-between items-start text-secondary">
            <p className="text-xs uppercase font-bold tracking-wider">Total Transaksi</p>
            <span className="material-symbols-outlined text-primary text-[20px]">shopping_cart</span>
          </div>
          <h3 className="font-headline text-2xl font-extrabold text-on-surface">42.5K</h3>
          <div className="flex items-center gap-1 text-green-600 font-semibold text-xs">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+5.2% vs bln lalu</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-2 hover:shadow-md transition">
          <div className="flex justify-between items-start text-secondary">
            <p className="text-xs uppercase font-bold tracking-wider">Kepuasan Pelanggan</p>
            <span className="material-symbols-outlined text-primary text-[20px]">star</span>
          </div>
          <h3 className="font-headline text-2xl font-extrabold text-on-surface">4.8/5.0</h3>
          <div className="flex items-center gap-1 text-secondary font-semibold text-xs">
            <span className="material-symbols-outlined text-sm">history</span>
            <span>Stabil (0.0)</span>
          </div>
        </div>
      </section>

      {/* Main Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Growth (2/3 col) */}
        <div className="lg:col-span-2 bg-white border border-surface-container p-6 rounded-xl space-y-6 shadow-sm">
          <div>
            <h4 className="font-headline font-bold text-lg text-on-surface">Pertumbuhan Pendapatan</h4>
            <p className="font-body text-xs text-secondary">Visualisasi performa harian periode Januari 2024</p>
          </div>
          
          <div className="h-64 w-full relative flex items-end gap-1 px-4 pt-6 border-b border-surface-container">
            {chartData.map((bar, i) => (
              <div 
                key={i} 
                className="flex-1 flex flex-col justify-end items-center h-full relative group cursor-pointer"
                onMouseEnter={() => setHoveredBarIndex(i)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                {/* Popover tooltip */}
                {hoveredBarIndex === i && (
                  <div className="absolute -top-6 bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded shadow z-10 whitespace-nowrap">
                    {bar.revenue}
                  </div>
                )}
                {/* Bar display */}
                <div 
                  className={`w-full rounded-t-sm transition duration-200 ${hoveredBarIndex === i ? "bg-primary-container brightness-95" : "bg-primary-container/20 border-t-2 border-primary-container"}`}
                  style={{ height: bar.height }}
                ></div>
              </div>
            ))}
            
            {/* Grid Line Marks */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 px-4 pb-6">
              <div className="border-b border-on-surface w-full"></div>
              <div className="border-b border-on-surface w-full"></div>
              <div className="border-b border-on-surface w-full"></div>
              <div className="border-b border-on-surface w-full"></div>
            </div>
          </div>
          
          <div className="flex justify-between px-4 text-[10px] font-bold text-secondary tracking-wider">
            <span>01 Jan</span>
            <span>07 Jan</span>
            <span>14 Jan</span>
            <span>21 Jan</span>
            <span>31 Jan</span>
          </div>
        </div>

        {/* Category Distribution (1/3 col) */}
        <div className="bg-white border border-surface-container p-6 rounded-xl space-y-6 flex flex-col shadow-sm">
          <div>
            <h4 className="font-headline font-bold text-lg text-on-surface">Distribusi Kategori</h4>
            <p className="font-body text-xs text-secondary">Berdasarkan volume penjualan</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative min-h-[160px]">
            {/* SVG Pie Chart Mock */}
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" fill="transparent" r="16" stroke="#ff6f00" strokeDasharray="45 100" strokeWidth="32"></circle>
              <circle cx="16" cy="16" fill="transparent" r="16" stroke="#ffb691" strokeDasharray="25 100" strokeDashoffset="-45" strokeWidth="32"></circle>
              <circle cx="16" cy="16" fill="transparent" r="16" stroke="#212121" strokeDasharray="20 100" strokeDashoffset="-70" strokeWidth="32"></circle>
              <circle cx="16" cy="16" fill="transparent" r="16" stroke="#EEEEEE" strokeDasharray="10 100" strokeDashoffset="-90" strokeWidth="32"></circle>
            </svg>
            <div className="absolute bg-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow">
              <span className="font-headline font-bold text-sm text-on-surface">Total</span>
              <span className="text-[10px] font-bold text-secondary">100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-secondary">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary-container"></div>
              <span>Kuliner (45%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-inverse-primary"></div>
              <span>Fashion (25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-zinc-800"></div>
              <span>Kriya (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#EEEEEE]"></div>
              <span>Jasa (10%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Performing Stores Table */}
      <section className="bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-container flex justify-between items-center">
          <div>
            <h4 className="font-headline font-bold text-lg text-on-surface">UMKM Berprestasi</h4>
            <p className="font-body text-xs text-secondary">Peringkat berdasarkan omzet tertinggi bulan ini</p>
          </div>
          <button className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
            Lihat Semua
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Toko UMKM</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Total Pesanan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Omzet</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Rating</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {stores.map((store, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-container-high rounded overflow-hidden">
                        <img src={store.logo} alt={store.nama} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{store.nama}</p>
                        <p className="text-[10px] text-secondary">{store.lokasi}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-secondary font-semibold">{store.kategori}</td>
                  <td className="px-6 py-4 text-xs text-on-surface font-semibold">{store.pesanan}</td>
                  <td className="px-6 py-4 font-bold text-sm text-primary">Rp {store.omzet.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="material-symbols-outlined text-[16px] text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-on-surface">{store.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${store.status === "Verified" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                      {store.status}
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
