"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, Users, Grid, Phone, Calendar } from "lucide-react";

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

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const generateUsername = (fullName: string): string => {
    const base = fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "");
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}${suffix}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Basic validations
    if (!name.trim()) {
      setErrorMsg("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Alamat email wajib diisi.");
      return;
    }
    if (!dob) {
      setErrorMsg("Tanggal lahir wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const username = generateUsername(name);
      const newUser = await authService.register(username, email, phone, password, dob);
      if (newUser) {
        // Auto-login after successful registration
        authService.setCurrentUser(newUser);
        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke profil Anda...");
        setTimeout(() => {
          router.push("/account/profile");
        }, 800);
      } else {
        setErrorMsg("Pendaftaran gagal. Silakan coba lagi.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDEA", display: "flex", flexDirection: "column" }}>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Main Card ── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{
          display: "flex",
          width: "100%",
          maxWidth: 900,
          minHeight: 620,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        }}>

          {/* ── Left Panel ── */}
          <div style={{
            width: 420,
            flexShrink: 0,
            background: C.primaryPale,
            padding: "40px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            {/* Accent line */}
            <div style={{ width: 40, height: 4, background: C.primary, borderRadius: 2 }} />

            {/* Headline */}
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.text, lineHeight: 1.25, margin: "0 0 6px 0" }}>
                Berdayakan Bisnis
              </h2>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.primary, lineHeight: 1.25, margin: "0 0 16px 0" }}>
                Lokal Anda
              </h2>
              <p style={{ fontSize: "0.875rem", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
                Platform digital terpadu untuk menghubungkan produk unggulan UMKM Indonesia dengan pembeli di seluruh nusantara.
              </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: <Users size={18} color={C.textSec} />, value: "15k+", label: "Pelaku UMKM" },
                { icon: <Grid size={18} color={C.textSec} />, value: "500+", label: "Kategori Produk" },
              ].map((s, i) => (
                <div key={i} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                  {s.icon}
                  <p style={{ fontSize: "1.1rem", fontWeight: 800, color: C.text, margin: 0 }}>{s.value}</p>
                  <p style={{ fontSize: "0.7rem", color: C.textMuted, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* UMKM Photo */}
            <div style={{
              position: "relative",
              width: "100%",
              borderRadius: 10,
              overflow: "hidden",
              aspectRatio: "4/3",
              marginTop: "auto",
            }}>
              <Image src="/register-umkm.png" alt="Produk UMKM Indonesia" fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={{
            flex: 1,
            background: "white",
            borderLeft: `1px solid ${C.border}`,
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: C.text, margin: "0 0 6px 0" }}>Buat Akun Baru</h1>
            <p style={{ fontSize: "0.875rem", color: C.textMuted, margin: "0 0 24px 0" }}>Mulai langkah suksesmu di Pelataran UMKM.</p>

            {/* Error Message */}
            {errorMsg && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: "0.8125rem", color: "#DC2626", fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: "0.8125rem", color: "#16A34A", fontWeight: 600 }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Nama Lengkap
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Alamat Email
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  No. Telepon <span style={{ fontWeight: 400, color: C.textMuted }}>(opsional)</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent" }}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Tanggal Lahir
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    disabled={loading}
                    style={{ flex: 1, border: "none", outline: "none", height: "100%", fontSize: "0.875rem", color: C.text, fontFamily: "inherit", background: "transparent", paddingRight: 14 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Kata Sandi
                </label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${C.borderStrong}`, borderRadius: 8, overflow: "hidden", background: "white", height: 48 }}>
                  <span style={{ padding: "0 14px", color: C.textMuted, display: "flex", alignItems: "center" }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
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
                    Kata sandi minimal 6 karakter.
                  </p>
                )}
              </div>

              {/* Terms */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={loading}
                  style={{ width: 16, height: 16, accentColor: C.primary, cursor: "pointer", marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontSize: "0.8125rem", color: C.textSec, lineHeight: 1.5 }}>
                  Saya menyetujui{" "}
                  <Link href="/syarat-ketentuan" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Syarat &amp; Ketentuan</Link>
                  {" "}serta{" "}
                  <Link href="/kebijakan-privasi" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Kebijakan Privasi</Link>
                  {" "}yang berlaku.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={!agreed || loading}
                style={{
                  width: "100%", height: 48, background: (!agreed || loading) ? C.borderStrong : C.primary,
                  color: "white", border: "none", borderRadius: 8, fontSize: "0.875rem",
                  fontWeight: 700, cursor: (!agreed || loading) ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "inherit", opacity: loading ? 0.8 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Mendaftarkan..." : "Daftar Sekarang →"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: "0.75rem", color: C.textMuted, whiteSpace: "nowrap" }}>Atau daftar dengan</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => authService.loginWithGoogle()}
                disabled={loading}
                style={{
                  width: "100%", height: 48, border: `1.5px solid ${C.borderStrong}`, borderRadius: 8,
                  background: "white", fontSize: "0.875rem", fontWeight: 600, color: C.text,
                  cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 10, fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: "1rem" }}>🌐</span> Google
              </button>

              {/* Login Link */}
              <p style={{ textAlign: "center", fontSize: "0.875rem", color: C.textMuted, margin: 0 }}>
                Sudah punya akun?{" "}
                <Link href="/masuk" style={{ color: C.text, fontWeight: 700, textDecoration: "none" }}>
                  Masuk di sini
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
