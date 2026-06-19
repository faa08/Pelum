"use client";

import React from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const pendingActions = [
    {
      id: "REQ-009",
      target: "Batik Cantik Makmur",
      type: "Verifikasi Toko",
      date: "19 Juni 2026",
      desc: "Menunggu verifikasi NIB dan KTP Pemilik",
      status: "Tertunda"
    },
    {
      id: "REQ-008",
      target: "Keripik Singkong Renyah",
      type: "Verifikasi Toko",
      date: "19 Juni 2026",
      desc: "NIB terunggah, menunggu persetujuan admin",
      status: "Tertunda"
    },
    {
      id: "REPORT-02",
      target: "Solo Jaya Batik",
      type: "Laporan Pelanggaran",
      date: "18 Juni 2026",
      desc: "Laporan barang palsu/hak cipta batik tulis",
      status: "Perlu Review"
    }
  ];

  const recentStores = [
    { name: "Toko Craft Nusantara", owner: "Adi Wijaya", category: "Kerajinan", status: "Aktif", date: "18 Jun 2026" },
    { name: "Batik Sogan Solo", owner: "Sri Rahmi", category: "Fashion", status: "Aktif", date: "17 Jun 2026" },
    { name: "Sambal Bu Rudi", owner: "Rudi Hartono", category: "Kuliner", status: "Aktif", date: "17 Jun 2026" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Time Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Dashboard Superadmin</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Ringkasan data, verifikasi registrasi UMKM, dan transaksi di seluruh ekosistem Pelataran UMKM.
          </p>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Total Transaksi (Bulan Ini)</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">Rp 148.920.000</h3>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">trending_up</span> +18.4% bln lalu
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">payments</span>
          </div>
        </div>

        <Link href="/admin/stores" className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Toko Terdaftar</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">1,240 Toko</h3>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">add</span> 24 Toko baru minggu ini
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl">storefront</span>
          </div>
        </Link>

        <Link href="/admin/verification" className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Pending Verifikasi</p>
            <h3 className="font-headline text-lg font-extrabold text-red-600">8 Toko</h3>
            <p className="text-[10px] text-red-600 font-bold">Harus segera direview</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <span className="material-symbols-outlined text-xl">verified_user</span>
          </div>
        </Link>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Total Produk Aktif</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">14,890 Item</h3>
            <p className="text-[10px] text-secondary font-semibold">Tersedia di pasar digital</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl">inventory_2</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Pending Verifications vs Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Pending Verifications list */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-container rounded-xl shadow-sm">
            <div className="p-6 border-b border-surface-container flex justify-between items-center">
              <div>
                <h4 className="font-headline font-bold text-lg text-on-surface">Antrian Tindakan Admin</h4>
                <p className="text-xs text-secondary mt-0.5">Daftar permohonan verifikasi toko dan aduan pelanggaran produk.</p>
              </div>
              <Link href="/admin/verification" className="text-primary font-bold text-xs hover:underline">Lihat Semua</Link>
            </div>
            
            <div className="divide-y divide-surface-container">
              {pendingActions.map((action, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-surface-container-low/30 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs bg-surface-container text-[#ff6f00] px-2 py-0.5 rounded border border-surface-container-high">{action.type}</span>
                      <span className="text-xs text-secondary">•</span>
                      <span className="text-xs font-semibold text-secondary">{action.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">Toko: {action.target}</p>
                    <p className="text-xs text-secondary">{action.desc}</p>
                  </div>
                  
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${action.status === "Perlu Review" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>{action.status}</span>
                    <Link 
                      href="/admin/verification"
                      className="px-3 py-1 bg-[#ff6f00] text-white font-bold text-[11px] rounded hover:brightness-95 transition"
                    >
                      Proses
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right 1 Column: Shortcut Tools & Activity Feed */}
        <section className="space-y-6">
          <div className="bg-white border border-surface-container p-6 rounded-xl shadow-sm space-y-4">
            <h4 className="font-headline font-bold text-lg text-on-surface">Toko Baru Mendaftar</h4>
            <div className="space-y-4">
              {recentStores.map((store, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-on-surface">{store.name}</p>
                    <p className="text-secondary">Owner: {store.owner} • {store.category}</p>
                  </div>
                  <span className="text-[10px] text-secondary font-bold">{store.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-surface-container p-6 rounded-xl shadow-sm space-y-4">
            <h4 className="font-headline font-bold text-lg text-on-surface">Bantuan Cepat</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Link href="/admin/stores" className="p-4 border border-surface-container rounded-lg hover:bg-surface-container-low hover:border-primary-container/20 transition flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl text-primary">storefront</span>
                <span className="text-xs font-bold text-on-surface">Kelola Toko</span>
              </Link>
              <Link href="/admin/transactions" className="p-4 border border-surface-container rounded-lg hover:bg-surface-container-low hover:border-primary-container/20 transition flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl text-secondary">receipt_long</span>
                <span className="text-xs font-bold text-on-surface">Cek Keuangan</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
