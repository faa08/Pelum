import type { Product } from "@/backend/productService";
import Image from "next/image";

export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  sold: number;
  reviewCount: number;
}

export function parseProductImg(img?: string | null): string {
  if (!img) return "/product-keramik.png";
  if (img.startsWith("[")) {
    try {
      const arr = JSON.parse(img);
      return arr[0] || "/product-keramik.png";
    } catch {
      return "/product-keramik.png";
    }
  }
  return img;
}

/** Thumbnail kartu produk — mendukung base64 & URL biasa */
export function ProductGridImage({
  src,
  alt,
  sizes = "220px",
  style,
}: {
  src: string;
  alt: string;
  sizes?: string;
  style?: React.CSSProperties;
}) {
  const resolved = parseProductImg(src);
  if (resolved.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }}
      />
    );
  }
  return (
    <Image src={resolved} alt={alt} fill style={{ objectFit: "cover", ...style }} sizes={sizes} />
  );
}

export function productToCard(
  p: Product,
  stats?: { rating: number; sold: number; reviewCount: number }
): ProductCard {
  return {
    id: p.id_produk,
    slug: p.slug || p.id_produk,
    name: p.nama_produk,
    price: p.harga,
    image: parseProductImg(p.img),
    category: p.category || p.nama_brand || "UMKM Lokal",
    rating: stats?.rating ?? 0,
    sold: stats?.sold ?? 0,
    reviewCount: stats?.reviewCount ?? 0,
  };
}

/** Diskon tampilan promo (deterministik dari id produk, bukan tabel voucher) */
export function promoDiscountPercent(productId: string): number {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash + productId.charCodeAt(i) * (i + 1)) % 100;
  }
  return 15 + (hash % 21);
}
