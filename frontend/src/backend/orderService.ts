export const CHECKOUT_CART_KEY = "pelum_checkout_cart_items";
export const CHECKOUT_ORDERS_KEY = "pelum_checkout_orders";

export interface CheckoutOrderResult {
  id_order: string;
  id_seller: string;
  nm_store: string;
  total_hrg: number;
}

export interface CheckoutResponse {
  orders: CheckoutOrderResult[];
  transactionRef: string;
  paymentType?: PaymentMethodId;
  totalAmount?: number;
}

export type PaymentMethodId = "digital" | "offline";

export interface CheckoutPayload {
  userId: string;
  cartItemIds: string[];
  addressId?: string | null;
  courier: string;
  paymentType: PaymentMethodId;
  shippingCost: number;
  diskon: number;
  biayaLayanan: number;
}

export const orderService = {
  async checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal membuat pesanan.");
    }
    return data as CheckoutResponse;
  },

  saveCheckoutSession(cartItemIds: string[]) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(cartItemIds));
    }
  },

  getCheckoutCartIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(sessionStorage.getItem(CHECKOUT_CART_KEY) || "[]");
    } catch {
      return [];
    }
  },

  savePlacedOrders(orders: CheckoutOrderResult[], transactionRef: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        CHECKOUT_ORDERS_KEY,
        JSON.stringify({ orders, transactionRef })
      );
    }
  },

  getPlacedOrders(): { orders: CheckoutOrderResult[]; transactionRef: string } | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(CHECKOUT_ORDERS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearCheckoutSession() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(CHECKOUT_CART_KEY);
      sessionStorage.removeItem(CHECKOUT_ORDERS_KEY);
    }
  },

  async completePayment(
    orderIds: string[],
    success = true,
    options?: { createChat?: boolean; paymentType?: "digital" | "offline" }
  ): Promise<{ chatIds?: string[] }> {
    const res = await fetch("/api/checkout/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderIds,
        success,
        createChat: options?.createChat ?? false,
        paymentType: options?.paymentType,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal menyelesaikan pembayaran.");
    }
    return { chatIds: data.chatIds };
  },
};
