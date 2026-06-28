import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyInventoryDeduction,
  getStockForPicks,
  parseVariantRaw,
} from "@/lib/variantInventory";

type OrderItemRow = {
  id_produk: string;
  qty_orderitem: number;
  pilihan_varian?: { picks?: number[] } | null;
  produk: {
    produk_stock: number;
    varian?: unknown;
  } | null;
};

export async function deductInventoryForOrder(
  admin: SupabaseClient,
  orderId: string
): Promise<void> {
  const { data: items, error } = await admin
    .from("order_item")
    .select(
      `id_produk, qty_orderitem, pilihan_varian,
      produk ( produk_stock, varian )`
    )
    .eq("id_order", orderId);

  if (error) throw error;
  if (!items?.length) return;

  for (const item of items as unknown as OrderItemRow[]) {
    if (!item.produk) continue;
    const picks = item.pilihan_varian?.picks;
    const qty = item.qty_orderitem;

    if (picks?.length) {
      const { data: prodRow, error: prodErr } = await admin
        .from("produk")
        .select("varian, produk_stock")
        .eq("id_produk", item.id_produk)
        .maybeSingle();
      if (prodErr) throw prodErr;

      const { inventory } = parseVariantRaw(prodRow?.varian);
      const stock = getStockForPicks(inventory, picks, Number(prodRow?.produk_stock ?? 0));
      if (stock < qty) {
        throw new Error(`Stok produk tidak mencukupi untuk pesanan ${orderId}.`);
      }

      const deducted = applyInventoryDeduction(prodRow?.varian, picks, qty);
      if (deducted) {
        const { error: stockErr } = await admin
          .from("produk")
          .update({
            varian: deducted.varian,
            produk_stock: deducted.totalStock,
            stat_produk: deducted.totalStock > 0 ? "tersedia" : "tidak tersedia",
          })
          .eq("id_produk", item.id_produk);
        if (stockErr) throw stockErr;
        continue;
      }
    }

    const newStock = Number(item.produk.produk_stock) - qty;
    if (newStock < 0) {
      throw new Error(`Stok produk tidak mencukupi untuk pesanan ${orderId}.`);
    }

    const { error: stockErr } = await admin
      .from("produk")
      .update({
        produk_stock: newStock,
        stat_produk: newStock > 0 ? "tersedia" : "tidak tersedia",
      })
      .eq("id_produk", item.id_produk);
    if (stockErr) throw stockErr;
  }
}
