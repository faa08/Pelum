import { apiFetch } from "@/lib/api-client";

export interface CartItem {
  id_cart_item: string;
  id_cart: string;
  id_produk: string;
  qty_cartitem: number;
  added_at: string;
  produk?: {
    nama_produk: string;
    harga: number;
    img: string;
    slug?: string;
    id_seller: string;
    berat: number;
    nm_store?: string;
  };
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

function logCartError(label: string, err: unknown) {
  if (err && typeof err === "object" && "message" in err) {
    console.error(`${label}:`, (err as { message: string }).message);
    return;
  }
  console.error(`${label}:`, err);
}

export interface AddToCartResult {
  ok: boolean;
  cartItemId?: string;
  error?: string;
}

export const cartService = {
  async getOrCreateCart(userId: string): Promise<string | null> {
    if (isPlaceholder()) return "placeholder-cart-id";
    const items = await this.getCartItems(userId);
    return items[0]?.id_cart ?? "api-cart";
  },

  async getCartItems(userId: string): Promise<CartItem[]> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_cart_items");
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const res = await apiFetch(`/api/cart?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (!res.ok) {
        logCartError("cartService.getCartItems failed", data);
        return [];
      }
      return data.items || [];
    } catch (err) {
      logCartError("cartService.getCartItems failed", err);
      return [];
    }
  },

  async addToCart(
    userId: string,
    productId: string,
    qty: number = 1,
    options?: { setQty?: boolean; variantPicks?: number[] }
  ): Promise<AddToCartResult> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_cart_items");
      const items: CartItem[] = stored ? JSON.parse(stored) : [];
      const existing = items.find((i) => i.id_produk === productId);
      if (existing) {
        existing.qty_cartitem = options?.setQty ? qty : existing.qty_cartitem + qty;
        localStorage.setItem("pelum_cart_items", JSON.stringify(items));
        return { ok: true, cartItemId: existing.id_cart_item };
      }
      const newId = Math.random().toString(36).substring(2, 11);
      items.push({
        id_cart_item: newId,
        id_cart: "placeholder-cart-id",
        id_produk: productId,
        qty_cartitem: qty,
        added_at: new Date().toISOString(),
      });
      localStorage.setItem("pelum_cart_items", JSON.stringify(items));
      return { ok: true, cartItemId: newId };
    }

    try {
      const res = await apiFetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          userId,
          productId,
          qty,
          setQty: options?.setQty ?? false,
          variantPicks: options?.variantPicks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        logCartError("cartService.addToCart failed", data);
        return { ok: false, error: data.error || "Gagal menambahkan ke keranjang." };
      }
      return { ok: true, cartItemId: data.id_cart_item };
    } catch (err) {
      logCartError("cartService.addToCart failed", err);
      return { ok: false, error: "Koneksi gagal. Coba lagi." };
    }
  },

  async updateCartQuantity(cartItemId: string, qty: number): Promise<boolean> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_cart_items");
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        const idx = items.findIndex((i) => i.id_cart_item === cartItemId);
        if (idx !== -1) {
          items[idx].qty_cartitem = Math.max(1, qty);
          localStorage.setItem("pelum_cart_items", JSON.stringify(items));
          return true;
        }
      }
      return false;
    }

    try {
      const res = await apiFetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", cartItemId, qty }),
      });
      const data = await res.json();
      if (!res.ok) {
        logCartError("cartService.updateCartQuantity failed", data);
        return false;
      }
      return true;
    } catch (err) {
      logCartError("cartService.updateCartQuantity failed", err);
      return false;
    }
  },

  async removeFromCart(cartItemId: string): Promise<boolean> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_cart_items");
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        const filtered = items.filter((i) => i.id_cart_item !== cartItemId);
        localStorage.setItem("pelum_cart_items", JSON.stringify(filtered));
        return true;
      }
      return false;
    }

    try {
      const res = await apiFetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", cartItemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        logCartError("cartService.removeFromCart failed", data);
        return false;
      }
      return true;
    } catch (err) {
      logCartError("cartService.removeFromCart failed", err);
      return false;
    }
  },

  async clearCart(userId: string): Promise<boolean> {
    if (isPlaceholder()) {
      localStorage.removeItem("pelum_cart_items");
      return true;
    }

    try {
      const res = await apiFetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        logCartError("cartService.clearCart failed", data);
        return false;
      }
      return true;
    } catch (err) {
      logCartError("cartService.clearCart failed", err);
      return false;
    }
  },
};
