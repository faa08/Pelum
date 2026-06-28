"use client";

import { useEffect, useState } from "react";
import { Utensils, Shirt, Paintbrush, Wrench, Sparkles } from "lucide-react";
import Link from "next/link";
import { productService } from "@/backend/productService";

const CATEGORIES = [
  { id: 1, slug: "kuliner", name: "Kuliner", icon: <Utensils size={20} />, href: "/kategori/kuliner" },
  { id: 2, slug: "fashion", name: "Fashion", icon: <Shirt size={20} />, href: "/kategori/fashion" },
  { id: 3, slug: "kerajinan", name: "Kerajinan", icon: <Paintbrush size={20} />, href: "/kategori/kerajinan" },
  { id: 4, slug: "jasa", name: "Jasa", icon: <Wrench size={20} />, href: "/kategori/jasa" },
  { id: 5, slug: "kecantikan", name: "Kecantikan", icon: <Sparkles size={20} />, href: "/kategori/kecantikan" },
];

export default function Categories() {
  const [visibleCategories, setVisibleCategories] = useState<typeof CATEGORIES>([]);

  useEffect(() => {
    productService.getProducts({ publicOnly: true, limit: 200 }).then((products) => {
      const counts = new Map<string, number>();
      for (const p of products) {
        const slug = p.categorySlug;
        if (!slug) continue;
        counts.set(slug, (counts.get(slug) || 0) + 1);
      }
      setVisibleCategories(CATEGORIES.filter((cat) => (counts.get(cat.slug) || 0) > 0));
    });
  }, []);

  if (visibleCategories.length === 0) return null;

  return (
    <section className="section-categories">
      <div className="container">
        <div className="section-header-custom">
          <h2 className="section-title-custom">Kategori Pilihan</h2>
          <Link href="/kategori" className="section-see-all-orange">
            Lihat Semua
          </Link>
        </div>

        <div className="categories-grid-four">
          {visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="category-card-custom"
              id={`category-${cat.name.toLowerCase()}`}
            >
              <div className="category-icon-box">
                {cat.icon}
              </div>
              <span className="category-name-custom">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
