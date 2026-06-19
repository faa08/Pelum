"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SellerDashboardPage() {
  const [storeStatus, setStoreStatus] = useState("Buka");
  
  const pendingOrders = [
    {
      id: "TRX-82741",
      customer: "Budi Santoso",
      date: "19 Juni 2026",
      items: "2x Kain Batik Parang, 1x Syal Indigo",
      total: 1083000,
      status: "Perlu Dikirim"
    },
    {
      id: "TRX-82739",
      customer: "Lani Wijaya",
      date: "18 Juni 2026",
      items: "1x Kemeja Batik Modern",
      total: 340000,
      status: "Perlu Dikirim"
    },
    {
      id: "TRX-82735",
      customer: "Hendra Wijaya",
      date: "18 Juni 2026",
      items: "3x Dompet Kulit Handmade",
      total: 630000,
      status: "Perlu Konfirmasi"
    }
  ];

  const recentReviews = [
    {
      user: "Siti R.",
      rating: 5,
      comment: "Kain batiknya bagus sekali, jahitannya rapi dan pengiriman cepat. Terima kasih!",
      product: "Batik Parang Premium"
    },
    {
      user: "Dewi A.",
      rating: 4,
      comment: "Warna syal sedikit lebih gelap dari foto, tapi kualitas bahan sutranya juara.",
      product: "Syal Sutra Indigo"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="bg-white border border-surface-container rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Selamat Datang Kembali, Batik Solo Hub!</h2>
          <p className="font-body text-body-md text-secondary">
            Toko Anda aktif dan berjalan dengan baik. Cek penjualan terbaru hari ini.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#F5F5F5] border border-surface-container px-4 py-2 rounded-lg">
          <span className="text-xs font-bold text-secondary">Status Toko:</span>
          <span className={`w-2.5 h-2.5 rounded-full ${storeStatus === "Buka" ? "bg-green-600 animate-pulse" : "bg-red-600"}`}></span>
          <select 
            value={storeStatus} 
            onChange={(e) => setStoreStatus(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-on-surface outline-none cursor-pointer"
          >
            <option value="Buka">Buka (Menerima Pesanan)</option>
            <option value="Tutup">Tutup (Libur)</option>
          </select>
        </div>
      </section>

      {/* Stats Cards Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Penjualan Hari Ini</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">Rp 1.423.000</h3>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> +15.2% vs kemarin
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff6f00]">
            <span className="material-symbols-outlined text-xl">payments</span>
          </div>
        </div>

        {/* Stat 2 */}
        <Link href="/seller/orders" className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Pesanan Baru</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">3 Pesanan</h3>
            <p className="text-[10px] text-[#ff6f00] font-bold">Perlu diproses segera</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
          </div>
        </Link>

        {/* Stat 3 */}
        <Link href="/seller/products" className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Produk Aktif</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">24 Item</h3>
            <p className="text-[10px] text-secondary font-semibold">1 habis / 2 stok menipis</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl">inventory_2</span>
          </div>
        </Link>

        {/* Stat 4 */}
        <Link href="/seller/analytics" className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Pengunjung Toko</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">384 Hari Ini</h3>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-xs">trending_up</span> +8.4% bln lalu
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff6f00]">
            <span className="material-symbols-outlined text-xl">groups</span>
          </div>
        </Link>
      </section>

      {/* Main Grid: Pending Action vs Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Orders Waiting for Processing */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-container rounded-xl shadow-sm">
            <div className="p-6 border-b border-surface-container flex justify-between items-center">
              <div>
                <h4 className="font-headline font-bold text-lg text-on-surface">Pesanan Perlu Diproses</h4>
                <p className="text-xs text-secondary mt-0.5">Kirimkan pesanan tepat waktu untuk menjaga reputasi toko Anda.</p>
              </div>
              <Link href="/seller/orders" className="text-primary font-bold text-xs hover:underline">Semua Pesanan</Link>
            </div>
            
            <div className="divide-y divide-surface-container">
              {pendingOrders.map((order, idx) => (
                <div key={idx} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-surface-container-low/30 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#ff6f00]">{order.id}</span>
                      <span className="text-xs text-secondary">•</span>
                      <span className="text-xs font-semibold text-secondary">{order.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{order.items}</p>
                    <p className="text-xs text-secondary">Pembeli: <span className="font-bold text-on-surface">{order.customer}</span></p>
                  </div>
                  
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                    <span className="font-bold text-on-surface text-sm">Rp {order.total.toLocaleString("id-ID")}</span>
                    <div className="flex gap-2">
                      {order.status === "Perlu Dikirim" ? (
                        <button 
                          onClick={() => alert(`Memproses pengiriman untuk ${order.id}`)}
                          className="px-3 py-1 bg-[#ff6f00] text-white font-bold text-[11px] rounded hover:brightness-95 transition"
                        >
                          Kirim Resi
                        </button>
                      ) : (
                        <button 
                          onClick={() => alert(`Konfirmasi pesanan ${order.id}`)}
                          className="px-3 py-1 bg-zinc-800 text-white font-bold text-[11px] rounded hover:bg-zinc-700 transition"
                        >
                          Konfirmasi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews section */}
          <div className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
            <h4 className="font-headline font-bold text-lg text-on-surface">Ulasan Pelanggan Terbaru</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentReviews.map((rev, idx) => (
                <div key={idx} className="p-4 bg-surface-container-low border border-surface-container rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-on-surface">{rev.user}</span>
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-on-surface font-medium leading-relaxed">"{rev.comment}"</p>
                  <p className="text-[9px] uppercase tracking-wider text-secondary font-bold">Produk: {rev.product}</p>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Right 1 Column: Quick Tools and Help Center */}
        <section className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white border border-surface-container p-6 rounded-xl shadow-sm space-y-4">
            <h4 className="font-headline font-bold text-lg text-on-surface">Menu Pintasan</h4>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/seller/products" 
                className="p-4 border border-surface-container rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary-container/20 transition text-center"
              >
                <span className="material-symbols-outlined text-2xl text-primary">add_circle</span>
                <span className="text-xs font-bold text-on-surface">Tambah Produk</span>
              </Link>
              <Link 
                href="/seller/orders" 
                className="p-4 border border-surface-container rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary-container/20 transition text-center"
              >
                <span className="material-symbols-outlined text-2xl text-secondary">local_shipping</span>
                <span className="text-xs font-bold text-on-surface">Proses Kirim</span>
              </Link>
              <Link 
                href="/seller/analytics" 
                className="p-4 border border-surface-container rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary-container/20 transition text-center"
              >
                <span className="material-symbols-outlined text-2xl text-secondary">insights</span>
                <span className="text-xs font-bold text-on-surface">Lihat Statistik</span>
              </Link>
              <Link 
                href="/seller/settings" 
                className="p-4 border border-surface-container rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-surface-container-low hover:border-primary-container/20 transition text-center"
              >
                <span className="material-symbols-outlined text-2xl text-secondary">settings</span>
                <span className="text-xs font-bold text-on-surface">Atur Kurir</span>
              </Link>
            </div>
          </div>

          {/* Seller Tips & Announcements */}
          <div className="bg-white border border-surface-container p-6 rounded-xl shadow-sm space-y-4">
            <h4 className="font-headline font-bold text-lg text-on-surface">Tips Sukses UMKM</h4>
            <div className="space-y-3 divide-y divide-surface-container text-xs">
              <div className="space-y-1.5 pb-3">
                <span className="inline-block bg-orange-100 text-[#9e4200] font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">Pemasaran</span>
                <h5 className="font-bold text-on-surface">Optimalkan Deskripsi & Foto Produk Anda</h5>
                <p className="text-secondary leading-relaxed font-medium">Pembeli online sangat bergantung pada foto berkualitas tinggi dan deskripsi detail produk lokal Anda.</p>
              </div>
              <div className="space-y-1.5 pt-3">
                <span className="inline-block bg-green-100 text-green-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">Event</span>
                <h5 className="font-bold text-on-surface">Daftar Festival Digital UMKM</h5>
                <p className="text-secondary leading-relaxed font-medium">Dapatkan diskon subsidi pengiriman dari superadmin selama periode festival berlangsung.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
