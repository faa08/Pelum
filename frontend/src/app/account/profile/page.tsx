"use client";

import React, { useState, useEffect, useRef } from "react";
import { authService } from "@/backend/authService";

export default function CustomerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setUsername(currentUser.username || "");
      setFullname(currentUser.nama_lengkap || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.no_telp || "");
      setStoreName(currentUser.nama_toko || currentUser.username || "");
      setGender(currentUser.jenis_kelamin || "");
      setBirthdate(currentUser.tanggal_lahir || "");
      setAvatarPreview(currentUser.avatar || null);
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const success = await authService.updateProfile(user.id_user, fullname, phone, {
        username,
        avatar: avatarPreview ?? user.avatar,
      });
      if (success) {
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
        alert("Profil berhasil diperbarui!");
      }
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-secondary text-sm">
        Loading profil...
      </div>
    );
  }

  // Mask email: d.********@gmail.com
  const maskedEmail = email.replace(
    /^(.{1})(.*)(@.*)$/,
    (_, first, middle, domain) => `${first}.${"*".repeat(8)}${domain}`
  );

  return (
    <div className="bg-white border border-surface-container rounded-xl shadow-sm">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-surface-container">
        <h2 className="font-headline font-bold text-xl text-on-surface">Profil Saya</h2>
        <p className="text-sm text-secondary mt-0.5">
          Kelola informasi profil Anda untuk mengontrol, melindungi dan mengamankan akun
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div className="flex flex-col md:flex-row">
          {/* Left: Form */}
          <div className="flex-1 px-8 py-6 space-y-5">

            {/* Username */}
            <div className="flex items-start gap-4">
              <label className="w-32 text-right text-sm text-on-surface pt-2 shrink-0">
                Username
              </label>
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-secondary">Username hanya dapat diubah satu (1) kali.</p>
              </div>
            </div>

            {/* Nama */}
            <div className="flex items-center gap-4">
              <label className="w-32 text-right text-sm text-on-surface shrink-0">
                Nama
              </label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full max-w-sm px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <label className="w-32 text-right text-sm text-on-surface shrink-0">
                Email
              </label>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-on-surface">{maskedEmail}</span>
                <button type="button" className="text-primary text-sm hover:underline font-medium">
                  Ubah
                </button>
              </div>
            </div>

            {/* Nomor Telepon */}
            <div className="flex items-center gap-4">
              <label className="w-32 text-right text-sm text-secondary shrink-0">
                Nomor Telepon
              </label>
              <div className="flex items-center gap-2 text-sm">
                {phone ? (
                  <span className="text-on-surface">{phone}</span>
                ) : (
                  <button type="button" className="text-primary text-sm hover:underline font-medium">
                    Tambah
                  </button>
                )}
              </div>
            </div>

            {/* Nama Toko */}
            <div className="flex items-center gap-4">
              <label className="w-32 text-right text-sm text-on-surface shrink-0">
                Nama Toko
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full max-w-sm px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Jenis Kelamin */}
            <div className="flex items-center gap-4">
              <label className="w-32 text-right text-sm text-on-surface shrink-0">
                Jenis Kelamin
              </label>
              <div className="flex items-center gap-4 text-sm text-on-surface">
                {["Laki-laki", "Perempuan", "Lainnya"].map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={opt}
                      checked={gender === opt}
                      onChange={() => setGender(opt)}
                      className="accent-primary"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Tanggal Lahir */}
            <div className="flex items-center gap-4">
              <label className="w-32 text-right text-sm text-on-surface shrink-0 flex items-center justify-end gap-1">
                Tanggal lahir
                <span className="material-symbols-outlined text-[14px] text-secondary cursor-help" title="Tanggal lahir tidak dapat dilihat publik">
                  help
                </span>
              </label>
              <div className="flex items-center gap-2">
                {birthdate ? (
                  <span className="text-sm text-on-surface">{birthdate}</span>
                ) : (
                  <span className="text-sm text-on-surface">–</span>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-2">
              <div className="w-32 shrink-0" />
              <button
                type="submit"
                className="px-8 py-2.5 bg-primary text-white font-semibold text-sm rounded hover:brightness-95 transition"
              >
                Simpan
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-surface-container my-6" />

          {/* Right: Avatar Upload */}
          <div className="flex flex-col items-center justify-start px-10 py-10 gap-4">
            {/* Avatar Circle */}
            <div className="w-24 h-24 rounded-full overflow-hidden border border-surface-container bg-zinc-200 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[48px] text-zinc-400">person</span>
              )}
            </div>

            {/* Upload Button */}
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2 border border-surface-container rounded text-sm text-on-surface hover:bg-surface-container/50 transition"
            >
              Pilih Gambar
            </button>

            <div className="text-center text-xs text-secondary space-y-0.5">
              <p>Ukuran gambar: maks. 1 MB</p>
              <p>Format gambar: .JPEG, .PNG</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
