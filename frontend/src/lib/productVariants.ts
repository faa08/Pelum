import type { Product } from "@/backend/productService";
import { getStockForPicks } from "@/lib/variantInventory";

export function getSelectedVariantOptions(
  product: Product,
  activeVariants: Record<number, number>
) {
  return (
    product.variants?.map((group, gi) => {
      const oi = activeVariants[gi] ?? 0;
      return group.options[oi] ?? null;
    }) ?? []
  );
}

/** Gambar dari varian terpilih (prioritas grup pertama yang punya foto, biasanya Motif) */
export function getSelectedVariantImage(
  product: Product,
  activeVariants: Record<number, number>
): string | null {
  if (!product.variants?.length) return null;

  for (let gi = 0; gi < product.variants.length; gi++) {
    const opt = product.variants[gi].options[activeVariants[gi] ?? 0];
    const img = opt?.image?.trim();
    if (img) return img;
  }
  return null;
}

/** Harga efektif: harga dasar, diganti opsi terakhir yang punya harga > 0 (mis. Ukuran/Jenis) */
export function getSelectedVariantPrice(
  product: Product,
  activeVariants: Record<number, number>
): number {
  let price = product.harga;

  product.variants?.forEach((group, gi) => {
    const opt = group.options[activeVariants[gi] ?? 0];
    if (opt?.price != null && opt.price > 0) {
      price = opt.price;
    }
  });

  return price;
}

export function getVariantPriceBounds(product: Product): { min: number; max: number } {
  const prices = new Set<number>([product.harga]);
  product.variants?.forEach((g) => {
    g.options.forEach((o) => {
      if (o.price != null && o.price > 0) prices.add(o.price);
    });
  });
  const arr = [...prices].sort((a, b) => a - b);
  return { min: arr[0], max: arr[arr.length - 1] };
}

export function formatVariantPriceRange(product: Product, formatPrice: (n: number) => string): string {
  const { min, max } = getVariantPriceBounds(product);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

export function hasSelectedVariantPrice(
  product: Product,
  activeVariants: Record<number, number>
): boolean {
  return (
    product.variants?.some((group, gi) => {
      const opt = group.options[activeVariants[gi] ?? 0];
      return opt?.price != null && opt.price > 0;
    }) ?? false
  );
}

export function getSelectedVariantLabel(
  product: Product,
  activeVariants: Record<number, number>
): string {
  if (!product.variants?.length) return "";
  return product.variants
    .map((g, gi) => g.options[activeVariants[gi] ?? 0]?.name)
    .filter(Boolean)
    .join(", ");
}

/** Galeri tampilan: foto varian terpilih di depan, lalu foto produk lainnya */
export function getGalleryImages(
  product: Product,
  activeVariants: Record<number, number>
): string[] {
  const base = product.images?.length
    ? [...product.images]
    : product.img
      ? [product.img]
      : [];

  const variantImg = getSelectedVariantImage(product, activeVariants);
  if (!variantImg) return base;

  const rest = base.filter((img) => img !== variantImg);
  return [variantImg, ...rest];
}

/** Grup varian yang punya foto di opsi (motif/warna) */
export function getSelectedVariantStock(
  product: Product,
  activeVariants: Record<number, number>
): number {
  if (!product.variantInventory?.length) return product.stok;

  const picks = product.variants?.map((_, gi) => activeVariants[gi] ?? 0) ?? [];
  return getStockForPicks(product.variantInventory, picks, product.stok);
}

export function getActiveVariantPicks(
  product: Product,
  activeVariants: Record<number, number>
): number[] {
  if (!product.variants?.length) return [];
  return product.variants.map((_, gi) => activeVariants[gi] ?? 0);
}

export function isVisualVariantGroup(
  product: Product,
  groupIndex: number
): boolean {
  const group = product.variants?.[groupIndex];
  return group?.options.some((o) => Boolean(o.image?.trim())) ?? false;
}
