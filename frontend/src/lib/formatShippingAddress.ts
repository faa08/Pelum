import { PICKUP_STORE_ADDRESS } from "@/lib/checkoutConstants";

export type AddressParts = {
  nama_penerima?: string | null;
  no_telp?: string | null;
  label?: string | null;
  detail_alamat?: string | null;
  kecamatan?: string | null;
  kota?: string | null;
  provinsi?: string | null;
  kode_pos?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export function formatShippingAddressText(addr: AddressParts): string {
  const lines: string[] = [];
  if (addr.nama_penerima) {
    const phone = addr.no_telp ? ` · ${addr.no_telp}` : "";
    lines.push(`Penerima: ${addr.nama_penerima}${phone}`);
  }
  if (addr.label) lines.push(`Label: ${addr.label}`);
  const street = [addr.detail_alamat, addr.kecamatan, addr.kota, addr.provinsi]
    .filter(Boolean)
    .join(", ");
  const withPos = addr.kode_pos ? `${street} ${addr.kode_pos}`.trim() : street;
  if (withPos) lines.push(withPos);
  return lines.join("\n").trim() || "Alamat tidak tersedia";
}

export function resolveOrderShippingAddress(input: {
  alamat?: AddressParts | null;
  catatan?: string | null;
  isPickup?: boolean;
}): string {
  if (input.isPickup) {
    return input.catatan?.includes("Ambil di toko")
      ? PICKUP_STORE_ADDRESS
      : input.catatan || PICKUP_STORE_ADDRESS;
  }
  if (input.alamat?.detail_alamat) {
    return formatShippingAddressText(input.alamat);
  }
  if (input.catatan && !input.catatan.includes("Ambil di toko")) {
    return input.catatan;
  }
  return "Alamat belum tercatat";
}
