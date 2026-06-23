"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Store, User, Phone, MapPin, CreditCard, Upload, CheckCircle, ChevronRight, ShieldCheck, Camera } from "lucide-react";
import { sellerService } from "@/backend/sellerService";
import { authService } from "@/backend/authService";

type Step = 1 | 2 | 3;

interface SellerForm {
  // Step 1 - Info Toko
  storeName: string;
  ownerName: string;
  storeDesc: string;
  storeCategory: string;
  storeLogo: string | null;
  // Step 2 - Kontak & Lokasi
  phone: string;
  address: string;
  province: string;
  city: string;
  // Step 3 - Rekening & Verifikasi
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  ktpImage: string | null;
}

const CATEGORIES = ["Fashion & Tekstil", "Kerajinan Tangan", "Kuliner & Minuman", "Kecantikan & Perawatan", "Pertanian & Perkebunan", "Elektronik Lokal", "Seni & Dekorasi", "Lainnya"];
const BANKS = ["BCA", "BNI", "Bank Mandiri", "BRI", "BSI", "CIMB Niaga", "Permata Bank"];
const PROVINCES = ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "DI Yogyakarta", "Bali", "Sumatera Utara", "Sulawesi Selatan", "Kalimantan Timur", "Lainnya"];

export default function BecomeSellerPage() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const ktpInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<SellerForm>({
    storeName: "", ownerName: "", storeDesc: "", storeCategory: "",
    storeLogo: null, phone: "", address: "", province: "", city: "",
    bankName: "", accountNumber: "", accountHolder: "", ktpImage: null,
  });

  const set = (key: keyof SellerForm, value: string | null) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleImageUpload(key: "storeLogo" | "ktpImage", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set(key, url);
  }

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const currentUser = authService.getCurrentUser();
      const email = currentUser?.email || `${form.storeName.toLowerCase().replace(/\s+/g, ".")}@pelataranumkm.id`;

      const result = await sellerService.createStore(
        form.storeName,
        email,
        form.phone,
        form.storeDesc,
        `${form.address}, ${form.city}, ${form.province}`,
        form.bankName,
        form.accountNumber,
        form.accountHolder,
        false,
        form.ownerName,
        form.storeLogo || undefined
      );

      if (!result) {
        setSubmitError("Gagal mendaftarkan toko. Email mungkin sudah terdaftar.");
        return;
      }

      // Update user role to seller in local session
      if (currentUser) {
        authService.setCurrentUser({ ...currentUser, role: "seller" });
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function canNext() {
    if (step === 1) return form.storeName.trim() && form.ownerName.trim() && form.storeCategory;
    if (step === 2) return form.phone.trim() && form.address.trim() && form.province && form.city.trim();
    if (step === 3) return form.bankName && form.accountNumber.trim() && form.accountHolder.trim();
    return false;
  }

  const STEPS = [
    { num: 1, label: "Info Toko" },
    { num: 2, label: "Kontak & Lokasi" },
    { num: 3, label: "Rekening & Verifikasi" },
  ];

  if (submitted) {
    return (
      <div className="space-y-8">
        <header>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Daftar Menjadi Seller</h2>
        </header>
        <div className="bg-white border border-surface-container rounded-xl p-14 flex flex-col items-center text-center gap-5 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-on-surface mb-2">Pendaftaran Terkirim!</h3>
            <p className="text-sm text-secondary leading-relaxed max-w-sm">
              Toko <strong className="text-on-surface">{form.storeName}</strong> sedang dalam proses verifikasi oleh tim kami.
              Estimasi 1–2 hari kerja. Kami akan menghubungi melalui nomor <strong className="text-on-surface">{form.phone}</strong>.
            </p>
          </div>
          <div className="w-full max-w-sm bg-[#F8FAFF] border border-[#E8F0FE] rounded-xl p-5 text-left space-y-2.5">
            {[
              { label: "Nama Toko", value: form.storeName },
              { label: "Nama Pemilik", value: form.ownerName },
              { label: "Kategori", value: form.storeCategory },
              { label: "Bank", value: `${form.bankName} — a/n ${form.accountHolder}` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-secondary font-medium">{item.label}</span>
                <span className="font-bold text-on-surface">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-primary font-semibold bg-primary-container px-4 py-2.5 rounded-full">
            <ShieldCheck size={14} />
            Toko akan aktif setelah verifikasi selesai
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Daftar Menjadi Seller</h2>
        <p className="text-secondary text-sm mt-1">Lengkapi data di bawah untuk membuka toko UMKM kamu di Pelataran UMKM.</p>
      </header>

      {/* Step Indicator */}
      <div className="bg-white border border-surface-container rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ${
                  step > s.num ? "bg-green-500 text-white" :
                  step === s.num ? "bg-primary text-white" :
                  "bg-surface-container text-secondary"
                }`}>
                  {step > s.num ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className={`text-[10px] font-bold whitespace-nowrap ${step === s.num ? "text-primary" : "text-secondary"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 mb-4 transition-all ${step > s.num ? "bg-green-400" : "bg-surface-container"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-surface-container rounded-xl p-8 shadow-sm">

        {/* ── STEP 1: Info Toko ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-surface-container">
              <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-primary"><Store size={18} /></div>
              <h3 className="font-extrabold text-on-surface">Informasi Toko</h3>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Logo Toko</label>
              <div className="flex items-center gap-5">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-[#D5CFC9] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary-container transition relative overflow-hidden bg-surface-container-low"
                >
                  {form.storeLogo ? (
                    <Image src={form.storeLogo} alt="Logo toko" fill style={{ objectFit: "cover" }} />
                  ) : (
                    <>
                      <Camera size={22} className="text-secondary mb-1.5" />
                      <span className="text-[10px] text-secondary font-semibold text-center px-2">Upload Logo</span>
                    </>
                  )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload("storeLogo", e)} />
                <div className="text-xs text-secondary leading-relaxed space-y-1">
                  <p className="font-semibold text-on-surface">Upload logo toko kamu</p>
                  <p>Format: JPG, PNG, WebP</p>
                  <p>Ukuran maks: 2 MB</p>
                  <p>Rekomendasi: 400×400px</p>
                </div>
              </div>
            </div>

            {/* Nama Toko */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Nama Toko <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-[#D5CFC9] rounded-lg overflow-hidden focus-within:border-primary transition">
                <span className="px-3 text-secondary flex items-center"><Store size={15} /></span>
                <input
                  type="text"
                  placeholder="contoh: Griya Keramik Kasongan"
                  value={form.storeName}
                  onChange={(e) => set("storeName", e.target.value)}
                  className="flex-1 h-11 border-none outline-none text-sm font-medium text-on-surface bg-transparent pr-4"
                />
              </div>
            </div>

            {/* Nama Pemilik */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Nama Pemilik Toko <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-[#D5CFC9] rounded-lg overflow-hidden focus-within:border-primary transition">
                <span className="px-3 text-secondary flex items-center"><User size={15} /></span>
                <input
                  type="text"
                  placeholder="Nama lengkap sesuai KTP"
                  value={form.ownerName}
                  onChange={(e) => set("ownerName", e.target.value)}
                  className="flex-1 h-11 border-none outline-none text-sm font-medium text-on-surface bg-transparent pr-4"
                />
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Kategori Utama Produk <span className="text-red-500">*</span>
              </label>
              <select
                value={form.storeCategory}
                onChange={(e) => set("storeCategory", e.target.value)}
                className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition bg-white"
              >
                <option value="">Pilih kategori...</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Deskripsi Toko <span className="text-secondary font-normal normal-case">(opsional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ceritakan tentang toko dan produk unggulan kamu..."
                value={form.storeDesc}
                onChange={(e) => set("storeDesc", e.target.value)}
                className="w-full border border-[#D5CFC9] rounded-lg px-4 py-3 text-sm font-medium text-on-surface outline-none focus:border-primary transition resize-none"
              />
              <p className="text-[10px] text-secondary mt-1">{form.storeDesc.length}/300 karakter</p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Kontak & Lokasi ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-surface-container">
              <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-primary"><MapPin size={18} /></div>
              <h3 className="font-extrabold text-on-surface">Kontak & Lokasi Toko</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-[#D5CFC9] rounded-lg overflow-hidden focus-within:border-primary transition">
                <span className="px-3 text-secondary flex items-center"><Phone size={15} /></span>
                <input
                  type="tel"
                  placeholder="contoh: 08123456789"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="flex-1 h-11 border-none outline-none text-sm font-medium text-on-surface bg-transparent pr-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.province}
                  onChange={(e) => set("province", e.target.value)}
                  className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition bg-white"
                >
                  <option value="">Pilih provinsi...</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Kota / Kabupaten <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: Bantul"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Alamat Lengkap Toko <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Jl. Kerajinan No. 12, Kasongan, Bantul..."
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="w-full border border-[#D5CFC9] rounded-lg px-4 py-3 text-sm font-medium text-on-surface outline-none focus:border-primary transition resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Rekening & KTP ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-surface-container">
              <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-primary"><CreditCard size={18} /></div>
              <h3 className="font-extrabold text-on-surface">Rekening Bank & Verifikasi</h3>
            </div>

            <div className="bg-[#FFF9F0] border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 font-medium leading-relaxed">
              Rekening ini digunakan untuk menerima pembayaran dari pembeli. Pastikan data benar dan atas nama pemilik toko.
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Pilih Bank <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BANKS.map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => set("bankName", bank)}
                    className={`py-2.5 rounded-lg text-xs font-bold border-2 transition ${
                      form.bankName === bank
                        ? "border-primary bg-primary-container text-primary"
                        : "border-surface-container text-secondary hover:border-primary"
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Nomor Rekening <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: 1234567890"
                  value={form.accountNumber}
                  onChange={(e) => set("accountNumber", e.target.value)}
                  className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Atas Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama sesuai buku tabungan"
                  value={form.accountHolder}
                  onChange={(e) => set("accountHolder", e.target.value)}
                  className="w-full h-11 border border-[#D5CFC9] rounded-lg px-4 text-sm font-medium text-on-surface outline-none focus:border-primary transition"
                />
              </div>
            </div>

            {/* Upload KTP */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-3">
                Foto KTP Pemilik <span className="text-secondary font-normal normal-case">(untuk verifikasi)</span>
              </label>
              <div
                onClick={() => ktpInputRef.current?.click()}
                className="relative w-full h-36 border-2 border-dashed border-[#D5CFC9] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary-container transition overflow-hidden"
              >
                {form.ktpImage ? (
                  <Image src={form.ktpImage} alt="KTP" fill style={{ objectFit: "cover" }} />
                ) : (
                  <>
                    <Upload size={24} className="text-secondary mb-2" />
                    <p className="text-sm font-semibold text-on-surface">Klik untuk upload foto KTP</p>
                    <p className="text-xs text-secondary mt-1">JPG atau PNG, maks 5 MB</p>
                  </>
                )}
              </div>
              <input ref={ktpInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload("ktpImage", e)} />
            </div>

            {/* Summary */}
            <div className="bg-[#F8FAFF] border border-[#E8F0FE] rounded-xl p-5 space-y-2">
              <p className="text-xs font-extrabold text-primary uppercase tracking-wider mb-3">Ringkasan Pendaftaran</p>
              {[
                { label: "Nama Toko", value: form.storeName },
                { label: "Pemilik", value: form.ownerName },
                { label: "Kategori", value: form.storeCategory },
                { label: "Lokasi", value: form.city && form.province ? `${form.city}, ${form.province}` : "-" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-secondary font-medium">{item.label}</span>
                  <span className="font-bold text-on-surface">{item.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-container">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="px-5 py-2.5 border border-[#D5CFC9] text-secondary font-bold text-sm rounded-lg hover:bg-surface-container transition"
            >
              Kembali
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjut <ChevronRight size={15} />
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {submitError && (
                <p className="text-xs text-red-600 font-semibold">{submitError}</p>
              )}
              <button
                type="button"
                disabled={!canNext() || submitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Mendaftarkan...</>
                ) : (
                  <><ShieldCheck size={15} />Kirim Pendaftaran</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
