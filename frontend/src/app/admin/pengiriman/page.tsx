"use client";

import React, { useState } from "react";
import { Package, Truck, CheckCircle2, X, MapPin } from "lucide-react";

const COURIERS = ["JNE", "J&T Express", "SiCepat", "Gosend"];
type ShipStatus = "Perlu Dikirim" | "Sedang Dikirim" | "Selesai";

interface Order {
  id: string; buyer: string; storeName: string; product: string; qty: number;
  address: string; date: string; status: ShipStatus;
  courier?: string; resi?: string; eta?: string;
}

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-001", buyer: "Siti Rahmawati", storeName: "Batik Kawung Jaya", product: "Kain Batik Tulis Motif Mega Mendung", qty: 1, address: "Jl. Merdeka No. 12, Bandung, Jawa Barat 40111", date: "28 Okt 2023", status: "Perlu Dikirim" },
  { id: "ORD-002", buyer: "Budi Santoso", storeName: "Mitra Rotan Abadi", product: "Mangkuk Keramik Handmade Motif Tradisional", qty: 2, address: "Jl. Sudirman No. 45, Jakarta Selatan 12190", date: "27 Okt 2023", status: "Perlu Dikirim" },
  { id: "ORD-003", buyer: "Dewi Kusuma", storeName: "Cokelat Nusantara", product: "Kopi Arabika Gayo Single Origin 250g", qty: 3, address: "Jl. Diponegoro No. 8, Surabaya, Jawa Timur", date: "26 Okt 2023", status: "Sedang Dikirim", courier: "JNE", resi: "JNE123456789", eta: "30 Okt 2023" },
  { id: "ORD-004", buyer: "Reza Pratama", storeName: "Sutra Kawung Jaya", product: "Dompet Kulit Sapi Asli Cognac Brown", qty: 1, address: "Jl. Gatot Subroto No. 22, Medan, Sumatera Utara", date: "25 Okt 2023", status: "Sedang Dikirim", courier: "SiCepat", resi: "SC987654321", eta: "29 Okt 2023" },
  { id: "ORD-005", buyer: "Anita Wahyuni", storeName: "Batik Kawung Jaya", product: "Paket Skincare Alami Ekstrak Kunyit", qty: 1, address: "Jl. A. Yani No. 5, Yogyakarta 55000", date: "20 Okt 2023", status: "Selesai", courier: "J&T Express", resi: "JT112233445", eta: "23 Okt 2023" },
];

