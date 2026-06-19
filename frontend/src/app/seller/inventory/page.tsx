"use client";

import React, { useState } from "react";

interface InventoryItem {
  id: string;
  nama: string;
  sku: string;
  kategori: string;
  stok: number;
  harga: number;
  status: string;
  img: string;
}

export default function SellerInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      nama: "Kain Batik Tulis Motif Truntum Klasik",
      sku: "SKU-BTIK-001",
      kategori: "Fashion",
      stok: 12,
      harga: 450000,
      status: "Tersedia",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
    },
    {
      id: "2",
      nama: "Mangkuk Keramik Motif Megamendung Handmade",
      sku: "SKU-CERA-042",
      kategori: "Kerajinan",
      stok: 3,
      harga: 125000,
      status: "Stok Menipis",
      img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=100&auto=format&fit=crop",
    },
    {
      id: "3",
      nama: "Kopi Toraja Arabica 250g Premium Roasted",
      sku: "SKU-KOPI-105",
      kategori: "Kuliner",
      stok: 45,
      harga: 85000,
      status: "Tersedia",
      img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=100&auto=format&fit=crop",
    },
    {
      id: "4",
      nama: "Dompet Kulit Sapi Asli Handmade Cognac Brown",
      sku: "SKU-WLET-293",
      kategori: "Fashion",
      stok: 0,
      harga: 210000,
      status: "Habis",
      img: "https://images.unsplash.com/photo-1627124765950-2a3b0b8d278b?q=80&w=100&auto=format&fit=crop",
    },
    {
      id: "5",
      nama: "Paket Perawatan Wajah Alami Ekstrak Kunyit",
      sku: "SKU-SKIN-084",
      kategori: "Jasa",
      stok: 15,
      harga: 175000,
      status: "Tersedia",
      img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=100&auto=format&fit=crop",
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  // Stats calculation
  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.stok > 0 && i.stok <= 5).length;
  const outOfStockCount = items.filter(i => i.stok === 0).length;
  const availableCount = items.filter(i => i.stok > 5).length;

  const handleAdjustStock = (itemId: string, increment: boolean) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.stok + (increment ? 1 : -1));
          let newStatus = "Tersedia";
          if (newStock === 0) newStatus = "Habis";
          else if (newStock <= 5) newStatus = "Stok Menipis";
          return { ...item, stok: newStock, status: newStatus };
        }
        return item;
      })
    );
  };

  const startEditing = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setTempStockValue(item.stok);
  };

  const saveStockEdit = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const value = Math.max(0, tempStockValue);
          let newStatus = "Tersedia";
          if (value === 0) newStatus = "Habis";
          else if (value <= 5) newStatus = "Stok Menipis";
          return { ...item, stok: value, status: newStatus };
        }
        return item;
      })
    );
    setEditingItemId(null);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Semua" || 
      (statusFilter === "Tersedia" && item.stok > 5) || 
      (statusFilter === "Stok Menipis" && item.stok > 0 && item.stok <= 5) || 
      (statusFilter === "Habis" && item.stok === 0);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Manajemen Inventaris</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Pantau dan sesuaikan stok produk Anda secara realtime untuk menghindari pembatalan pesanan.
          </p>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Total Item</p>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">{totalItems} SKU</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl">list_alt</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Stok Aman</p>
            <h3 className="font-headline text-lg font-extrabold text-green-700">{availableCount} SKU</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
            <span className="material-symbols-outlined text-xl">check_circle</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Stok Menipis</p>
            <h3 className="font-headline text-lg font-extrabold text-orange-600">{lowStockCount} SKU</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <span className="material-symbols-outlined text-xl">warning</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Habis / Kosong</p>
            <h3 className="font-headline text-lg font-extrabold text-red-600">{outOfStockCount} SKU</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <span className="material-symbols-outlined text-xl">cancel</span>
          </div>
        </div>
      </section>

      {/* Controls Container */}
      <section className="bg-white border border-surface-container p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="w-full md:max-w-sm relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-secondary text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Cari SKU atau nama produk..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary font-body"
            />
          </div>
          
          {/* Tab Filter */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["Semua", "Tersedia", "Stok Menipis", "Habis"].map((status) => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-xs font-bold rounded transition border select-none whitespace-nowrap ${
                  statusFilter === status 
                    ? "bg-[#ff6f00] text-white border-transparent" 
                    : "bg-white border-surface-container text-secondary hover:bg-surface-container-low"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory List Table */}
        <div className="overflow-x-auto border border-surface-container rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-secondary font-bold text-xs uppercase">
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga Unit</th>
                <th className="px-6 py-4 text-center">Tingkat Stok</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Penyesuaian Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs font-semibold text-secondary">
                    Tidak ada item inventaris yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-container rounded overflow-hidden flex-shrink-0">
                          <img src={item.img} alt={item.nama} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface line-clamp-1">{item.nama}</p>
                          <p className="text-[10px] text-secondary font-bold tracking-wider">{item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondary">{item.kategori}</td>
                    <td className="px-6 py-4 font-bold text-sm text-on-surface">Rp {item.harga.toLocaleString("id-ID")}</td>
                    
                    {/* Stock level cell with double adjustment */}
                    <td className="px-6 py-4 text-center">
                      {editingItemId === item.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input 
                            type="number"
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-center font-bold text-sm border border-primary rounded bg-[#F5F5F5] outline-none"
                            autoFocus
                          />
                          <button 
                            onClick={() => saveStockEdit(item.id)}
                            className="bg-green-600 text-white rounded p-1 hover:brightness-95 flex items-center justify-center shadow-sm"
                            title="Simpan"
                          >
                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span 
                            onClick={() => startEditing(item)}
                            className="font-extrabold text-sm text-on-surface hover:text-[#ff6f00] hover:underline cursor-pointer transition"
                            title="Klik untuk ketik manual"
                          >
                            {item.stok} Pcs
                          </span>
                          <span className="material-symbols-outlined text-[12px] text-secondary cursor-pointer" onClick={() => startEditing(item)}>edit</span>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.stok === 0 
                          ? "bg-red-50 text-red-700 border-red-200" 
                          : item.stok <= 5 
                          ? "bg-orange-50 text-orange-700 border-orange-200" 
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}>
                        {item.stok === 0 ? "Habis" : item.stok <= 5 ? "Stok Menipis" : "Tersedia"}
                      </span>
                    </td>
                    
                    {/* Quick Add/Remove Stock Buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleAdjustStock(item.id, false)}
                          className="w-7 h-7 bg-[#F5F5F5] hover:bg-surface-container border border-surface-container rounded flex items-center justify-center text-secondary hover:text-on-surface transition active:scale-95"
                          title="Kurangi 1"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">remove</span>
                        </button>
                        <button 
                          onClick={() => handleAdjustStock(item.id, true)}
                          className="w-7 h-7 bg-[#F5F5F5] hover:bg-surface-container border border-surface-container rounded flex items-center justify-center text-secondary hover:text-on-surface transition active:scale-95"
                          title="Tambah 1"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">add</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
