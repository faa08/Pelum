import { supabase } from "./supabase";

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
    id_seller: string;
    berat: number;
    nm_store?: string;
  };
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

export const cartService = {
  // Get or create cart for user
  async getOrCreateCart(userId: string): Promise<string | null> {
    if (isPlaceholder()) return "placeholder-cart-id";
    try {
      // Try to select existing cart
      const { data: cart, error: selectError } = await supabase
        .from("cart")
        .select("id_cart")
        .eq("id_user", userId)
        .maybeSingle();

      if (selectError) throw selectError;
      if (cart) return cart.id_cart;

      // Create new cart
      const { data: newCart, error: insertError } = await supabase
        .from("cart")
        .insert({ id_user: userId })
        .select("id_cart")
        .single();

      if (insertError) throw insertError;
      return newCart.id_cart;
    } catch (err) {
      console.error("cartService.getOrCreateCart failed:", err);
      return null;
    }
  },

  // Get all items in user's cart
  async getCartItems(userId: string): Promise<CartItem[]> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_cart_items");
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const cartId = await this.getOrCreateCart(userId);
      if (!cartId) return [];

      const { data, error } = await supabase
        .from("cart_item")
        .select(`
          id_cart_item, id_cart, id_produk, qty_cartitem, added_at,
          produk (
            nama_produk, harga, img, id_seller, berat,
            seller ( nm_store )
          )
        `)
        .eq("id_cart", cartId)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((item: any) => ({
        id_cart_item: item.id_cart_item,
        id_cart: item.id_cart,
        id_produk: item.id_produk,
        qty_cartitem: item.qty_cartitem,
        added_at: item.added_at,
        produk: item.produk ? {
          nama_produk: item.produk.nama_produk,
          harga: Number(item.produk.harga),
          img: item.produk.img,
          id_seller: item.produk.id_seller,
          berat: item.produk.berat || 0,
          nm_store: item.produk.seller?.nm_store
        } : undefined
      }));
    } catch (err) {
      console.error("cartService.getCartItems failed:", err);
      return [];
    }
  },

  // Add product to cart
  async addToCart(userId: string, productId: string, qty: number = 1): Promise<boolean> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_cart_items");
      const items: CartItem[] = stored ? JSON.parse(stored) : [];
      const existing = items.find(i => i.id_produk === productId);
      if (existing) {
        existing.qty_cartitem += qty;
      } else {
        items.push({
          id_cart_item: Math.random().toString(36).substring(2, 9),
          id_cart: "placeholder-cart-id",
          id_produk: productId,
          qty_cartitem: qty,
          added_at: new Date().toISOString()
        });
      }
      localStorage.setItem("pelum_cart_items", JSON.stringify(items));
      return true;
    }

    try {
      const cartId = await this.getOrCreateCart(userId);
      if (!cartId) return false;

      // Check if item already exists in cart
      const { data: existing, error: findError } = await supabase
        .from("cart_item")
        .select("id_cart_item, qty_cartitem")
        .eq("id_cart", cartId)
        .eq("id_produk", productId)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from("cart_item")
          .update({ qty_cartitem: existing.qty_cartitem + qty })
          .eq("id_cart_item", existing.id_cart_item);
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from("cart_item")
          .insert({
            id_cart: cartId,
            id_produk: productId,
            qty_cartitem: qty
          });
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error("cartService.addToCart failed:", err);
      return false;
    }
  },

  // Update item quantity
  async updateCartQuantity(cartItemId: string, qty: number): Promise<boolean> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_cart_items");
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        const idx = items.findIndex(i => i.id_cart_item === cartItemId);
        if (idx !== -1) {
          items[idx].qty_cartitem = Math.max(1, qty);
          localStorage.setItem("pelum_cart_items", JSON.stringify(items));
          return true;
        }
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from("cart_item")
        .update({ qty_cartitem: Math.max(1, qty) })
        .eq("id_cart_item", cartItemId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("cartService.updateCartQuantity failed:", err);
      return false;
    }
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<boolean> {
    if (isPlaceholder()) {
      const stored = localStorage.getItem("pelum_cart_items");
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        const filtered = items.filter(i => i.id_cart_item !== cartItemId);
        localStorage.setItem("pelum_cart_items", JSON.stringify(filtered));
        return true;
      }
      return false;
    }

    try {
      const { error } = await supabase
        .from("cart_item")
        .delete()
        .eq("id_cart_item", cartItemId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("cartService.removeFromCart failed:", err);
      return false;
    }
  },

  // Clear all items in user's cart
  async clearCart(userId: string): Promise<boolean> {
    if (isPlaceholder()) {
      localStorage.removeItem("pelum_cart_items");
      return true;
    }

    try {
      const cartId = await this.getOrCreateCart(userId);
      if (!cartId) return false;

      const { error } = await supabase
        .from("cart_item")
        .delete()
        .eq("id_cart", cartId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("cartService.clearCart failed:", err);
      return false;
    }
  }
};
