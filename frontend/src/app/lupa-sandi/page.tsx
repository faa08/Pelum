"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/backend/authService";

const C = {
  primary: "#1D4ED8",
  primaryDark: "#1E40AF",
  primaryPale: "#EFF6FF",
  border: "#EAE5E0",
  borderStrong: "#D5CFC9",
  text: "#1F1B18",
  textSec: "#5C5550",
  textMuted: "#8E8680",
};

export default function LupaSandiPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [step, setStep] = useState(1); // 1: Email check, 2: New Password, 3: Success
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleCheckEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const exists = await authService.checkEmailExists(email);
      if (exists) {
        setStep(2);
      } else {
        setErrorMsg("Email tidak terdaftar! Silakan periksa kembali atau buat akun baru.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || !confirmPassword.trim()) return;
    if (password.length < 6) {
      setErrorMsg("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok!");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const success = await authService.resetPassword(email, password);
      if (success) {
        setStep(3);
      } else {
        setErrorMsg("Gagal memperbarui kata sandi. Silakan coba lagi.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDEA", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ display: "flex", width: "100%", maxWidth: 860, minHeight: 520, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>

          {/* Left Panel */}
          <div style={{ width: 380, flexShrink: 0, background: `linear-gradient(160deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, padding: "48px 36px", display: "flex", flexDirection: "column", gap: 24, color: "white" }}>
            <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.5)", borderRadius: 2 }} />
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.25, margin: "0 0 12px 0" }}>Lupa Kata Sandi?</h2>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.65, opacity: 0.85, margin: 0 }}>Ubah kata sandi Anda dengan aman dalam beberapa langkah mudah.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
              {[
                { num: "1", text: "Verifikasi alamat email Anda", active: step === 1 },
                { num: "2", text: "Buat kata sandi baru yang kuat", active: step === 2 },
                { num: "3", text: "Selesai! Masuk ke akun Anda", active: step === 3 },
              ].map((s) => (
                <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: 14, opacity: s.active ? 1 : 0.6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: s.active ? "white" : "rgba(255,255,255,0.2)",
                    color: s.active ? C.primary : "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 800, flexShrink: 0
                  }}>
                    {s.num}
                  </div>
                  <p style={{ fontSize: "0.85rem", fontWeight: s.active ? 700 : 400, margin: 0, lineHeight: 1.5, paddingTop: 4 }}>{s.text}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", padding: "16px", background: "rgba(255,255,255,0.12)", borderRadius: 10 }}>
              <p style={{ fontSize: "0.8rem", opacity: 0.8, margin: 0, lineHeight: 1.6 }}>🔒 Akun Anda diamankan menggunakan verifikasi database enkripsi aman.</p>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ flex: 1, background: "white", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {errorMsg && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: "0.8125rem", color: "#DC2626", fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {step === 1 && (
              <>
                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.text, margin: "0 0 8px 0" }}>Verifikasi Email</h1>
                  <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>Masukkan email Anda yang telah terdaftar.</p>
                </div>
                <form onSubmit={handleCheckEmail} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>Alamat Email</label>
                    <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                      <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}><Mail size={16} /></span>
                      <input
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ width: "100%", height: 48, background: loading ? C.primaryDark : C.primary, color: "white", border: "none", borderRadius: 8, fontSize: "0.875rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {loading ? "Memverifikasi..." : "CARI AKUN"}
                  </button>
                  <Link href="/masuk" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.875rem", color: C.textSec, fontWeight: 600, textDecoration: "none", paddingTop: 4 }}>
                    <ArrowLeft size={15} /> Kembali ke halaman masuk
                  </Link>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.text, margin: "0 0 8px 0" }}>Kata Sandi Baru</h1>
                  <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>Masukkan kata sandi baru untuk <strong>{email}</strong>.</p>
                </div>
                <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Password */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>Kata Sandi Baru</label>
                    <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                      <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}><Lock size={16} /></span>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{ padding: "0 14px", background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center", height: "100%" }}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {password.length > 0 && password.length < 6 && (
                      <p style={{ fontSize: "0.75rem", color: "#DC2626", margin: "6px 0 0 0", fontWeight: 600 }}>
                        Kata sandi baru minimal 6 karakter.
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>Konfirmasi Kata Sandi Baru</label>
                    <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                      <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}><Lock size={16} /></span>
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ padding: "0 14px", background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center", height: "100%" }}
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{ width: "100%", height: 48, background: loading ? C.primaryDark : C.primary, color: "white", border: "none", borderRadius: 8, fontSize: "0.875rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {loading ? "Memproses..." : "RESET KATA SANDI"}
                  </button>
                </form>
              </>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={36} color="#16A34A" strokeWidth={1.8} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: C.text, margin: "0 0 10px 0" }}>Kata Sandi Diubah!</h2>
                  <p style={{ fontSize: "0.9rem", color: C.textSec, lineHeight: 1.65, margin: 0, maxWidth: 320 }}>
                    Kata sandi untuk akun <strong style={{ color: C.text }}>{email}</strong> telah berhasil diperbarui. Silakan masuk kembali.
                  </p>
                </div>
                <Link href="/masuk" style={{ display: "flex", alignItems: "center", gap: 6, height: 48, width: "100%", background: C.primary, color: "white", borderRadius: 8, fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", justifyContent: "center" }}>
                  MASUK SEKARANG
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
