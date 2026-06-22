import { supabase } from "./supabase";

export interface PaymentRecord {
  id_payment: string;
  id_order: string;
  juml_pay: number;
  metod_pay: "transfer_bank" | "e_wallet" | "cod" | "qris" | "va" | "kartu_kredit";
  stat_pay: "pending" | "success" | "failed" | "expired";
  bukti_bayar?: string;
  tgl_pay?: string;
  created_at: string;
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

export const paymentService = {
  /**
   * Menginisialisasi sesi pembayaran Midtrans (Snap API).
   * Karena API Key belum di-set, kita return token dummy dan URL Simulator
   * yang bisa disimulasikan langsung di frontend, serta mempersiapkan endpoint API
   * jika nantinya user memasukkan MIDTRANS_SERVER_KEY di `.env.local`.
   */
  async createPaymentSession(
    orderId: string,
    amount: number,
    customerDetails: { name: string; email: string; phone?: string }
  ): Promise<{ snapToken: string; redirectUrl: string }> {
    console.log("paymentService.createPaymentSession initiated for Order:", orderId, "Amount:", amount);
    
    // Nanti jika sudah deploy server API Midtrans, bisa panggil endpoint local:
    // const res = await fetch("/api/payment/midtrans-snap", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ orderId, amount, customerDetails })
    // });
    // if (res.ok) return await res.json();

    // Placeholder / Simulator Fallback
    const snapToken = `snap-token-${Math.random().toString(36).substring(2, 15)}`;
    // URL redirect menuju simulator pembayaran internal/kustom di website
    const redirectUrl = `/checkout/payment-simulator?orderId=${orderId}&token=${snapToken}&amount=${amount}`;

    return { snapToken, redirectUrl };
  },

  // Save payment record to database
  async savePaymentRecord(
    orderId: string,
    amount: number,
    method: "transfer_bank" | "e_wallet" | "cod" | "qris" | "va" | "kartu_kredit",
    status: "pending" | "success" | "failed" | "expired",
    buktiBayar?: string
  ): Promise<boolean> {
    if (isPlaceholder()) {
      const key = `pelum_payments`;
      const payments: PaymentRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      
      // Remove existing for this order if any
      const filtered = payments.filter(p => p.id_order !== orderId);
      filtered.push({
        id_payment: Math.random().toString(36).substring(2, 9),
        id_order: orderId,
        juml_pay: amount,
        metod_pay: method,
        stat_pay: status,
        bukti_bayar: buktiBayar,
        tgl_pay: status === "success" ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    }

    try {
      // Check if there is an existing payment record
      const { data: existing } = await supabase
        .from("payment")
        .select("id_payment")
        .eq("id_order", orderId)
        .maybeSingle();

      if (existing) {
        // Update status
        const { error } = await supabase
          .from("payment")
          .update({
            stat_pay: status,
            metod_pay: method,
            bukti_bayar: buktiBayar || null,
            tgl_pay: status === "success" ? new Date().toISOString() : null
          })
          .eq("id_payment", existing.id_payment);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("payment")
          .insert({
            id_order: orderId,
            juml_pay: amount,
            metod_pay: method,
            stat_pay: status,
            bukti_bayar: buktiBayar || null,
            tgl_pay: status === "success" ? new Date().toISOString() : null
          });

        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error("paymentService.savePaymentRecord failed:", err);
      return false;
    }
  },

  // Get payment info for order
  async getPaymentForOrder(orderId: string): Promise<PaymentRecord | null> {
    if (isPlaceholder()) {
      const key = `pelum_payments`;
      const payments: PaymentRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      return payments.find(p => p.id_order === orderId) || null;
    }

    try {
      const { data, error } = await supabase
        .from("payment")
        .select("*")
        .eq("id_order", orderId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("paymentService.getPaymentForOrder failed:", err);
      return null;
    }
  },

  // Simulasikan penyelesaian pembayaran
  async simulatePaymentCompletion(orderId: string, success: boolean): Promise<boolean> {
    const status = success ? "success" : "failed";
    console.log(`paymentService: Simulating ${status} for Order ID:`, orderId);

    // Save payment record
    const payment = await this.getPaymentForOrder(orderId);
    const amount = payment ? payment.juml_pay : 0;
    const method = payment ? payment.metod_pay : "va";

    const saved = await this.savePaymentRecord(orderId, amount, method, status);
    if (!saved) return false;

    // Update Order status
    if (isPlaceholder()) {
      const orders = JSON.parse(localStorage.getItem("pelum_orders") || "[]");
      const idx = orders.findIndex((o: any) => o.id_order === orderId);
      if (idx !== -1) {
        orders[idx].stat_order = success ? "diproses" : "dibatalkan";
        localStorage.setItem("pelum_orders", JSON.stringify(orders));
      }
      return true;
    }

    try {
      const { error } = await supabase
        .from("order")
        .update({
          stat_order: success ? "diproses" : "dibatalkan"
        })
        .eq("id_order", orderId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("paymentService.simulatePaymentCompletion db update failed:", err);
      return false;
    }
  }
};
