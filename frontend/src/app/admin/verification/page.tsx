"use client";

import React, { useState } from "react";

interface VerificationStore {
  id: string;
  name: string;
  owner: string;
  nib: string;
  category: string;
  dateApplied: string;
  documentName: string;
  status: "Pending" | "Disetujui" | "Ditolak";
}

export default function AdminVerificationPage() {
  const [stores, setStores] = useState<VerificationStore[]>([
    {
      id: "ST-091",
      name: "Batik Cantik Makmur",
      owner: "Slamet Rahardjo",
      nib: "9120408123456",
      category: "Fashion",
      dateApplied: "19 Juni 2026",
      documentName: "Dokumen_NIB_Slamet.pdf",
      status: "Pending"
    },
    {
      id: "ST-090",
      name: "Keripik Singkong Renyah",
      owner: "Susanti Lestari",
      nib: "9120408789012",
      category: "Kuliner",
      dateApplied: "19 Juni 2026",
      documentName: "Dokumen_NIB_Susanti.pdf",
      status: "Pending"
    },
    {
      id: "ST-088",
      name: "Anyaman Bambu Kreatif",
      owner: "Dedi Setiadi",
      nib: "9120408543210",
      category: "Kerajinan",
      dateApplied: "17 Juni 2026",
      documentName: "Dokumen_NIB_Dedi.pdf",
      status: "Pending"
    },
    {
      id: "ST-085",
      name: "Tenun Ikat Alor",
      owner: "Martha Maria",
      nib: "9120408990011",
      category: "Fashion",
      dateApplied: "15 Juni 2026",
      documentName: "Dokumen_NIB_Martha.pdf",
      status: "Disetujui"
    },
    {
      id: "ST-082",
      name: "Madu Hutan Sumbawa",
      owner: "Yusuf Faisal",
      nib: "9120408882233",
      category: "Kuliner",
      dateApplied: "12 Juni 2026",
      documentName: "Dokumen_NIB_Yusuf.pdf",
      status: "Ditolak"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Pending" | "Disetujui" | "Ditolak">("Semua");

  const totalPending = stores.filter(s => s.status === "Pending").length;
  const totalApproved = stores.filter(s => s.status === "Disetujui").length;
  const totalRejected = stores.filter(s => s.status === "Ditolak").length;

  const handleAction = (id: string, approve: boolean) => {
    setStores(prev => 
      prev.map(store => {
        if (store.id === id) {
          return { ...store, status: approve ? "Disetujui" : "Ditolak" };
        }
        return store;
      })
    );
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) || store.owner.toLowerCase().includes(searchTerm.toLowerCase()) || store.nib.includes(searchTerm);
    const matchesStatus = statusFilter === "Semua" || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Verifikasi Pendaftaran Toko</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Review dokumen legalitas NIB (Nomor Induk Berusaha) UMKM baru untuk menyetujui pembukaan toko mereka di Pelataran UMKM.
          </p>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Menunggu Verifikasi</p>
            <h3 className="font-headline text-lg font-extrabold text-red-600">{totalPending} Toko</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <span className="material-symbols-outlined text-xl font-bold">hourglass_empty</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Telah Disetujui</p>
            <h3 className="font-headline text-lg font-extrabold text-green-700">{totalApproved} Toko</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
            <span className="material-symbols-outlined text-xl font-bold">check_circle</span>
          </div>
        </div>

        <div className="bg-white border border-surface-container p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Telah Ditolak</p>
            <h3 className="font-headline text-lg font-extrabold text-zinc-600">{totalRejected} Toko</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-xl font-bold">cancel</span>
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
              placeholder="Cari toko, nama pemilik, atau NIB..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 border border-surface-container bg-[#F5F5F5] rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary font-body"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(["Semua", "Pending", "Disetujui", "Ditolak"] as const).map((status) => (
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

        {/* Verification Queue List Table */}
        <div className="overflow-x-auto border border-surface-container rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-secondary font-bold text-xs uppercase">
                <th className="px-6 py-4">Toko / Pemilik</th>
                <th className="px-6 py-4">Legalitas (NIB)</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tanggal Pengajuan</th>
                <th className="px-6 py-4">Dokumen NIB</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs font-semibold text-secondary">
                    Tidak ada pendaftaran toko yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-surface-container-low/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm text-on-surface">{store.name}</p>
                        <p className="text-[10px] text-secondary font-medium">Owner: {store.owner}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-on-surface">{store.nib}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondary">{store.category}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-secondary">{store.dateApplied}</td>
                    <td className="px-6 py-4 text-xs">
                      <button 
                        onClick={() => alert(`Mengunduh dokumen legalitas: ${store.documentName}`)}
                        className="text-primary font-bold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        NIB_Doc.pdf
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        store.status === "Pending" 
                          ? "bg-red-50 text-red-700 border-red-200" 
                          : store.status === "Disetujui" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-zinc-50 text-zinc-700 border-zinc-200"
                      }`}>
                        {store.status}
                      </span>
                    </td>
                    
                    {/* Action buttons */}
                    <td className="px-6 py-4">
                      {store.status === "Pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleAction(store.id, true)}
                            className="bg-green-600 text-white font-bold text-[10px] px-3 py-1 rounded hover:brightness-95 transition"
                          >
                            Setujui
                          </button>
                          <button 
                            onClick={() => handleAction(store.id, false)}
                            className="bg-zinc-800 text-white font-bold text-[10px] px-3 py-1 rounded hover:bg-zinc-700 transition"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <p className="text-center text-[10px] font-bold text-secondary tracking-wider">
                          SELESAI
                        </p>
                      )}
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
