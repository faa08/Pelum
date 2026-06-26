export const PICKUP_STORE_ADDRESS =
  "Ruko BBS, Jl. Bukit Baja Sejahtera No.9 Blok B3, Ciwaduk, Kec. Cilegon, Kota Cilegon, Banten 42415";

export const PICKUP_CONFIRM_SECONDS = 10;

export type CheckoutPaymentType = "digital" | "offline";

export const CHECKOUT_PAYMENT_OPTIONS: {
  id: CheckoutPaymentType;
  name: string;
  desc: string;
}[] = [
  {
    id: "digital",
    name: "Bayar Digital",
    desc: "Midtrans — VA, e-wallet, QRIS, kartu kredit",
  },
  {
    id: "offline",
    name: "Ambil di Toko",
    desc: "Bayar di tempat & ambil sendiri di lokasi kami",
  },
];

export type OrderPaymentKind = "pickup" | "digital";

export interface OrderPaymentDisplay {
  kind: OrderPaymentKind;
  label: string;
  desc: string;
}

/** Label pembayaran untuk tampilan admin & detail pesanan */
export function getOrderPaymentDisplay(input: {
  tipe_pembayaran?: string | null;
  metod_pay?: string | null;
  kurir?: string | null;
  catatan?: string | null;
}): OrderPaymentDisplay {
  const isPickup =
    input.tipe_pembayaran === "offline" ||
    input.metod_pay === "cod" ||
    input.kurir === "Ambil di Toko";

  if (isPickup) {
    return {
      kind: "pickup",
      label: "Bayar di Tempat",
      desc: input.catatan || "Ambil di toko — bayar & ambil barang di lokasi Pelataran UMKM",
    };
  }

  const methodHint =
    input.metod_pay === "qris"
      ? "QRIS / Midtrans"
      : input.metod_pay
        ? String(input.metod_pay).toUpperCase()
        : "Midtrans";

  return {
    kind: "digital",
    label: "Bayar QRIS",
    desc: `Pembayaran digital (${methodHint}) — koordinasi pengiriman lewat chat admin`,
  };
}

export function getPaymentBadgeClass(kind: OrderPaymentKind): string {
  return kind === "pickup"
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-indigo-50 text-indigo-800 border-indigo-200";
}
