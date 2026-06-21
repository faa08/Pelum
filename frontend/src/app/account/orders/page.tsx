"use client";

import React, { useState, useEffect } from "react";
import { authService } from "@/backend/authService";
import { supabase } from "@/backend/supabase";

type Order = {
  id_order: string;
  created_at: string;
  stat_order: string;
  total_hrg: number;
  ongkir: number;
  items: {
    id_order_item: string;
    qty_orderitem: number;
    hrg_saat_beli: number;
    produk: { nama_produk: string; img: string } | null;
  }[];
  pengiriman: { kurir: string; no_resi: string | null } | null;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:      { label: "Belum Bayar",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  diproses:     { label: "Diproses",     color: "bg-blue-50 text-blue-700 border-blue-200" },
  dikirim:      { label: "Dikirim",      color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  selesai:      { label: "Selesai",      color: "bg-green-50 text-green-700 border-green-200" },
  dibatalkan:   { label: "Dibatalkan",   color: "bg-red-50 text-red-700 border-red-200" },
};

const TABS = ["Semua", "Belum Bayar", "Dikirim", "Selesai", "Dibatalkan"];

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = authService.getCurrentUser();
      if (!user) { setLoading(false); return; }

      if (isPlaceholder()) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("order")
        .select(`
          id_order, created_at, stat_order, total_hrg, ongkir,
          order_item (
            id_order_item, qty_orderitem, hrg_saat_beli,
            produk ( nama_produk, img )
          ),
          pengiriman ( kurir, no_resi )
        `)
        .eq("id_user", user.id_user)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data.map((o: any) => ({
          ...o,
          items: o.order_item || [],
          pengiriman: o.pengiriman?.[0] ?? null,
        })));
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "Semua") return true;
    const label = STATUS_MAP[o.stat_order]?.label;
    return label === activeTab;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Pesanan Saya</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Pantau status transaksi dan pengiriman produk UMKM Anda.
        </p>
      </header>

      {/* Tabs */}
      <section className="bg-white border border-surface-container rounded-lg p-1 flex flex-wrap gap-1 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 rounded font-bold text-xs uppercase tracking-wider transition ${
              activeTab === tab
                ? "bg-primary text-white"
                : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </section>

      {/* Orders List */}
      <section className="space-y-6">
        {loading ? (
          <div className="bg-white border border-surface-container p-12 rounded-xl text-center text-secondary text-sm shadow-sm">
            Memuat pesanan...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-surface-container p-12 rounded-xl text-center text-secondary text-sm shadow-sm">
            {activeTab === "Semua" ? "Belum ada pesanan." : `Tidak ada transaksi di status ini.`}
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const statusInfo = STATUS_MAP[ord.stat_order] ?? { label: ord.stat_order, color: "bg-gray-50 text-gray-700 border-gray-200" };
            const firstItem = ord.items[0];
            const totalAmount = ord.total_hrg + ord.ongkir;
            return (
              <div key={ord.id_order} className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold text-secondary border-b border-surface-container pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-on-surface truncate max-w-[200px]">#{ord.id_order.slice(0, 8).toUpperCase()}</span>
                    <span>|</span>
                    <span>{formatDate(ord.created_at)}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {firstItem && (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-surface-container rounded overflow-hidden shrink-0">
                        {firstItem.produk?.img ? (
                          <img src={firstItem.produk.img} alt={firstItem.produk.nama_produk} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary">image</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-headline font-bold text-sm text-on-surface leading-tight">
                          {firstItem.produk?.nama_produk ?? "Produk dihapus"}
                          {ord.items.length > 1 && <span className="text-secondary font-normal"> +{ord.items.length - 1} produk lainnya</span>}
                        </h4>
                        <p className="text-[10px] text-secondary font-bold">
                          {firstItem.qty_orderitem} x Rp {firstItem.hrg_saat_beli.toLocaleString("id-ID")}
                        </p>
                        {ord.pengiriman && (
                          <p className="text-[10px] font-semibold text-secondary flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">local_shipping</span>
                            {ord.pengiriman.kurir}{ord.pengiriman.no_resi ? ` · ${ord.pengiriman.no_resi}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-between md:items-end gap-3 text-right">
                      <div>
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total Belanja</p>
                        <p className="font-headline font-extrabold text-base text-primary">
                          Rp {totalAmount.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {ord.stat_order === "dikirim" && (
                          <button className="px-4 py-2 border-2 border-on-surface hover:bg-surface-container text-on-surface font-bold text-xs rounded transition">
                            Lacak Pesanan
                          </button>
                        )}
                        {ord.stat_order === "selesai" && (
                          <button className="px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition">
                            Beli Lagi
                          </button>
                        )}
                        {ord.stat_order === "dibatalkan" && (
                          <button className="px-4 py-2 border border-surface-container hover:bg-surface-container text-secondary font-bold text-xs rounded transition">
                            Lihat Detail
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
