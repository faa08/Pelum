"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authService } from "@/backend/authService";
import { addressService } from "@/backend/addressService";
import { supabase } from "@/backend/supabase";
import AddressMapPicker, { type AddressFromMap } from "@/components/AddressMapPicker";

type Alamat = {
  id_alamat: string;
  label: string;
  nama_penerima: string;
  no_telp: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kode_pos: string | null;
  detail_alamat: string;
  is_utama: boolean;
};

type FormState = Omit<Alamat, "id_alamat" | "is_utama">;

const EMPTY_FORM: FormState = {
  label: "Rumah",
  nama_penerima: "",
  no_telp: "",
  provinsi: "",
  kota: "",
  kecamatan: "",
  kode_pos: "",
  detail_alamat: "",
};

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export default function CustomerAddressPage() {
  const [addresses, setAddresses] = useState<Alamat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const user = authService.getCurrentUser();

  const fetchAddresses = async () => {
    if (!user) { setLoading(false); return; }
    if (isPlaceholder()) { setLoading(false); return; }

    const data = await addressService.getAddresses(user.id_user);
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (addr: Alamat) => {
    setEditingId(addr.id_alamat);
    setForm({
      label: addr.label,
      nama_penerima: addr.nama_penerima,
      no_telp: addr.no_telp,
      provinsi: addr.provinsi,
      kota: addr.kota,
      kecamatan: addr.kecamatan,
      kode_pos: addr.kode_pos ?? "",
      detail_alamat: addr.detail_alamat,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    if (isPlaceholder()) {
      // Local-only fallback
      if (editingId) {
        setAddresses((prev) =>
          prev.map((a) => (a.id_alamat === editingId ? { ...a, ...form } : a))
        );
      } else {
        setAddresses((prev) => [
          ...prev,
          { id_alamat: crypto.randomUUID(), is_utama: prev.length === 0, ...form },
        ]);
      }
      setSaving(false);
      setShowForm(false);
      return;
    }

    if (editingId) {
      const ok = await addressService.updateAddress(editingId, user.id_user, form);
      if (!ok) alert("Gagal menyimpan alamat. Coba lagi.");
    } else {
      const created = await addressService.createAddress(user.id_user, form);
      if (!created) alert("Gagal menambahkan alamat. Coba lagi.");
    }

    await fetchAddresses();
    setSaving(false);
    setShowForm(false);
  };

  const handleSetPrimary = async (id: string) => {
    if (!user) return;
    if (isPlaceholder()) {
      setAddresses((prev) => prev.map((a) => ({ ...a, is_utama: a.id_alamat === id })));
      return;
    }
    // Unset all, then set chosen
    await supabase.from("alamat").update({ is_utama: false }).eq("id_user", user.id_user);
    await supabase.from("alamat").update({ is_utama: true }).eq("id_alamat", id);
    await fetchAddresses();
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Hapus alamat "${label}"?`)) return;
    if (isPlaceholder()) {
      setAddresses((prev) => prev.filter((a) => a.id_alamat !== id));
      return;
    }
    await supabase.from("alamat").delete().eq("id_alamat", id);
    await fetchAddresses();
  };

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleMapPick = useCallback((picked: AddressFromMap) => {
    setForm((prev) => ({
      ...prev,
      provinsi: picked.provinsi,
      kota: picked.kota,
      kecamatan: picked.kecamatan,
      kode_pos: picked.kode_pos,
      detail_alamat: picked.detail_alamat,
    }));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface">Daftar Alamat</h2>
          <p className="font-body text-body-md text-secondary mt-1">
            Atur alamat pengiriman untuk memudahkan proses belanja Anda.
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Tambah Alamat Baru
        </button>
      </header>

      {/* Add / Edit Form */}
      {showForm && (
        <section className="bg-white border border-primary/30 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-headline font-bold text-base text-on-surface border-b border-surface-container pb-2">
            {editingId ? "Ubah Alamat" : "Tambah Alamat Baru"}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <AddressMapPicker onPick={handleMapPick} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Label */}
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Label</label>
                <select
                  value={form.label}
                  onChange={(e) => setField("label", e.target.value)}
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  {["Rumah", "Kantor", "Kos", "Lainnya"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              {/* Nama Penerima */}
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Nama Penerima</label>
                <input required value={form.nama_penerima} onChange={(e) => setField("nama_penerima", e.target.value)}
                  placeholder="Nama lengkap penerima"
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
              {/* No Telp */}
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Nomor Telepon</label>
                <input required value={form.no_telp} onChange={(e) => setField("no_telp", e.target.value)}
                  placeholder="+62 8xxx"
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
              {/* Provinsi */}
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Provinsi</label>
                <input required value={form.provinsi} onChange={(e) => setField("provinsi", e.target.value)}
                  placeholder="Provinsi"
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
              {/* Kota */}
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Kota / Kabupaten</label>
                <input required value={form.kota} onChange={(e) => setField("kota", e.target.value)}
                  placeholder="Kota atau kabupaten"
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
              {/* Kecamatan */}
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Kecamatan</label>
                <input required value={form.kecamatan} onChange={(e) => setField("kecamatan", e.target.value)}
                  placeholder="Kecamatan"
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
              {/* Kode Pos */}
              <div className="space-y-1">
                <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Kode Pos</label>
                <input value={form.kode_pos ?? ""} onChange={(e) => setField("kode_pos", e.target.value)}
                  placeholder="Kode pos (opsional)"
                  className="w-full px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary" />
              </div>
            </div>
            {/* Detail Alamat */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">Detail Alamat</label>
              <textarea required value={form.detail_alamat} onChange={(e) => setField("detail_alamat", e.target.value)}
                rows={2} placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
                className="w-full px-3 py-2 border border-surface-container rounded text-sm text-on-surface focus:outline-none focus:border-primary resize-none" />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-surface-container text-secondary font-bold text-xs rounded hover:bg-surface-container transition">
                Batal
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2 bg-primary text-white font-bold text-xs rounded hover:brightness-95 transition disabled:opacity-60">
                {saving ? "Menyimpan..." : "Simpan Alamat"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Address Cards */}
      <section className="space-y-4">
        {loading ? (
          <div className="bg-white border border-surface-container p-10 rounded-xl text-center text-secondary text-sm">
            Memuat alamat...
          </div>
        ) : addresses.length === 0 ? (
          <div className="border-2 border-dashed border-surface-container rounded-xl p-10 text-center text-secondary text-sm">
            Belum ada alamat tersimpan. Tambahkan alamat pengiriman pertama Anda.
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id_alamat}
              className={`bg-white border rounded-xl p-6 shadow-sm relative space-y-3 transition ${
                addr.is_utama ? "border-primary ring-1 ring-primary" : "border-surface-container"
              }`}
            >
              {addr.is_utama && (
                <span className="absolute top-4 right-4 bg-primary text-white text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                  Utama
                </span>
              )}
              <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  {addr.label === "Rumah" ? "home" : addr.label === "Kantor" ? "work" : "location_on"}
                </span>
                {addr.label}
              </h3>
              <p className="text-xs font-bold text-on-surface">
                {addr.nama_penerima}{" "}
                <span className="font-semibold text-secondary">({addr.no_telp})</span>
              </p>
              <p className="text-xs text-secondary font-medium leading-relaxed max-w-3xl">
                {addr.detail_alamat}, {addr.kecamatan}, {addr.kota}, {addr.provinsi}
                {addr.kode_pos ? ` ${addr.kode_pos}` : ""}
              </p>

              <div className="flex items-center gap-4 text-xs font-bold pt-1 border-t border-surface-container/60">
                <button onClick={() => openEditForm(addr)} className="text-primary hover:underline">
                  Ubah
                </button>
                {!addr.is_utama && (
                  <>
                    <span className="text-surface-dim font-light">|</span>
                    <button onClick={() => handleSetPrimary(addr.id_alamat)} className="text-primary hover:underline">
                      Jadikan Utama
                    </button>
                    <span className="text-surface-dim font-light">|</span>
                    <button onClick={() => handleDelete(addr.id_alamat, addr.label)} className="text-error hover:underline">
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Privacy note */}
      <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-3 border border-surface-container text-xs text-secondary font-medium">
        <span className="material-symbols-outlined text-primary">shield</span>
        <span>Informasi alamat hanya dibagikan kepada mitra logistik terpilih saat Anda melakukan transaksi.</span>
      </div>
    </div>
  );
}
