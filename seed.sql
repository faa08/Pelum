-- ============================================================
--  SEED DATA - PELUM MARKETPLACE
--  Paste ini di Supabase SQL Editor lalu klik Run
--  Berisi: users, seller, kategori, produk, order, payment, pengiriman
-- ============================================================

-- ── USERS ──────────────────────────────────────────────────
INSERT INTO users (id_user, username, password, email, nama_lengkap, no_telp, avatar, role) VALUES
('11111111-0000-0000-0000-000000000001', 'budi_santoso',   'password123', 'budi@email.com',    'Budi Santoso',    '081234567890', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100', 'customer'),
('11111111-0000-0000-0000-000000000002', 'siti_rahayu',    'password123', 'siti@email.com',    'Siti Rahayu',     '081298765432', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100', 'customer'),
('11111111-0000-0000-0000-000000000003', 'andi_darmawan',  'password123', 'andi@email.com',    'Andi Darmawan',   '085612345678', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100', 'customer'),
('11111111-0000-0000-0000-000000000004', 'lina_marlina',   'password123', 'lina@email.com',    'Lina Marlina',    '081345678901', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100', 'customer'),
('22222222-0000-0000-0000-000000000001', 'toko_batik',     'password123', 'batik@toko.com',    'Ahmad Batik',     '082112345678', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100', 'seller'),
('22222222-0000-0000-0000-000000000002', 'toko_rotan',     'password123', 'rotan@toko.com',    'Dewi Rotan',      '082298765432', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100', 'seller'),
('22222222-0000-0000-0000-000000000003', 'toko_cokelat',   'password123', 'cokelat@toko.com',  'Rudi Cokelat',    '082312345678', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=100', 'seller'),
('22222222-0000-0000-0000-000000000004', 'toko_sutra',     'password123', 'sutra@toko.com',    'Maya Sutra',      '082456789012', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100', 'seller'),
('33333333-0000-0000-0000-000000000001', 'admin_pelum',    'admin2024',   'admin@pelataranumkm.id', 'Super Admin', '021-5500-1234', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100', 'customer')
ON CONFLICT (id_user) DO NOTHING;

-- ── SELLER ─────────────────────────────────────────────────
INSERT INTO seller (id_seller, id_user, nm_store, deskripsi, logo_toko, email, no_telp, addr, nama_bank, no_rek, atas_nama_rek, is_verified) VALUES
('aaaa0001-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Batik Kawung Jaya',  'Toko batik tulis premium dari Yogyakarta sejak 1998', 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100', 'batik@toko.com',   '082112345678', 'Jl. Malioboro No. 12, Yogyakarta', 'BCA', '1234567801', 'Ahmad Batik',   TRUE),
('aaaa0002-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'Mitra Rotan Abadi',  'Kerajinan rotan dan anyaman berkualitas dari Cirebon',  'https://images.unsplash.com/photo-1585468274952-66591eb14165?q=80&w=100', 'rotan@toko.com',   '082298765432', 'Jl. Industri No. 5, Cirebon',     'BNI', '2345678902', 'Dewi Rotan',    TRUE),
('aaaa0003-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'Cokelat Nusantara',  'Produsen cokelat artisan dari biji kakao Sulawesi',    'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=100', 'cokelat@toko.com', '082312345678', 'Jl. Kakao No. 3, Makassar',       'Mandiri', '3456789003', 'Rudi Cokelat', TRUE),
('aaaa0004-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'Sutra Kawung Jaya',  'Kain sutra dan tekstil tradisional Nusantara',         'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=100', 'sutra@toko.com',   '082456789012', 'Jl. Tenun No. 8, Solo',           'BRI', '4567890104', 'Maya Sutra',    FALSE)
ON CONFLICT (id_seller) DO NOTHING;

-- ── KATEGORI ───────────────────────────────────────────────
INSERT INTO kategori (id_kategori, nama_kategori) VALUES
('cat00001-0000-0000-0000-000000000001', 'Fashion & Tekstil'),
('cat00002-0000-0000-0000-000000000002', 'Kerajinan Tangan'),
('cat00003-0000-0000-0000-000000000003', 'Kuliner & Minuman'),
('cat00004-0000-0000-0000-000000000004', 'Kecantikan & Perawatan'),
('cat00005-0000-0000-0000-000000000005', 'Pertanian & Perkebunan'),
('cat00006-0000-0000-0000-000000000006', 'Seni & Dekorasi')
ON CONFLICT (nama_kategori) DO NOTHING;

-- ── PRODUK ─────────────────────────────────────────────────
INSERT INTO produk (id_produk, id_seller, id_kategori, nama_produk, "desc", harga, berat, img, produk_stock, stat_produk) VALUES
('prod0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001', 'cat00001-0000-0000-0000-000000000001', 'Kain Batik Tulis Motif Mega Mendung',   'Batik tulis asli dari pengrajin Yogyakarta. Motif mega mendung khas Cirebon dengan bahan katun premium.',  450000, 350, '/product-batik.png',    45, 'tersedia'),
('prod0002-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001', 'cat00001-0000-0000-0000-000000000001', 'Kemeja Batik Modern Slim Fit',           'Kemeja batik modern dengan potongan slim fit. Cocok untuk acara formal maupun kasual.',                    325000, 280, '/product-batik.png',    30, 'tersedia'),
('prod0003-0000-0000-0000-000000000002', 'aaaa0002-0000-0000-0000-000000000002', 'cat00002-0000-0000-0000-000000000002', 'Tas Rotan Artisan Lestari',              'Tas rotan handmade dengan finishing rapi. Ramah lingkungan dan tahan lama.',                               350000, 400, '/product-dompet.png',   20, 'tersedia'),
('prod0004-0000-0000-0000-000000000002', 'aaaa0002-0000-0000-0000-000000000002', 'cat00002-0000-0000-0000-000000000002', 'Mangkuk Keramik Handmade Tradisional',   'Mangkuk keramik buatan tangan dengan motif batik khas Jawa. Food safe dan tahan panas.',                   125000, 250, '/product-keramik.png',  60, 'tersedia'),
('prod0005-0000-0000-0000-000000000003', 'aaaa0003-0000-0000-0000-000000000003', 'cat00003-0000-0000-0000-000000000003', 'Paket Cokelat Artisan Dark Milk',        'Cokelat artisan dari biji kakao single origin Sulawesi. Rasa kaya dan aroma premium.',                     128000, 250, '/product-kopi.png',     80, 'tersedia'),
('prod0006-0000-0000-0000-000000000003', 'aaaa0003-0000-0000-0000-000000000003', 'cat00003-0000-0000-0000-000000000003', 'Kopi Arabika Gayo Single Origin 250g',   'Kopi arabika dari dataran tinggi Gayo, Aceh. Diroasting fresh setiap hari.',                               85000,  250, '/product-kopi.png',    100, 'tersedia'),
('prod0007-0000-0000-0000-000000000004', 'aaaa0004-0000-0000-0000-000000000004', 'cat00001-0000-0000-0000-000000000001', 'Syal Sutra Motif Kawung Merah',          'Syal sutra ATBM motif kawung. Dibuat oleh penenun tradisional dari Solo.',                                 427000, 150, '/product-skincare.png', 15, 'tersedia'),
('prod0008-0000-0000-0000-000000000004', 'aaaa0004-0000-0000-0000-000000000004', 'cat00004-0000-0000-0000-000000000004', 'Paket Skincare Alami Ekstrak Kunyit',    'Rangkaian perawatan kulit berbahan alami dari kunyit, lidah buaya, dan minyak kelapa murni.',              175000, 300, '/product-skincare.png', 40, 'tersedia')
ON CONFLICT (id_produk) DO NOTHING;

-- ── ALAMAT USER ────────────────────────────────────────────
INSERT INTO alamat (id_alamat, id_user, label, nama_penerima, no_telp, provinsi, kota, kecamatan, kode_pos, detail_alamat, is_utama) VALUES
('addr0001-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Rumah', 'Budi Santoso', '081234567890', 'Jawa Barat',    'Bandung',        'Coblong',   '40132', 'Jl. Merdeka No. 12',         TRUE),
('addr0002-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Rumah', 'Siti Rahayu',  '081298765432', 'DKI Jakarta',   'Jakarta Selatan','Kebayoran',  '12190', 'Jl. Sudirman No. 45',        TRUE),
('addr0003-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', 'Kantor','Andi Darmawan','085612345678', 'Jawa Timur',    'Surabaya',       'Genteng',   '60271', 'Jl. Diponegoro No. 8',       TRUE),
('addr0004-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004', 'Rumah', 'Lina Marlina', '081345678901', 'DI Yogyakarta', 'Sleman',         'Depok',     '55281', 'Jl. Kaliurang Km. 7 No. 3',  TRUE)
ON CONFLICT (id_alamat) DO NOTHING;

-- ── ORDER ──────────────────────────────────────────────────
INSERT INTO "order" (id_order, id_user, id_seller, id_alamat, total_hrg, stat_order, catatan) VALUES
('ord00001-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'aaaa0003-0000-0000-0000-000000000003', 'addr0001-0000-0000-0000-000000000001', 368000, 'diproses',   NULL),
('ord00002-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000001', 'addr0002-0000-0000-0000-000000000002', 257000, 'dikirim',    NULL),
('ord00003-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000001', 'addr0003-0000-0000-0000-000000000003', 342000, 'selesai',    NULL),
('ord00004-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004', 'aaaa0004-0000-0000-0000-000000000004', 'addr0004-0000-0000-0000-000000000004', 427000, 'pending',    NULL)
ON CONFLICT (id_order) DO NOTHING;

-- ── ORDER ITEMS ────────────────────────────────────────────
INSERT INTO order_item (id_order_item, id_order, id_produk, qty_orderitem, hrg_saat_beli) VALUES
('ordi0001-0000-0000-0000-000000000001', 'ord00001-0000-0000-0000-000000000001', 'prod0003-0000-0000-0000-000000000003', 1, 350000),
('ordi0002-0000-0000-0000-000000000002', 'ord00002-0000-0000-0000-000000000002', 'prod0005-0000-0000-0000-000000000005', 2, 128000),
('ordi0003-0000-0000-0000-000000000003', 'ord00003-0000-0000-0000-000000000003', 'prod0002-0000-0000-0000-000000000002', 1, 325000),
('ordi0004-0000-0000-0000-000000000004', 'ord00004-0000-0000-0000-000000000004', 'prod0007-0000-0000-0000-000000000007', 1, 427000)
ON CONFLICT (id_order_item) DO NOTHING;