export default function AdminPengirimanPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<ShipStatus>("Perlu Dikirim");
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [courier, setCourier] = useState("JNE");
  const [resi, setResi] = useState("");
  const [eta, setEta] = useState("");

  const tabs: ShipStatus[] = ["Perlu Dikirim", "Sedang Dikirim", "Selesai"];
  const filtered = orders.filter((o) => o.status === activeTab);
  const tabCounts = { 
    "Perlu Dikirim": orders.filter((o) => o.status === "Perlu Dikirim").length, 
    "Sedang Dikirim": orders.filter((o) => o.status === "Sedang Dikirim").length, 
    "Selesai": orders.filter((o) => o.status === "Selesai").length 
  };

  function openModal(order: Order) { 
    setModalOrder(order); 
    setCourier("JNE"); 
    setResi(""); 
    setEta(""); 
  }

  function submitResi(e: React.FormEvent) {
    e.preventDefault();
    if (!modalOrder) return;
    setOrders((prev) => prev.map((o) => o.id === modalOrder.id ? { ...o, status: "Sedang Dikirim" as ShipStatus, courier, resi, eta } : o));
    setModalOrder(null);
    setActiveTab("Sedang Dikirim");
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Manajemen Pengiriman</h2>
        <p className="font-body text-body-md text-[#5C5550] mt-1">Input resi dan pantau status pengiriman pesanan dari seluruh toko mitra.</p>
      </header>

      <div className="bg-white border border-[#EAE5E0] rounded-lg p-1 flex gap-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 ${activeTab === tab ? "bg-[#1D4ED8] text-white" : "text-[#5C5550] hover:bg-[#F5F3F0] hover:text-[#1F1B18]"}`}
          >
            {tab === "Perlu Dikirim" && <Package size={13} />}
            {tab === "Sedang Dikirim" && <Truck size={13} />}
            {tab === "Selesai" && <CheckCircle2 size={13} />}
            {tab}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === tab ? "bg-white/20 text-white" : "bg-[#F5F3F0] text-[#5C5550]"}`}>{tabCounts[tab]}</span>
          </button>
        ))}
      </div>

      <section className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-white border border-[#EAE5E0] rounded-xl p-12 text-center text-[#8E8680] text-sm font-semibold shadow-sm">
            Tidak ada pesanan di status ini.
          </div>
        )}
        {filtered.map((order) => (
          <div key={order.id} className="bg-white border border-[#EAE5E0] rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-center gap-3 text-xs font-semibold text-[#8E8680]">
                  <span className="font-bold text-[#1F1B18]">{order.id}</span>
                  <span>•</span>
                  <span>{order.date}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider mb-0.5">Toko Mitra</p>
                    <p className="font-bold text-sm text-[#1F1B18]">{order.storeName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider mb-0.5">Pembeli</p>
                    <p className="font-bold text-sm text-[#1F1B18]">{order.buyer}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider mb-0.5">Produk</p>
                    <p className="text-sm text-[#1F1B18] font-medium">
                      {order.product} <span className="text-[#8E8680]">× {order.qty}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-[#8E8680] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#5C5550] leading-relaxed">{order.address}</p>
                </div>
                
                {order.status !== "Perlu Dikirim" && (
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F5F3F0]">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">{order.courier}</span>
                    <span className="text-xs text-[#5C5550] font-semibold">Resi: {order.resi}</span>
                    <span className="text-xs text-[#8E8680]">• Est. tiba: {order.eta}</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {order.status === "Perlu Dikirim" && (
                  <button 
                    onClick={() => openModal(order)} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1D4ED8] text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition"
                  >
                    <Truck size={14} />Input Resi
                  </button>
                )}
                {order.status === "Sedang Dikirim" && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Truck size={13} />Sedang Dikirim
                  </span>
                )}
                {order.status === "Selesai" && (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} />Selesai
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {modalOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs" 
          style={{ background: "rgba(0,0,0,0.45)" }} 
          onClick={(e) => { if (e.target === e.currentTarget) setModalOrder(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE5E0] bg-[#F5F3F0]/50">
              <h3 className="font-bold text-lg text-[#1F1B18]">Input Nomor Resi</h3>
              <button onClick={() => setModalOrder(null)} className="p-1 hover:bg-[#F5F3F0] rounded transition"><X size={18} className="text-[#8E8680]" /></button>
            </div>
            <div className="p-6">
              <div className="bg-[#F5F3F0]/60 rounded-lg p-4 mb-5 space-y-1">
                <p className="text-xs font-bold text-[#8E8680] uppercase tracking-wider">{modalOrder.id} ({modalOrder.storeName})</p>
                <p className="text-sm font-semibold text-[#1F1B18]">{modalOrder.product}</p>
                <p className="text-xs text-[#5C5550] flex items-center gap-1.5"><MapPin size={11} />{modalOrder.address}</p>
              </div>
              <form onSubmit={submitResi} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] uppercase tracking-wider mb-2">Pilih Kurir</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COURIERS.map((c) => (
                      <button 
                        key={c} 
                        type="button" 
                        onClick={() => setCourier(c)} 
                        className={`py-2 rounded-lg text-xs font-bold border-2 transition ${courier === c ? "border-[#1D4ED8] bg-blue-50 text-[#1D4ED8]" : "border-[#EAE5E0] text-[#5C5550] hover:border-[#1D4ED8]"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] uppercase tracking-wider mb-2">Nomor Resi</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: JNE123456789" 
                    value={resi} 
                    onChange={(e) => setResi(e.target.value)} 
                    required 
                    className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-[#1F1B18] outline-none focus:border-[#1D4ED8] transition bg-[#F5F3F0]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B18] uppercase tracking-wider mb-2">Estimasi Tiba</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: 30 Okt 2023" 
                    value={eta} 
                    onChange={(e) => setEta(e.target.value)} 
                    required 
                    className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-semibold text-[#1F1B18] outline-none focus:border-[#1D4ED8] transition bg-[#F5F3F0]" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full h-12 bg-[#1D4ED8] text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Truck size={16} />Konfirmasi Pengiriman
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
