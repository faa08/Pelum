"use client";

import React, { useState, useEffect } from "react";
import { authService } from "@/backend/authService";

export default function CustomerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullname, setFullname] = useState("");
  const [birthdate, setBirthdate] = useState("15 Mei 1995");
  const [gender, setGender] = useState("Perempuan");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFullname(currentUser.nama_lengkap || currentUser.username);
      setPhone(currentUser.no_telp || "");
      setEmail(currentUser.email || "");
      
      // Load recent orders (empty for database connection later)
      setRecentOrders([]);
    }
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const success = await authService.updateProfile(user.id_user, fullname, phone);
      if (success) {
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
      }
    }
    setIsEditing(false);
    alert("Profil Berhasil Diperbarui!");
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        Loading profil...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Header Details card */}
      <section className="bg-white border border-surface-container rounded-xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-surface-container-high bg-zinc-200">
            <img src={user.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"} alt="Customer Profile Large" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <h2 className="font-headline font-bold text-2xl text-on-surface leading-tight">{fullname}</h2>
            <p className="font-body text-xs text-secondary">{email} &bull; Joined Jan 2023</p>
            <div className="flex gap-3 pt-2">
              <span className="text-[10px] font-bold text-secondary bg-surface-container px-2 py-0.5 rounded border border-surface-container-high">
                Poin Saya: 1,250 pts
              </span>
              <span className="text-[10px] font-bold text-primary bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Voucher: 4 Tersedia
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          {isEditing ? "Batal Edit" : "Edit Profil"}
        </button>
      </section>

      {/* Basic info vs Recent orders split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Informasi Dasar */}
        <section className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-headline font-bold text-base text-on-surface border-b border-surface-container pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">person</span>
            Informasi Dasar
          </h3>
          
          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Tanggal Lahir</label>
                <input 
                  type="text" 
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Jenis Kelamin</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-semibold text-secondary"
                >
                  <option>Perempuan</option>
                  <option>Laki-laki</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Nomor HP</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded bg-white text-xs font-body"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
              >
                Simpan Perubahan
              </button>
            </form>
          ) : (
            <div className="space-y-3 font-body text-xs">
              <div className="grid grid-cols-3 py-1">
                <span className="font-bold text-secondary">Nama Lengkap</span>
                <span className="col-span-2 text-on-surface font-semibold">{fullname}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-t border-surface-container">
                <span className="font-bold text-secondary">Tanggal Lahir</span>
                <span className="col-span-2 text-on-surface font-semibold">{birthdate}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-t border-surface-container">
                <span className="font-bold text-secondary">Jenis Kelamin</span>
                <span className="col-span-2 text-on-surface font-semibold">{gender}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-t border-surface-container">
                <span className="font-bold text-secondary">Nomor HP</span>
                <span className="col-span-2 text-on-surface font-semibold">{phone}</span>
              </div>
            </div>
          )}
        </section>

        {/* Pesanan Terakhir */}
        <section className="bg-white border border-surface-container rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-surface-container pb-2">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">history</span>
              Pesanan Terakhir
            </h3>
            <button className="text-primary font-bold text-xs hover:underline">Lihat Semua</button>
          </div>

          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((ord, idx) => (
                <div key={idx} className="p-4 border border-surface-container rounded-lg bg-surface-container-low/20 flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-semibold text-xs text-on-surface leading-tight">{ord.item}</p>
                    <p className="text-[10px] text-secondary font-semibold">{ord.invoice}</p>
                    <p className="font-bold text-xs text-primary mt-1">Rp {ord.price.toLocaleString("id-ID")}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${ord.status === "Selesai" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                    {ord.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-secondary border border-dashed border-surface-container rounded-lg font-body text-xs">
                Belum ada pesanan terbaru.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
