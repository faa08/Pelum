-- ============================================================
--  DATABASE SCHEMA - PELUM PROJECT
--  Platform: Supabase (PostgreSQL)
--  Generated from ERD
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: super_admin
-- ============================================================
CREATE TABLE super_admin (
    id_superadmin   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(100) NOT NULL UNIQUE,
    password        TEXT NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TYPE user_role AS ENUM ('customer', 'seller');

CREATE TABLE users (
    id_user     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    role        user_role NOT NULL DEFAULT 'customer',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: seller
-- ============================================================
CREATE TABLE seller (
    id_seller   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user     UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    nm_store    VARCHAR(150) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    no_telp     VARCHAR(20),
    addr        TEXT,
    img_ktp     TEXT,
    rek_bank    VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: store
-- ============================================================
CREATE TABLE store (
    id_store    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_seller   UUID NOT NULL REFERENCES seller(id_seller) ON DELETE CASCADE,
    nm_store    VARCHAR(150) NOT NULL,
    rek_bank    VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: produk
-- ============================================================
CREATE TYPE stat_produk_enum AS ENUM ('tersedia', 'tidak tersedia');

CREATE TABLE produk (
    id_produk       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_seller       UUID NOT NULL REFERENCES seller(id_seller) ON DELETE CASCADE,
    nama_produk     VARCHAR(200) NOT NULL,
    "desc"          TEXT,
    harga           NUMERIC(15, 2) NOT NULL CHECK (harga >= 0),
    img             TEXT,
    produk_stock    INT NOT NULL DEFAULT 0 CHECK (produk_stock >= 0),
    stat_produk     stat_produk_enum NOT NULL DEFAULT 'tersedia',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: review
-- ============================================================
CREATE TABLE review (
    id_review   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user     UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_produk   UUID NOT NULL REFERENCES produk(id_produk) ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    komentar    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: cart
-- ============================================================
CREATE TABLE cart (
    id_cart     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user     UUID NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_user) -- satu user hanya punya satu cart aktif
);

-- ============================================================
-- TABLE: cart_item
-- ============================================================
CREATE TABLE cart_item (
    id_cart_item    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cart         UUID NOT NULL REFERENCES cart(id_cart) ON DELETE CASCADE,
    id_produk       UUID NOT NULL REFERENCES produk(id_produk) ON DELETE CASCADE,
    qty_cartitem    INT NOT NULL DEFAULT 1 CHECK (qty_cartitem > 0),
    added_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (id_cart, id_produk) -- tidak ada duplikat produk dalam 1 cart
);

-- ============================================================
-- TABLE: "order"
-- ============================================================
CREATE TABLE "order" (
    id_order    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user     UUID NOT NULL REFERENCES users(id_user) ON DELETE SET NULL,
    total_hrg   NUMERIC(15, 2) NOT NULL CHECK (total_hrg >= 0),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: order_item
-- ============================================================
CREATE TABLE order_item (
    id_order_item   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order        UUID NOT NULL REFERENCES "order"(id_order) ON DELETE CASCADE,
    id_produk       UUID NOT NULL REFERENCES produk(id_produk) ON DELETE SET NULL,
    qty_orderitem   INT NOT NULL CHECK (qty_orderitem > 0),
    hrg_saat_beli   NUMERIC(15, 2) NOT NULL CHECK (hrg_saat_beli >= 0)
);

-- ============================================================
-- TABLE: payment
-- ============================================================
CREATE TYPE stat_pay_enum AS ENUM ('pending', 'succes', 'failed', 'expired');

CREATE TABLE payment (
    id_payment  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_order    UUID NOT NULL REFERENCES "order"(id_order) ON DELETE CASCADE,
    juml_pay    NUMERIC(15, 2) NOT NULL CHECK (juml_pay >= 0),
    metod_pay   VARCHAR(50) NOT NULL,
    stat_pay    stat_pay_enum NOT NULL DEFAULT 'pending',
    tgl_pay     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES (untuk performa query)
-- ============================================================
CREATE INDEX idx_produk_seller       ON produk(id_seller);
CREATE INDEX idx_produk_stat         ON produk(stat_produk);
CREATE INDEX idx_review_produk       ON review(id_produk);
CREATE INDEX idx_review_user         ON review(id_user);
CREATE INDEX idx_cart_item_cart      ON cart_item(id_cart);
CREATE INDEX idx_cart_item_produk    ON cart_item(id_produk);
CREATE INDEX idx_order_user          ON "order"(id_user);
CREATE INDEX idx_order_item_order    ON order_item(id_order);
CREATE INDEX idx_payment_order       ON payment(id_order);
CREATE INDEX idx_payment_stat        ON payment(stat_pay);
CREATE INDEX idx_store_seller        ON store(id_seller);
CREATE INDEX idx_seller_user         ON seller(id_user);

-- ============================================================
-- FUNCTION: auto-update updated_at pada produk
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_produk_updated_at
    BEFORE UPDATE ON produk
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Supabase
-- ============================================================

-- Aktifkan RLS
ALTER TABLE super_admin     ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller          ENABLE ROW LEVEL SECURITY;
ALTER TABLE store            ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk          ENABLE ROW LEVEL SECURITY;
ALTER TABLE review          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_item       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment         ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa lihat data dirinya sendiri
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth.uid() = id_user);

CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = id_user);

-- Policy: semua orang bisa lihat produk yang tersedia
CREATE POLICY "Public can view available products"
    ON produk FOR SELECT
    USING (stat_produk = 'tersedia');

-- Policy: seller hanya bisa kelola produk miliknya
CREATE POLICY "Seller can manage own products"
    ON produk FOR ALL
    USING (
        id_seller IN (
            SELECT id_seller FROM seller WHERE id_user = auth.uid()
        )
    );

-- Policy: user hanya bisa lihat cart-nya sendiri
CREATE POLICY "Users can access own cart"
    ON cart FOR ALL
    USING (id_user = auth.uid());

CREATE POLICY "Users can access own cart items"
    ON cart_item FOR ALL
    USING (
        id_cart IN (
            SELECT id_cart FROM cart WHERE id_user = auth.uid()
        )
    );

-- Policy: user hanya bisa lihat order-nya sendiri
CREATE POLICY "Users can view own orders"
    ON "order" FOR SELECT
    USING (id_user = auth.uid());

-- Policy: user hanya bisa lihat order item dari order miliknya
CREATE POLICY "Users can view own order items"
    ON order_item FOR SELECT
    USING (
        id_order IN (
            SELECT id_order FROM "order" WHERE id_user = auth.uid()
        )
    );

-- Policy: user hanya bisa lihat payment dari order miliknya
CREATE POLICY "Users can view own payments"
    ON payment FOR SELECT
    USING (
        id_order IN (
            SELECT id_order FROM "order" WHERE id_user = auth.uid()
        )
    );

-- Policy: semua orang bisa lihat review
CREATE POLICY "Public can view reviews"
    ON review FOR SELECT
    USING (true);

-- Policy: user hanya bisa buat/hapus review miliknya
CREATE POLICY "Users can manage own reviews"
    ON review FOR ALL
    USING (id_user = auth.uid());
