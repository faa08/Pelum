"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authService } from "@/backend/authService";
import { orderService } from "@/backend/orderService";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const amount = Number(searchParams.get("amount")) || 0;
  const finishReturn = searchParams.get("finish") === "1";

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState<{ id_order: string }[]>([]);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [autoFinishAttempted, setAutoFinishAttempted] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace("/masuk?redirect=/checkout/payment");
      return;
    }

    const placed = orderService.getPlacedOrders();
    if (!placed?.orders?.length) {
      router.replace("/keranjang");
      return;
    }
    setOrders(placed.orders);
    setLoading(false);
  }, [router]);

  const handlePaySuccess = useCallback(async () => {
    if (!orders.length) return;
    setCompleting(true);
    try {
      await orderService.completePayment(
        orders.map((o) => o.id_order),
        true,
        { createChat: true, paymentType: "digital" }
      );
      orderService.clearCheckoutSession();
      sessionStorage.removeItem("pelum_checkout_voucher");
      setChatOrderId(orders[0]?.id_order || null);
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memverifikasi pembayaran.");
    } finally {
      setCompleting(false);
    }
  }, [orders]);

  useEffect(() => {
    if (finishReturn && orders.length > 0 && !success && !autoFinishAttempted && !completing) {
      setAutoFinishAttempted(true);
      handlePaySuccess();
    }
  }, [finishReturn, orders, success, autoFinishAttempted, completing, handlePaySuccess]);

  if (loading) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="#1D4ED8" className="animate-spin" />
      </main>
    );
  }

  if (success) {
    return (
      <main style={{ background: "#FCFCFA", minHeight: "70vh", padding: "48px 24px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", background: "white", borderRadius: 16, border: "1px solid #EAE5E0", padding: 32, textAlign: "center" }}>
          <CheckCircle2 size={56} color="#16A34A" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 8 }}>Pembayaran Berhasil</h1>
          <p style={{ fontSize: "0.875rem", color: "#5C5550", marginBottom: 24 }}>
            Admin Pelataran UMKM akan menghubungi Anda lewat chat untuk koordinasi pengiriman (alamat, kurir, jadwal).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {chatOrderId && (
              <Link
                href={`/account/orders/${chatOrderId}/chat`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  height: 44, background: "#16A34A", color: "white", borderRadius: 8,
                  fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
                }}
              >
                Buka Chat Pengiriman <ArrowRight size={16} />
              </Link>
            )}
            <Link href="/account/orders" style={{ fontSize: "0.8125rem", color: "#1D4ED8", fontWeight: 700 }}>
              Lihat Pesanan Saya
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#FCFCFA", minHeight: "70vh", padding: "48px 24px" }}>
      <div style={{
        maxWidth: 520, margin: "0 auto", background: "white", borderRadius: 16,
        border: "1px solid #EAE5E0", padding: 32, boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}>
        <span style={{
          fontSize: "0.65rem", fontWeight: 800, color: "white", background: "#1D4ED8",
          padding: "4px 8px", borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          Simulator Midtrans
        </span>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "12px 0 8px" }}>Pembayaran Digital</h1>
        <p style={{ fontSize: "0.8125rem", color: "#5C5550", marginBottom: 24 }}>
          Midtrans belum dikonfigurasi. Gunakan tombol di bawah untuk mensimulasikan pembayaran berhasil.
        </p>

        <div style={{ background: "#EFF6FF", borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: "0.75rem", color: "#5C5550", margin: "0 0 4px" }}>Total Tagihan</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1D4ED8", margin: 0 }}>
            Rp {(amount || orders.reduce((s, o) => s + (o as { total_hrg?: number }).total_hrg!, 0)).toLocaleString("id-ID")}
          </p>
          {ref && (
            <p style={{ fontSize: "0.75rem", color: "#8E8680", margin: "8px 0 0" }}>Ref: {ref}</p>
          )}
        </div>

        <button
          onClick={handlePaySuccess}
          disabled={completing}
          style={{
            width: "100%", height: 48, background: "#16A34A", color: "white", border: "none",
            borderRadius: 8, fontWeight: 800, fontSize: "0.9375rem", cursor: completing ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {completing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Memverifikasi...
            </>
          ) : (
            "Simulasikan Pembayaran Berhasil"
          )}
        </button>

        <button
          onClick={() => router.push("/checkout")}
          style={{
            width: "100%", height: 40, marginTop: 10, background: "none",
            border: "1.5px solid #D5CFC9", borderRadius: 8, color: "#5C5550",
            fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer",
          }}
        >
          Kembali ke Checkout
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPaymentPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={32} color="#1D4ED8" className="animate-spin" />
        </main>
      }>
        <PaymentContent />
      </Suspense>
      <Footer />
    </>
  );
}
