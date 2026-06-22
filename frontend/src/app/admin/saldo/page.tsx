"use client";

import React, { useState } from "react";
import { Wallet, Clock, ArrowDownCircle, TrendingUp, X, CheckCircle } from "lucide-react";

const BANKS = ["BCA", "BNI", "Mandiri", "BRI"];

interface Transaction {
  id: string;
  date: string;
  storeName: string;
  description: string;
  type: "masuk" | "keluar";
  amount: number;
  status: "Berhasil" | "Pending" | "Gagal";
}

const TRANSACTIONS: Transaction[] = [
  { id: "TXN-001", date: "28 Okt 2023", storeName: "Batik Kawung Jaya", description: "Pembayaran Order INV/20231028/001", type: "masuk", amount: 450000, status: "Berhasil" },
  { id: "TXN-002", date: "27 Okt 2023", storeName: "Mitra Rotan Abadi", description: "Pembayaran Order INV/20231027/002", type: "masuk", amount: 175000, status: "Berhasil" },
  { id: "TXN-003", date: "26 Okt 2023", storeName: "Cokelat Nusantara", description: "Penarikan Dana Toko ke BCA 1234****", type: "keluar", amount: 500000, status: "Berhasil" },
  { id: "TXN-004", date: "25 Okt 2023", storeName: "Sutra Kawung Jaya", description: "Pembayaran Order INV/20231025/003", type: "masuk", amount: 850000, status: "Berhasil" },
  { id: "TXN-005", date: "24 Okt 2023", storeName: "Cokelat Nusantara", description: "Pembayaran Order INV/20231024/004", type: "masuk", amount: 125000, status: "Pending" },
  { id: "TXN-006", date: "23 Okt 2023", storeName: "Mitra Rotan Abadi", description: "Penarikan Dana Toko ke Mandiri 5678****", type: "keluar", amount: 300000, status: "Berhasil" },
  { id: "TXN-007", date: "22 Okt 2023", storeName: "Batik Kawung Jaya", description: "Pembayaran Order INV/20231022/005", type: "masuk", amount: 210000, status: "Berhasil" },
  { id: "TXN-008", date: "21 Okt 2023", storeName: "Sutra Kawung Jaya", description: "Pembayaran Order INV/20231021/006", type: "masuk", amount: 95000, status: "Gagal" },
];

function fmtRp(n: number) { 
  return `Rp ${n.toLocaleString("id-ID")}`; 
}

