export const RETURN_EVIDENCE_GUIDE: {
  title: string;
  items: string[];
  highlight?: boolean;
}[] = [
  {
    title: "Paket sebelum dibuka (kalau masih sempat)",
    items: [
      "Kondisi kardus/plastik.",
      "Label resi pengiriman terlihat jelas.",
    ],
  },
  {
    title: "Video unboxing (ini yang paling penting)",
    highlight: true,
    items: [
      "Rekam dari paket masih tersegel sampai isi keluar.",
      "Jangan ada cut atau edit.",
    ],
  },
  {
    title: "Barang secara keseluruhan",
    items: [
      "Foto seluruh produk.",
      "Dari beberapa sisi (depan, belakang, samping).",
    ],
  },
  {
    title: "Bagian yang bermasalah",
    items: [
      "Kalau rusak, foto kerusakannya dari dekat.",
      "Kalau cacat produksi, fokus ke cacatnya.",
      "Kalau barang salah, foto barang yang diterima.",
    ],
  },
  {
    title: "Perbandingan dengan pesanan",
    items: [
      "Screenshot pesanan di aplikasi.",
      "Foto barang yang datang berdampingan jika ukurannya/jenisnya berbeda.",
    ],
  },
  {
    title: "Aksesoris dan kelengkapan",
    items: ["Kotak.", "Manual.", "Kabel.", "Bonus (kalau ada yang kurang)."],
  },
  {
    title: "Nomor seri atau barcode",
    items: ["Terutama untuk elektronik."],
  },
];

export const RETURN_EVIDENCE_NOTE =
  "Siapkan bukti di atas sebelum atau saat chat dengan admin. Kirim foto/video melalui chat return setelah pengajuan disetujui.";
