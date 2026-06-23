"use client";

import React, { useState, useEffect } from "react";
import { sellerService } from "@/backend/sellerService";
import { supabase } from "@/backend/supabase";

interface Store {
  id: string;
  nama: string;
  pemilik: string;
  kategori: string;
  status: "Aktif" | "Menunggu" | "Nonaktif";
  logo: string;
}

export default function AdminStoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "info" | "error" | "success" }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);

  // Add store Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreOwnerName, setNewStoreOwnerName] = useState("");
  const [newStoreLogo, setNewStoreLogo] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await sellerService.getSellers();
      const formatted: Store[] = data.map((s: any) => ({
        id: s.id_seller,
        nama: s.nm_store,
        pemilik: s.users?.nama_lengkap || "Tanpa Nama",
        kategori: "UMKM Lokal",
        status: s.is_verified ? "Aktif" : "Menunggu",
        logo: s.logo_toko || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop",
      }));
      setStores(formatted);
    } catch (error) {
      console.error("Gagal memuat data toko:", error);
      showToast("Gagal memuat data toko.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: "info" | "error" | "success" = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleBlockStore = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin memblokir toko ${name}?`)) {
      const success = await sellerService.deleteSeller(id);
      if (success) {
        setStores((prev) => prev.filter((s) => s.id !== id));
        showToast(`Toko ${name} telah berhasil diblokir.`, "error");
      } else {
        showToast(`Gagal memblokir toko ${name}.`, "error");
      }
    }
  };

  const handleVerifyStore = async (id: string, name: string) => {
    const success = await sellerService.verifySeller(id, true);
    if (success) {
      setStores((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "Aktif" } : s))
      );
      showToast(`Toko ${name} berhasil diverifikasi dan aktif!`, "success");
    } else {
      showToast(`Gagal memverifikasi toko ${name}.`, "error");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar logo terlalu besar! Maksimal adalah 2MB.");
        return;
      }

      setUploadProgress(0);
      setNewStoreLogo("");

      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
      const filePath = `store-logos/${fileName}`;

      let uploadedUrl = "";
      try {
        setUploadProgress(20);
        const { data, error } = await supabase.storage
          .from("products")
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;
        setUploadProgress(80);

        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          uploadedUrl = publicUrlData.publicUrl;
        } else {
          throw new Error("Gagal mendapatkan public URL.");
        }

        setUploadProgress(100);
        setNewStoreLogo(uploadedUrl);
      } catch (err) {
        console.warn("Gagal mengunggah ke Supabase Storage, menggunakan mode fallback base64...", err);
        setUploadProgress(50);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            setNewStoreLogo(event.target.result as string);
            setUploadProgress(100);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewStoreName("");
    setNewStoreOwnerName("");
    setNewStoreLogo("");
    setUploadProgress(null);
  };

  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStoreOwnerName.trim()) {
      alert("Nama Toko dan Nama Pemilik wajib diisi.");
      return;
    }

    // Generate email dari nama toko supaya tidak perlu diisi manual
    const generatedEmail = `${newStoreName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "")}@pelataranumkm.id`;

    try {
      const newStore = await sellerService.createStore(
        newStoreName,
        generatedEmail,
        "",   // phone — opsional
        "",   // deskripsi — opsional
        "",   // alamat — opsional
        "",   // bank — opsional
        "",   // no rek — opsional
        "",   // atas nama — opsional
        false,
        newStoreOwnerName,
        newStoreLogo || undefined
      );

      if (newStore) {
        showToast(`Toko ${newStoreName} berhasil ditambahkan!`, "success");
        loadData();
        handleCloseModal();
      } else {
        showToast("Gagal menambahkan toko. Nama toko mungkin sudah terdaftar.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan toko.", "error");
    }
  };

  const filteredStores = stores.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pemilik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute metrics from state
  const totalStores = stores.length;
  const activeStoresCount = stores.filter(s => s.status === "Aktif").length;
  const pendingStoresCount = stores.filter(s => s.status === "Menunggu").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Manajemen Toko</h2>
        <p className="font-body text-body-md text-[#3E3834] mt-1">
          Kelola dan awasi seluruh ekosistem pedagang UMKM Anda.
        </p>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Total Toko</p>
            <h3 className="font-headline text-3xl font-extrabold text-primary">{totalStores}</h3>
            <p className="text-xs text-[#3E3834] font-semibold">Toko terdaftar di sistem</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">store</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Toko Aktif</p>
            <h3 className="font-headline text-3xl font-extrabold text-on-surface">{activeStoresCount}</h3>
            <p className="text-xs text-[#3E3834] font-semibold">Telah diverifikasi</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-[#3E3834] tracking-wider">Menunggu Verifikasi</p>
            <h3 className="font-headline text-3xl font-extrabold text-error">{pendingStoresCount}</h3>
            <p className="text-xs text-error font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span> Butuh persetujuan
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
            <span className="material-symbols-outlined font-bold">pending_actions</span>
          </div>
        </div>
      </section>

      {/* Search & Actions Bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#3E3834]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama toko, pemilik, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded border border-[#D5CFC9] bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition font-body text-body-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-[#F5F3F0] text-[#3E3834] font-semibold text-sm rounded-lg hover:bg-[#EBE8E4] transition">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Toko Baru
          </button>
        </div>
      </section>

      {/* Stores Table */}
      <section className="bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-[#1F1B18]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nama Toko</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Pemilik</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3F0]">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#F5F3F0]"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-[#F5F3F0] rounded w-28"></div>
                          <div className="h-2 bg-[#F5F3F0] rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6"><div className="h-3 bg-[#F5F3F0] rounded w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-5 bg-[#F5F3F0] rounded-full w-14"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-[#F5F3F0] rounded w-16"></div></td>
                    <td className="px-6 py-6 text-right"><div className="w-24 h-6 bg-[#F5F3F0] rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredStores.length === 0 ? (
                // Beautiful Empty State
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-5xl text-[#3E3834]">storefront</span>
                      <h5 className="font-headline font-bold text-sm text-[#1F1B18]">Belum Ada Toko Terdaftar</h5>
                      <p className="text-xs text-[#3E3834] max-w-sm">
                        Database merchant kosong. Pengajuan pendaftaran toko baru yang disetujui akan muncul di list ini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-surface-container-low/30 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#F5F3F0] overflow-hidden">
                          <img src={store.logo} alt={store.nama} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition">
                            {store.nama}
                          </p>
                          <p className="text-[10px] text-[#3E3834]">ID: {store.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">{store.pemilik}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-surface-container text-[#3E3834] rounded-full text-xs font-semibold">
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
                          className="p-2 hover:bg-surface-container text-[#3E3834] rounded transition" 
                          title="Lihat Detail"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button 
                          onClick={() => showToast(`Edit toko: ${store.nama}`, "info")}
                          className="p-2 hover:bg-surface-container text-[#3E3834] rounded transition" 
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low/40 flex items-center justify-between text-xs font-semibold text-[#3E3834]">
          <p>
            {isLoading
              ? "Memuat data..."
              : `Menampilkan 1-${filteredStores.length} dari ${stores.length} toko`}
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 bg-[#F5F3F0] rounded hover:bg-[#EBE8E4] transition text-[#3E3834]" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold">1</button>
            <button className="w-8 h-8 rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] flex items-center justify-center transition text-[#3E3834]">2</button>
            <button className="w-8 h-8 rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] flex items-center justify-center transition text-[#3E3834]">3</button>
            <span className="px-2">...</span>
            <button className="w-8 h-8 rounded bg-[#F5F3F0] hover:bg-[#EBE8E4] flex items-center justify-center transition text-[#3E3834]">128</button>
            <button className="p-2 bg-[#F5F3F0] rounded hover:bg-[#EBE8E4] transition text-[#3E3834]">
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
            className={`pointer-events-auto bg-white border border-surface-container-high p-4 rounded-xl shadow-lg flex items-center gap-3 wrapper`}
          >
            <span className={`material-symbols-outlined ${toast.type === "error" ? "text-error" : toast.type === "success" ? "text-green-600" : "text-primary"}`}>
              {toast.type === "error" ? "error" : toast.type === "success" ? "check_circle" : "info"}
            </span>
            <span className="font-body text-xs font-medium text-on-surface">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Stateful Add Store Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE5E0] rounded-xl max-w-lg w-full overflow-hidden shadow-xl animate-scale-in">
            <div className="px-6 py-4 border-b border-[#EAE5E0] flex justify-between items-center bg-[#F5F3F0]/50">
              <h3 className="font-headline font-bold text-base text-[#1F1B18]">
                Tambah Toko Baru
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-[#8E8680] hover:text-[#1F1B18] transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddStoreSubmit} className="p-6 space-y-5 font-semibold text-xs text-[#5C5550]">

              {/* Nama Toko */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">
                  Nama Toko <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="contoh: Griya Keramik Kasongan"
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded-lg bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs text-[#1F1B18]"
                />
              </div>

              {/* Nama Pemilik */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">
                  Nama Pemilik Toko <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStoreOwnerName}
                  onChange={(e) => setNewStoreOwnerName(e.target.value)}
                  placeholder="Nama lengkap pemilik toko"
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded-lg bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs text-[#1F1B18]"
                />
              </div>

              {/* Logo Toko */}
              <div className="space-y-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">
                  Logo Toko <span className="text-[#8E8680] font-normal normal-case">(opsional)</span>
                </label>

                {/* Preview */}
                {newStoreLogo && (
                  <div className="flex items-center gap-3 p-3 bg-[#F5F3F0] rounded-lg border border-[#EAE5E0]">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#D5CFC9] flex-shrink-0">
                      <img src={newStoreLogo} alt="Preview logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1F1B18]">Logo berhasil diunggah</p>
                      <p className="text-[10px] text-[#8E8680] truncate">{newStoreLogo.substring(0, 50)}...</p>
                    </div>
                    <button type="button" onClick={() => setNewStoreLogo("")} className="text-[#8E8680] hover:text-red-500 transition flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}

                {/* Upload button */}
                <label className="flex items-center justify-center gap-2 w-full h-10 border-2 border-dashed border-[#D5CFC9] rounded-lg cursor-pointer hover:border-[#1D4ED8] hover:bg-blue-50/30 transition text-[#8E8680] hover:text-[#1D4ED8]">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  <span className="text-xs font-semibold">
                    {uploadProgress !== null && uploadProgress < 100 ? `Mengunggah... ${uploadProgress}%` : "Klik untuk upload gambar"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                <p className="text-[10px] text-[#8E8680]">Format JPG, PNG, WebP. Maks 2 MB. Rekomendasi 400×400px.</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-[#EAE5E0]">
                <button type="button" onClick={handleCloseModal}
                  className="px-4 py-2 border border-[#D5CFC9] text-[#5C5550] hover:bg-[#F5F3F0] text-xs font-bold rounded-lg transition">
                  Batal
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-[#1D4ED8] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Tambah Toko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
