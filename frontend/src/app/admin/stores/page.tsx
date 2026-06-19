"use client";

import React, { useState } from "react";

export default function AdminStoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "info" | "error" | "success" }[]>([]);
  const [stores, setStores] = useState([
    {
      id: "TK-29381",
      nama: "Batik Kencana Jaya",
      pemilik: "Agus Setiawan",
      kategori: "Fesyen",
      status: "Aktif",
      logo: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
    },
    {
      id: "TK-10293",
      nama: "Java Coffee Roastery",
      pemilik: "Siti Aminah",
      kategori: "Kuliner",
      status: "Aktif",
      logo: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=100&auto=format&fit=crop",
    },
    {
      id: "TK-44210",
      nama: "Seni Tanah Liat",
      pemilik: "Budi Darmawan",
      kategori: "Kerajinan",
      status: "Menunggu",
      logo: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=100&auto=format&fit=crop",
    },
    {
      id: "TK-90112",
      nama: "Tekno Maju Jaya",
      pemilik: "Rizky Pratama",
      kategori: "Elektronik",
      status: "Aktif",
      logo: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=100&auto=format&fit=crop",
    }
  ]);

  const showToast = (message: string, type: "info" | "error" | "success" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleBlockStore = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin memblokir toko ${name}?`)) {
      setStores((prev) => prev.filter((s) => s.id !== id));
      showToast(`Toko ${name} telah berhasil diblokir.`, "error");
    }
  };

  const handleVerifyStore = (id: string, name: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Aktif" } : s))
    );
    showToast(`Toko ${name} berhasil diverifikasi dan aktif!`, "success");
  };

  const filteredStores = stores.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pemilik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Manajemen Toko</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Kelola dan awasi seluruh ekosistem pedagang UMKM Anda.
        </p>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-secondary tracking-wider">Total Toko</p>
            <h3 className="font-headline text-3xl font-extrabold text-primary">1,284</h3>
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% dari bulan lalu
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary border border-orange-100">
            <span className="material-symbols-outlined">store</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-secondary tracking-wider">Toko Aktif</p>
            <h3 className="font-headline text-3xl font-extrabold text-on-surface">1,102</h3>
            <p className="text-xs text-secondary font-semibold">86% Tingkat keaktifan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-secondary border border-zinc-200">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-secondary tracking-wider">Menunggu Verifikasi</p>
            <h3 className="font-headline text-3xl font-extrabold text-error">42</h3>
            <p className="text-xs text-error font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span> Perlu tindakan segera
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error border border-error-container">
            <span className="material-symbols-outlined font-bold">pending_actions</span>
          </div>
        </div>
      </section>

      {/* Search & Actions Bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama toko, pemilik, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded border border-surface-container-highest bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition font-body text-body-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-surface-container text-on-surface font-semibold text-sm rounded-lg hover:bg-surface-container-low transition">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
          <button 
            onClick={() => showToast("Fitur Tambah Toko Baru hanya dapat diakses dalam mode produksi.", "info")}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:brightness-95 transition"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Toko Baru
          </button>
        </div>
      </section>

      {/* Stores Table */}
      <section className="bg-white border border-surface-container rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Nama Toko</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Pemilik</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-surface-container-low/30 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container overflow-hidden">
                        <img src={store.logo} alt={store.nama} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition">
                          {store.nama}
                        </p>
                        <p className="text-xs text-secondary">ID: {store.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">{store.pemilik}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 bg-surface-container text-secondary rounded-full text-xs font-semibold">
                      {store.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${store.status === "Aktif" ? "text-green-600" : "text-amber-600"}`}>
                      <span className={`w-2 h-2 rounded-full ${store.status === "Aktif" ? "bg-green-600" : "bg-amber-600"}`}></span>
                      {store.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => showToast(`Membuka profil detail toko: ${store.nama}`, "info")}
                        className="p-2 hover:bg-surface-container text-secondary rounded transition" 
                        title="Lihat Detail"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button 
                        onClick={() => showToast(`Edit toko: ${store.nama}`, "info")}
                        className="p-2 hover:bg-surface-container text-secondary rounded transition" 
                        title="Edit Toko"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      {store.status === "Menunggu" ? (
                        <button
                          onClick={() => handleVerifyStore(store.id, store.nama)}
                          className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded hover:brightness-95 transition"
                        >
                          Verifikasi Sekarang
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBlockStore(store.id, store.nama)}
                          className="p-2 hover:bg-error-container/30 text-error rounded transition" 
                          title="Blokir Toko"
                        >
                          <span className="material-symbols-outlined text-[20px]">block</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-secondary text-sm">
                    Tidak ada data toko ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low/40 border-t border-surface-container flex items-center justify-between text-xs font-semibold text-secondary">
          <p>Menampilkan 1-{filteredStores.length} dari {stores.length} toko</p>
          <div className="flex items-center gap-1">
            <button className="p-2 border border-surface-container-highest rounded hover:bg-surface-container transition" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold">1</button>
            <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">2</button>
            <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">3</button>
            <span className="px-2">...</span>
            <button className="w-8 h-8 rounded border border-surface-container hover:bg-surface-container flex items-center justify-center transition">128</button>
            <button className="p-2 border border-surface-container-highest rounded hover:bg-surface-container transition">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Floating Toasts container */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 pointer-events-none z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white border border-surface-container-high p-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in`}
          >
            <span className={`material-symbols-outlined ${toast.type === "error" ? "text-error" : toast.type === "success" ? "text-green-600" : "text-primary"}`}>
              {toast.type === "error" ? "error" : toast.type === "success" ? "check_circle" : "info"}
            </span>
            <span className="font-body text-xs font-medium text-on-surface">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
