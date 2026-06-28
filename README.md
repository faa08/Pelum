# Pelataran UMKM (Pelum)

Platform konsinyasi produk UMKM Indonesia — Next.js + Supabase.

## Deploy checklist

### 1. Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan bagian **MIGRASI** di `db.sql` (bukan full reset jika DB sudah ada)
3. Authentication → Email provider ON
4. Redirect URLs: `https://<domain>/auth/callback` dan `http://localhost:3000/auth/callback`
5. Buat user admin di Auth Dashboard, lalu set `role = 'admin'` di tabel `public.users`

### 2. Environment variables (Vercel)

Salin dari `frontend/.env.example`:

| Variable | Wajib |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ya |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ya |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya (server only) |
| `NEXT_PUBLIC_SITE_URL` | Ya (SEO) |
| `MIDTRANS_SERVER_KEY` | Untuk bayar online |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Untuk bayar online |
| `MIDTRANS_IS_PRODUCTION` | `true` di production |
| `GEMINI_API_KEY` | Opsional (chat AI) |

**Midtrans webhook URL:** `https://<domain>/api/payment/midtrans-notification`

### 3. Development

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Simulator pembayaran hanya aktif di `NODE_ENV=development`. Production membutuhkan Midtrans + webhook.

## Struktur

- `frontend/` — Next.js app
- `db.sql` — Schema + migrasi Supabase

## Lisensi

Proprietary — PT Integrasi Produktivitas Indonesia
