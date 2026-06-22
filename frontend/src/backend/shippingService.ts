import { supabase } from "./supabase";

export interface ShipmentRecord {
  id_pengiriman: string;
  id_order: string;
  kurir: string;
  no_resi?: string;
  stat_kirim: "belum_dikirim" | "sedang_dikirim" | "sampai" | "gagal";
  estimasi_tiba?: string;
  tgl_dikirim?: string;
  created_at: string;
}

export interface ShippingRate {
  courier: string;
  service: string;
  cost: number;
  etd: string; // Estimated time of delivery, e.g. "2-3 hari"
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

export const shippingService = {
  /**
   * Mengambil rate ongkos kirim (mock Biteship/RajaOngkir).
   * Menghitung berdasarkan kota asal, kota tujuan, dan berat produk.
   */
  async getShippingRates(
    origin: string,
    destination: string,
    weightInGrams: number
  ): Promise<ShippingRate[]> {
    console.log(`shippingService.getShippingRates: origin=${origin}, dest=${destination}, weight=${weightInGrams}g`);

    // Standard rate calculation base
    const baseCost = Math.max(9000, Math.ceil(weightInGrams / 1000) * 10000);

    return [
      {
        courier: "JNE",
        service: "Reguler (REG)",
        cost: baseCost,
        etd: "2-3 hari"
      },
      {
        courier: "J&T",
        service: "EZ",
        cost: baseCost - 1000,
        etd: "2-4 hari"
      },
      {
        courier: "SiCepat",
        service: "Regular",
        cost: baseCost + 2000,
        etd: "1-2 hari"
      },
      {
        courier: "Pelum Express",
        service: "Sameday",
        cost: baseCost + 15000,
        etd: "6-12 jam"
      }
    ];
  },

  // Create empty or pending shipment record for an order
  async createShipment(
    orderId: string,
    courier: string,
    resi?: string
  ): Promise<boolean> {
    const estArrival = new Date();
    estArrival.setDate(estArrival.getDate() + 3); // 3 days estimate

    if (isPlaceholder()) {
      const key = `pelum_shipments`;
      const shipments: ShipmentRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      
      const filtered = shipments.filter(s => s.id_order !== orderId);
      filtered.push({
        id_pengiriman: Math.random().toString(36).substring(2, 9),
        id_order: orderId,
        kurir: courier,
        no_resi: resi,
        stat_kirim: resi ? "sedang_dikirim" : "belum_dikirim",
        estimasi_tiba: estArrival.toISOString().split("T")[0],
        tgl_dikirim: resi ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    }

    try {
      // Check if existing
      const { data: existing } = await supabase
        .from("pengiriman")
        .select("id_pengiriman")
        .eq("id_order", orderId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("pengiriman")
          .update({
            kurir: courier,
            no_resi: resi || null,
            stat_kirim: resi ? "sedang_dikirim" : "belum_dikirim",
            tgl_dikirim: resi ? new Date().toISOString() : null
          })
          .eq("id_pengiriman", existing.id_pengiriman);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pengiriman")
          .insert({
            id_order: orderId,
            kurir: courier,
            no_resi: resi || null,
            stat_kirim: resi ? "sedang_dikirim" : "belum_dikirim",
            estimasi_tiba: estArrival.toISOString().split("T")[0],
            tgl_dikirim: resi ? new Date().toISOString() : null
          });
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error("shippingService.createShipment failed:", err);
      return false;
    }
  },

  // Get shipment information
  async getShipmentForOrder(orderId: string): Promise<ShipmentRecord | null> {
    if (isPlaceholder()) {
      const key = `pelum_shipments`;
      const shipments: ShipmentRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      return shipments.find(s => s.id_order === orderId) || null;
    }

    try {
      const { data, error } = await supabase
        .from("pengiriman")
        .select("*")
        .eq("id_order", orderId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("shippingService.getShipmentForOrder failed:", err);
      return null;
    }
  },

  // Update status and Resi by Seller when they ship
  async updateShipmentStatus(
    orderId: string,
    status: "belum_dikirim" | "sedang_dikirim" | "sampai" | "gagal",
    resi?: string
  ): Promise<boolean> {
    if (isPlaceholder()) {
      const key = `pelum_shipments`;
      const shipments: ShipmentRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      const idx = shipments.findIndex(s => s.id_order === orderId);
      if (idx !== -1) {
        shipments[idx].stat_kirim = status;
        if (resi) shipments[idx].no_resi = resi;
        if (status === "sedang_dikirim") shipments[idx].tgl_dikirim = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(shipments));
        return true;
      }
      return false;
    }

    try {
      const updates: any = { stat_kirim: status };
      if (resi) updates.no_resi = resi;
      if (status === "sedang_dikirim") updates.tgl_dikirim = new Date().toISOString();

      const { error } = await supabase
        .from("pengiriman")
        .update(updates)
        .eq("id_order", orderId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("shippingService.updateShipmentStatus failed:", err);
      return false;
    }
  }
};
