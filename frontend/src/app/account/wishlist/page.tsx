"use client";

import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-headline text-3xl font-bold text-on-surface">Wishlist</h2>
        <p className="text-secondary mt-1 text-sm">Produk favorit yang Anda simpan.</p>
      </header>
      <div className="bg-white border border-surface-container rounded-xl p-8 shadow-sm text-center space-y-4">
        <p className="text-sm text-secondary">Wishlist masih kosong.</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-95"
        >
          Jelajahi Produk
        </Link>
      </div>
    </div>
  );
}
