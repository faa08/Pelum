"use client";

import React, { useState } from "react";

const INITIAL_ORDERS = [
  {
    id: "ORD-20260621-001",
    date: "21 Jun 2026, 10:15",
    buyer: "Budi Santoso",
    avatar: "BS",
    storeName: "Mitra Rotan Abadi",
    productName: "Tas Rotan Artisan 'Lestari'",
    productDetail: "Natural - Large (1 pcs)",
    productImg: "/product-dompet.png",
    total: 368000,
    status: "Perlu Dikirim"
  },
  {
    id: "ORD-20260620-002",
    date: "20 Jun 2026, 16:30",
    buyer: "Siti Rahayu",
    avatar: "SR",
    storeName: "Cokelat Nusantara",
    productName: "Paket Cokelat Artisan",
    productDetail: "Dark Milk - 250g (2 pcs)",
    productImg: "/product-kopi.png",
    total: 257000,
    status: "Dikirim"
  },
  {
    id: "ORD-20260619-003",
    date: "19 Jun 2026, 09:45",
    buyer: "Andi Darmawan",
    avatar: "AD",
    storeName: "Batik Kawung Jaya",
    productName: "Kemeja Batik Modern Slim",
    productDetail: "Sutra Kawung - XL (1 pcs)",
    productImg: "/product-batik.png",
    total: 342000,
    status: "Selesai"
  },
  {
    id: "ORD-20260618-004",
    date: "18 Jun 2026, 14:20",
    buyer: "Lina Marlina",
    avatar: "LM",
    storeName: "Sutra Kawung Jaya",
    productName: "Syal Sutra Motif Kawung",
    productDetail: "Merah - One Size (1 pcs)",
    productImg: "/product-skincare.png",
    total: 427000,
    status: "Belum Bayar"
  }
];

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Semua");
  
  const [orders, setOrders] = useState<any[]>(INITIAL_ORDERS);

  const tabs = ["Semua", "Belum Bayar", "Perlu Dikirim", "Dikirim", "Selesai", "Dibatalkan"];

  const needShippingCount = orders.filter((o) => o.status === "Perlu Dikirim").length;

  const handleShipOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Dikirim" } : o))
    );
    alert(`Pesanan ${id} berhasil diproses untuk pengiriman!`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "Semua" || o.status === activeTab;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Manajemen Pesanan</h2>
          <p className="font-body text-body-md text-[#5C5550] mt-1">
            Pantau dan kelola seluruh transaksi pesanan platform Pelataran UMKM.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8680] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari ID, Pelanggan, Toko, atau Produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#D5CFC9] rounded-lg bg-white text-xs font-body focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition text-[#1F1B18]"
          />
        </div>
      </header>

      {/* Filter Tabs */}
      <section className="bg-white border border-[#EAE5E0] rounded-lg p-1 flex flex-wrap gap-1 shadow-sm">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          const isShippingTab = tab === "Perlu Dikirim";
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-3 rounded font-bold text-xs uppercase tracking-wider transition ${
                isSelected
                  ? "bg-[#1D4ED8] text-white"
                  : "text-[#5C5550] hover:bg-[#F5F3F0] hover:text-[#1F1B18]"
              }`}
            >
              <span>{tab}</span>
              {isShippingTab && needShippingCount > 0 && (
                <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${isSelected ? "bg-white text-[#1D4ED8]" : "bg-[#1D4ED8] text-white"}`}>
                  {needShippingCount}
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* Orders List Table */}
      <section className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F3F0] border-b border-[#EAE5E0]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">ID Pesanan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Toko UMKM</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Produk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5E0]">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F5F3F0]/30 transition">
                  <td className="px-6 py-4 font-semibold text-sm text-[#1F1B18]">{order.id}</td>
                  <td className="px-6 py-4 text-xs text-[#8E8680] font-semibold">{order.date}</td>
                  <td className="px-6 py-4 text-xs text-[#1F1B18] font-bold">{order.storeName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F5F3F0] flex items-center justify-center font-bold text-xs text-[#8E8680] border border-[#EAE5E0]">
                        {order.avatar}
                      </div>
                      <span className="font-semibold text-xs text-[#1F1B18]">{order.buyer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F3F0] rounded overflow-hidden border border-[#EAE5E0]">
                        <img src={order.productImg} alt={order.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-[#1F1B18] leading-tight">{order.productName}</p>
                        <p className="text-[10px] text-[#8E8680] font-medium mt-0.5">{order.productDetail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-[#1D4ED8]">Rp {order.total.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          order.status === "Perlu Dikirim"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : order.status === "Belum Bayar"
                            ? "bg-zinc-100 text-[#5C5550] border-zinc-200"
                            : order.status === "Dikirim"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.status === "Perlu Dikirim" && (
                        <button
                          onClick={() => handleShipOrder(order.id)}
                          className="bg-[#1D4ED8] text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition"
                        >
                          Kirim Barang
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8E8680] text-sm font-semibold">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-[#F5F3F0]/40 border-t border-[#EAE5E0] flex items-center justify-between text-xs font-semibold text-[#8E8680]">
          <p>
            {orders.length > 0
              ? `Menampilkan ${filteredOrders.length} dari ${orders.length} pesanan`
              : "Tidak ada pesanan"}
          </p>
        </div>
      </section>
    </div>
  );
}
