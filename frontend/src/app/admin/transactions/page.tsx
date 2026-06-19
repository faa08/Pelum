"use client";

import React, { useState } from "react";

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([
    {
      id: "#ORD-2023-8902",
      date: "24 Oct 2023, 14:20",
      buyer: "Andi Mahendra",
      email: "andi.m@example.com",
      avatar: "AM",
      amount: 450000,
      status: "Completed",
    },
    {
      id: "#ORD-2023-8903",
      date: "24 Oct 2023, 15:45",
      buyer: "Siti Kusuma",
      email: "sitikus@mail.id",
      avatar: "SK",
      amount: 1200000,
      status: "Pending",
    },
    {
      id: "#ORD-2023-8904",
      date: "24 Oct 2023, 16:10",
      buyer: "Bambang Pamungkas",
      email: "bam.p@web.com",
      avatar: "BP",
      amount: 85000,
      status: "Processing",
    },
    {
      id: "#ORD-2023-8905",
      date: "25 Oct 2023, 09:12",
      buyer: "Rina Larasati",
      email: "rina.lar@shop.id",
      avatar: "RL",
      amount: 2150000,
      status: "Completed",
    },
    {
      id: "#ORD-2023-8906",
      date: "25 Oct 2023, 10:05",
      buyer: "Joko Kendil",
      email: "joko.k@mail.com",
      avatar: "JK",
      amount: 320000,
      status: "Cancelled",
    }
  ]);

  const filteredTransactions = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Transaksi</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Kelola dan pantau semua aliran transaksi UMKM secara real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-on-surface text-on-surface font-bold text-sm rounded-lg hover:bg-surface-container transition">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
          <button 
            onClick={() => alert("Mengunduh laporan transaksi...")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white font-bold text-sm rounded-lg hover:brightness-95 transition"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Unduh Laporan
          </button>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-surface-container p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs uppercase font-bold text-secondary tracking-wider">Total Volume</p>
            <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-primary">Rp 1.428.500.000</h3>
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 12.5% dari bulan lalu
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px]">payments</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs uppercase font-bold text-secondary tracking-wider">Total Transaksi</p>
            <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">8,245</h3>
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 8.2% dari bulan lalu
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px]">shopping_cart</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs uppercase font-bold text-secondary tracking-wider">Pending Payments</p>
            <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-error">142</h3>
            <p className="text-xs text-secondary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span> Menunggu verifikasi sistem
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px]">pending_actions</span>
          </div>
        </div>
      </section>

      {/* Detailed Transaction Table */}
      <section className="bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low/40">
          <h4 className="font-headline font-bold text-lg text-on-surface">Riwayat Transaksi</h4>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari Order ID atau Buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-surface-container-highest rounded-lg bg-surface text-xs font-body w-80 focus:outline-none focus:ring-2 focus:ring-primary-container transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Buyer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-surface-container-low/30 transition">
                  <td className="px-6 py-4 font-semibold text-sm text-on-surface">{t.id}</td>
                  <td className="px-6 py-4 text-xs text-secondary">{t.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary font-bold text-xs">
                        {t.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-on-surface leading-tight">{t.buyer}</span>
                        <span className="text-[10px] text-secondary">{t.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-primary">Rp {t.amount.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${
                        t.status === "Completed"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : t.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : t.status === "Processing"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.status === "Completed"
                            ? "bg-green-600"
                            : t.status === "Pending"
                            ? "bg-amber-600"
                            : t.status === "Processing"
                            ? "bg-blue-600"
                            : "bg-red-600"
                        }`}
                      ></span>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => alert(`Aksi detail untuk transaksi ${t.id}`)}
                      className="text-secondary hover:text-primary transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-secondary text-sm">
                    Tidak ada transaksi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-white border-t border-surface-container flex justify-between items-center text-xs font-semibold text-secondary">
          <p>Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-surface-container hover:bg-surface-container transition">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-bold text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-surface-container hover:bg-surface-container transition text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-surface-container hover:bg-surface-container transition text-sm">3</button>
            <span className="px-2 self-center">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-surface-container hover:bg-surface-container transition text-sm">165</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-surface-container hover:bg-surface-container transition">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
