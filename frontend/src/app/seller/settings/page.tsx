"use client";

import React, { useState } from "react";

export default function SellerSettingsPage() {
  const [storeName, setStoreName] = useState("Batik Solo Hub");
  const [slogan, setSlogan] = useState("");
  const [desc, setDesc] = useState("Kami adalah produsen batik tulis dan cap asli dari jantung kota Solo. Mengutamakan kualitas bahan premium dengan pewarna alami yang ramah lingkungan.");
  
  const [jneActive, setJneActive] = useState(true);
  const [sicepatActive, setSicepatActive] = useState(true);
  const [grabActive, setGrabActive] = useState(false);
  const [tfaActive, setTfaActive] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pengaturan Toko Berhasil Disimpan!\nNama Toko: ${storeName}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Pengaturan Toko</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Kelola profil bisnis, alamat pengiriman, dan keamanan akun Anda di satu tempat.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Profil Toko Card */}
        <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm space-y-6">
          <h3 className="font-headline font-bold text-lg text-on-surface border-b border-surface-container pb-4">
            Profil Toko
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Logo Toko</label>
              <div className="w-48 h-48 bg-primary rounded overflow-hidden shadow border border-surface-container flex flex-col justify-end relative">
                <img 
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300&auto=format&fit=crop" 
                  alt="Store Logo" 
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-black/30 hover:opacity-100 opacity-0 transition duration-200 flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined text-white text-3xl">upload</span>
                </div>
              </div>
              <p className="text-[10px] text-secondary">Format JPG, PNG. Maks 2MB.</p>
            </div>

            <div className="md:col-span-2 space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Nama Toko</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Slogan Toko (Opsional)</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Contoh: Pusat Batik Tulis Berkualitas"
                  className="w-full px-4 py-2.5 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Deskripsi Toko</label>
                <textarea
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded border border-surface-container-highest bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs font-body leading-relaxed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Business Address & Shipping Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Alamat Bisnis */}
          <div className="lg:col-span-2 bg-white border border-surface-container p-6 rounded-xl space-y-5 shadow-sm">
            <div>
              <h4 className="font-headline font-bold text-base text-on-surface">Alamat Bisnis</h4>
              <p className="text-[10px] text-secondary">Alamat utama toko untuk keperluan penjemputan paket.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Provinsi</label>
                <select className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-semibold text-secondary">
                  <option>Jawa Tengah</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Kota/Kabupaten</label>
                <select className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-semibold text-secondary">
                  <option>Surakarta (Solo)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Alamat Lengkap</label>
              <textarea
                rows={2}
                defaultValue="Jl. Slamet Riyadi No. 123, Kel. Purwosari, Kec. Laweyan, Kota Surakarta"
                className="w-full px-4 py-2 border border-surface-container-highest rounded bg-[#F5F5F5] focus:outline-none text-xs font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Kode Pos</label>
                <input
                  type="text"
                  defaultValue="57142"
                  className="w-full px-4 py-2 border border-surface-container rounded bg-white text-xs font-body"
                />
              </div>
              <button 
                type="button" 
                onClick={() => alert("Membuka peta penyesuaian lokasi...")}
                className="px-4 py-2 border border-surface-container-highest hover:bg-surface-container text-xs font-bold rounded flex items-center justify-center gap-2 transition"
              >
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                Sesuaikan Pinpoint
              </button>
            </div>

            {/* Mock map container */}
            <div className="h-28 bg-zinc-100 rounded-lg border border-surface-container overflow-hidden flex items-center justify-center relative">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500&auto=format&fit=crop')` }}></div>
              <span className="relative z-10 font-bold text-xs text-secondary bg-white px-3 py-1 rounded shadow">Solo, Jawa Tengah</span>
            </div>
          </div>

          {/* Side panels (Shipping & Account Security) */}
          <div className="space-y-6">
            
            {/* Jasa Pengiriman */}
            <div className="bg-white border border-surface-container p-6 rounded-xl space-y-4 shadow-sm">
              <div>
                <h4 className="font-headline font-bold text-base text-on-surface">Jasa Pengiriman</h4>
                <p className="text-[10px] text-secondary">Atur ekspedisi yang didukung toko Anda.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-surface-container rounded-lg bg-surface-container-low/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">local_shipping</span>
                    <span className="text-xs font-bold text-on-surface">JNE Express</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={jneActive}
                    onChange={(e) => setJneActive(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-surface-container rounded-lg bg-surface-container-low/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">local_shipping</span>
                    <span className="text-xs font-bold text-on-surface">SiCepat Ekspres</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sicepatActive}
                    onChange={(e) => setSicepatActive(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-surface-container rounded-lg bg-surface-container-low/20 opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">directions_run</span>
                    <span className="text-xs font-bold text-on-surface">Grab/GoSend</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={grabActive}
                    onChange={(e) => setGrabActive(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                </div>
              </div>
              
              <button type="button" className="w-full text-center text-xs font-bold text-primary hover:underline mt-2">
                Lihat Semua 12 Kurir
              </button>
            </div>

            {/* Keamanan & Akun */}
            <div className="bg-white border border-surface-container p-6 rounded-xl space-y-4 shadow-sm">
              <h4 className="font-headline font-bold text-base text-on-surface border-b border-surface-container pb-2">
                Keamanan & Akun
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-secondary">Alamat Email</p>
                    <p className="font-semibold text-on-surface">admin@batiksolohub.com</p>
                  </div>
                  <button type="button" className="font-bold text-primary hover:underline">Ubah</button>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-secondary">Kata Sandi</p>
                    <p className="font-semibold text-on-surface">••••••••••••</p>
                  </div>
                  <button type="button" className="font-bold text-primary hover:underline">Ubah</button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                  <span className="text-xs font-bold text-on-surface">Autentikasi 2 Faktor</span>
                  <input
                    type="checkbox"
                    checked={tfaActive}
                    onChange={(e) => setTfaActive(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Buttons Action bar */}
        <section className="bg-white border border-surface-container p-6 rounded-xl shadow-sm flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setStoreName("Batik Solo Hub");
              setDesc("Kami adalah produsen batik tulis dan cap asli dari jantung kota Solo. Mengutamakan kualitas bahan premium dengan pewarna alami yang ramah lingkungan.");
            }}
            className="px-6 py-2.5 border-2 border-on-surface text-on-surface font-bold text-xs rounded hover:bg-surface-container transition"
          >
            Batalkan
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
          >
            Simpan Perubahan
          </button>
        </section>

      </form>
    </div>
  );
}
