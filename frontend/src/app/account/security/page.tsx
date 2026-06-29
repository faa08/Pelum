"use client";

import React, { useState, useEffect } from "react";
import { authService } from "@/backend/authService";
import { supabase } from "@/backend/supabase";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function CustomerSecurityPage() {
  const [user, setUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);
  const [tfaEnabled, setTfaEnabled] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const u = authService.getCurrentUser();
    setUser(u);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPass !== confirmPass) {
      setPassMsg({ type: "err", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    if (newPass.length < 6) {
      setPassMsg({ type: "err", text: "Kata sandi minimal 6 karakter." });
      return;
    }
    setPassLoading(true);

    if (isPlaceholder()) {
      // No real auth in placeholder mode
      setPassMsg({ type: "ok", text: "Kata sandi berhasil diperbarui (mode lokal)." });
      setShowPasswordForm(false);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      setPassLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) {
      setPassMsg({ type: "err", text: error.message });
    } else {
      setPassMsg({ type: "ok", text: "Kata sandi berhasil diperbarui." });
      setShowPasswordForm(false);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    }
    setPassLoading(false);
  };

  const handleDeleteAccount = async () => {
    const confirmText = prompt("Ketik HAPUS untuk mengonfirmasi penghapusan akun Anda secara permanen:");
    if (confirmText !== "HAPUS") {
      if (confirmText !== null) alert("Konfirmasi tidak valid. Penghapusan dibatalkan.");
      return;
    }
    if (!user) return;

    if (!isPlaceholder()) {
      await supabase.from("users").delete().eq("id_user", user.id_user);
    }
    authService.logout();
    window.location.href = "/";
  };

  const maskedEmail = user?.email
    ? user.email.replace(/^(.{1})(.*)(@.*)$/, (_, f, m, d) => `${f}.${"*".repeat(8)}${d}`)
    : "–";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Keamanan Akun</h2>
        <p className="font-body text-body-md text-secondary mt-1">
          Lindungi akun Anda dengan mengatur keamanan tambahan dan memperbarui kata sandi secara berkala.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Kata Sandi */}
        <section className="bg-white border border-surface-container p-6 rounded-xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">lock</span>
              Kata Sandi
            </h3>
            <p className="text-xs text-secondary font-medium leading-relaxed">
              Ganti kata sandi Anda secara berkala untuk menjaga keamanan akun dari akses yang tidak sah.
            </p>
          </div>

          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              {passMsg && (
                <p className={`text-xs font-semibold px-3 py-2 rounded ${passMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {passMsg.text}
                </p>
              )}
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Kata Sandi Saat Ini</label>
                <input type="password" required value={currentPass} onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Kata Sandi Baru</label>
                <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Konfirmasi Kata Sandi Baru</label>
                <input type="password" required value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowPasswordForm(false); setPassMsg(null); }}
                  className="flex-1 py-2 border border-surface-container text-secondary font-bold text-xs rounded hover:bg-surface-container transition">
                  Batal
                </button>
                <button type="submit" disabled={passLoading}
                  className="flex-1 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition disabled:opacity-60">
                  {passLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowPasswordForm(true)}
              className="w-full py-2.5 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition">
              Ganti Kata Sandi
            </button>
          )}
        </section>

        {/* Verifikasi Kontak */}
        <section className="bg-white border border-surface-container p-6 rounded-xl space-y-4 shadow-sm">
          <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified_user</span>
            Verifikasi Kontak
          </h3>

          <div className="space-y-3 text-xs font-body">
            {/* Email */}
            <div className="flex justify-between items-center py-1">
              <div>
                <p className="font-bold text-secondary">Email</p>
                <p className="font-semibold text-on-surface">{maskedEmail}</p>
              </div>
              <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded">
                Terverifikasi
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* 2FA */}
      <section className="bg-white border border-surface-container p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-2">
          <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">phone_android</span>
            Autentikasi Dua Faktor (2FA)
          </h3>
          <p className="text-xs text-secondary font-medium leading-relaxed max-w-xl">
            Tambahkan lapisan keamanan ekstra ke akun Anda. Setelah diaktifkan, Anda akan diminta memasukkan kode verifikasi setiap kali login.
          </p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-secondary pt-1">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-green-600">done</span>
              Keamanan berlapis
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-green-600">done</span>
              Notifikasi login baru
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition ${tfaEnabled ? "border-green-500 bg-green-50" : "border-surface-container bg-surface-container"}`}>
            <span className={`material-symbols-outlined text-3xl ${tfaEnabled ? "text-green-600" : "text-secondary"}`}>
              {tfaEnabled ? "shield" : "shield"}
            </span>
          </div>
          <button
            onClick={() => setTfaEnabled(!tfaEnabled)}
            className={`w-full py-2 border rounded font-bold text-xs transition ${
              tfaEnabled
                ? "bg-green-600 border-green-600 text-white"
                : "border-on-surface text-on-surface hover:bg-surface-container"
            }`}
          >
            {tfaEnabled ? "Matikan 2FA" : "Aktifkan 2FA"}
          </button>
        </div>
      </section>

      {/* Hapus Akun */}
      <section className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h4 className="font-headline font-bold text-red-700 text-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Hapus Akun
          </h4>
          <p className="text-xs text-red-600 font-semibold leading-relaxed max-w-xl">
            Menghapus akun akan menghilangkan semua data pesanan, wishlist, dan profil Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-100 font-bold text-xs rounded transition whitespace-nowrap"
        >
          Hapus Akun Saya
        </button>
      </section>
    </div>
  );
}
