-- ============================================================
-- FIX RLS - Pelataran UMKM
-- Jalankan di Supabase SQL Editor
-- Mengizinkan anon key untuk INSERT/SELECT pada tabel utama
-- ============================================================

-- ── USERS: izinkan register (insert) dari anon ──────────────
CREATE POLICY "Allow public register"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read users"
  ON users FOR SELECT
  USING (true);

-- ── SELLER: izinkan insert toko baru dari anon ───────────────
CREATE POLICY "Allow public create seller"
  ON seller FOR INSERT
  WITH CHECK (true);

-- ── KATEGORI: izinkan semua baca ─────────────────────────────
-- (sudah ada di db.sql tapi pastikan aktif)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'kategori' AND policyname = 'Public can view kategori'
  ) THEN
    CREATE POLICY "Public can view kategori"
      ON kategori FOR SELECT USING (true);
  END IF;
END $$;

-- ── PRODUK: izinkan semua baca + seller insert ────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'produk' AND policyname = 'Public can view available products'
  ) THEN
    CREATE POLICY "Public can view available products"
      ON produk FOR SELECT USING (stat_produk = 'tersedia');
  END IF;
END $$;

CREATE POLICY "Allow anon insert product"
  ON produk FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon update product"
  ON produk FOR UPDATE
  USING (true);

CREATE POLICY "Allow anon delete product"
  ON produk FOR DELETE
  USING (true);

-- ── ORDER: izinkan baca semua untuk admin ────────────────────
CREATE POLICY "Allow anon read orders"
  ON "order" FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert order"
  ON "order" FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon update order"
  ON "order" FOR UPDATE
  USING (true);

-- ── ORDER_ITEM ────────────────────────────────────────────────
CREATE POLICY "Allow anon read order items"
  ON order_item FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert order item"
  ON order_item FOR INSERT
  WITH CHECK (true);

-- ── PAYMENT ──────────────────────────────────────────────────
CREATE POLICY "Allow anon read payment"
  ON payment FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert payment"
  ON payment FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon update payment"
  ON payment FOR UPDATE
  USING (true);

-- ── PENGIRIMAN ────────────────────────────────────────────────
CREATE POLICY "Allow anon read pengiriman"
  ON pengiriman FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert pengiriman"
  ON pengiriman FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon update pengiriman"
  ON pengiriman FOR UPDATE
  USING (true);

-- ── ALAMAT ───────────────────────────────────────────────────
CREATE POLICY "Allow anon insert alamat"
  ON alamat FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon read alamat"
  ON alamat FOR SELECT
  USING (true);

-- ── CART & CART_ITEM ─────────────────────────────────────────
CREATE POLICY "Allow anon cart"
  ON cart FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon cart item"
  ON cart_item FOR ALL
  USING (true) WITH CHECK (true);

-- ── REVIEW ───────────────────────────────────────────────────
CREATE POLICY "Allow anon read review"
  ON review FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert review"
  ON review FOR INSERT
  WITH CHECK (true);

-- ── SALDO_SELLER ─────────────────────────────────────────────
CREATE POLICY "Allow anon read saldo"
  ON saldo_seller FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert saldo"
  ON saldo_seller FOR INSERT
  WITH CHECK (true);