export default function AdminSaldoPage() {
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [filterType, setFilterType] = useState("Semua");

  function handleWithdraw(e: React.FormEvent) { 
    e.preventDefault(); 
    setWithdrawDone(true); 
  }

  function closeModal() {
    setShowModal(false); 
    setWithdrawDone(false);
    setWithdrawAmount(""); 
    setAccountNumber(""); 
    setSelectedBank("BCA");
  }

  const filteredTransactions = TRANSACTIONS.filter((tx) => {
    if (filterType === "Masuk") return tx.type === "masuk";
    if (filterType === "Keluar") return tx.type === "keluar";
    return true;
  });

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Keuangan & Saldo Platform</h2>
        <p className="font-body text-body-md text-[#5C5550] mt-1">Pantau arus kas masuk, saldo pending, dan penarikan dana dari seluruh mitra UMKM.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-[#1D4ED8] to-[#1E40AF] text-white rounded-xl p-6 shadow-lg flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-80">
              <Wallet size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Total Dana Tersedia</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">Rp 24.500.000</p>
            <p className="text-xs opacity-70 font-medium">Saldo gabungan seluruh mitra UMKM yang dapat ditarik</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 bg-white text-[#1D4ED8] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-slate-50 transition shadow-md"
          >
            <ArrowDownCircle size={16} /> Cairkan Dana
          </button>
        </div>
        <div className="bg-white border border-[#EAE5E0] rounded-xl p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[#5C5550]">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Dana Pending</span>
          </div>
          <p className="text-2xl font-extrabold text-[#1F1B18]">Rp 8.500.000</p>
          <p className="text-xs text-[#8E8680] font-medium leading-relaxed">Menunggu konfirmasi pengiriman selesai dari pembeli.</p>
          <div className="flex items-center gap-1.5 pt-1">
            <TrendingUp size={13} className="text-green-600" />
            <span className="text-xs text-green-600 font-bold">12 transaksi platform pending</span>
          </div>
        </div>
      </div>

      <section className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#EAE5E0] flex justify-between items-center">
          <h4 className="font-headline font-bold text-lg text-[#1F1B18]">Riwayat Transaksi</h4>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-[#D5CFC9] rounded text-xs font-bold text-[#5C5550] bg-white outline-none cursor-pointer"
          >
            <option value="Semua">Semua</option>
            <option value="Masuk">Masuk</option>
            <option value="Keluar">Keluar</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F3F0] border-b border-[#EAE5E0]">
                {["ID", "Tanggal", "Toko UMKM", "Deskripsi", "Tipe", "Jumlah", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#5C5550]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5E0]">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F5F3F0]/40 transition">
                  <td className="px-6 py-4 text-xs font-bold text-[#8E8680]">{tx.id}</td>
                  <td className="px-6 py-4 text-xs text-[#8E8680]">{tx.date}</td>
                  <td className="px-6 py-4 text-xs text-[#1F1B18] font-bold">{tx.storeName}</td>
                  <td className="px-6 py-4 text-sm text-[#1F1B18] font-medium">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${tx.type === "masuk" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {tx.type === "masuk" ? "▲ Masuk" : "▼ Keluar"}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-extrabold ${tx.type === "masuk" ? "text-green-600" : "text-red-600"}`}>
                    {tx.type === "masuk" ? "+" : "-"}{fmtRp(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${tx.status === "Berhasil" ? "bg-green-50 text-green-700 border-green-200" : tx.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs" 
          style={{ background: "rgba(0,0,0,0.45)" }} 
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE5E0] bg-[#F5F3F0]/50">
              <h3 className="font-bold text-lg text-[#1F1B18]">Pencairan Dana Mitra</h3>
              <button onClick={closeModal} className="p-1 hover:bg-[#F5F3F0] rounded transition"><X size={18} className="text-[#8E8680]" /></button>
            </div>
            <div className="p-6">
              {!withdrawDone ? (
                <form onSubmit={handleWithdraw} className="space-y-5 text-left text-xs font-semibold text-[#5C5550]">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#8E8680] mb-2">Jumlah Pencairan (Rp)</label>
                    <input 
                      type="number" 
                      placeholder="Rp 1.000.000" 
                      value={withdrawAmount} 
                      onChange={(e) => setWithdrawAmount(e.target.value)} 
                      required 
                      min={50000} 
                      className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-[#1F1B18] outline-none focus:border-[#1D4ED8] bg-[#F5F3F0] transition" 
                    />
                    <p className="text-[10px] text-[#8E8680] mt-1.5 font-medium">Minimum pencairan dana platform Rp 50.000</p>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#8E8680] mb-2">Pilih Bank Tujuan</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BANKS.map((bank) => (
                        <button 
                          key={bank} 
                          type="button" 
                          onClick={() => setSelectedBank(bank)} 
                          className={`py-2.5 rounded-lg text-xs font-bold border-2 transition ${selectedBank === bank ? "border-[#1D4ED8] bg-blue-50 text-[#1D4ED8]" : "border-[#EAE5E0] text-[#5C5550] hover:border-[#1D4ED8]"}`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#8E8680] mb-2">Nomor Rekening Tujuan</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: 1234567890" 
                      value={accountNumber} 
                      onChange={(e) => setAccountNumber(e.target.value)} 
                      required 
                      className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-[#1F1B18] outline-none focus:border-[#1D4ED8] bg-[#F5F3F0] transition" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full h-12 bg-[#1D4ED8] text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Konfirmasi Pencairan
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                    <CheckCircle size={36} className="text-green-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-[#1F1B18] mb-1">Permintaan Pencairan Berhasil!</h4>
                    <p className="text-xs text-[#8E8680] leading-relaxed max-w-xs mx-auto">
                      Dana sebesar <strong>{fmtRp(Number(withdrawAmount))}</strong> sedang diproses untuk ditransfer ke rekening {selectedBank}. Dana masuk dalam 1×24 jam kerja.
                    </p>
                  </div>
                  <button 
                    onClick={closeModal} 
                    className="mt-2 px-8 py-2.5 bg-[#1D4ED8] text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
