import type { SupabaseClient } from "@supabase/supabase-js";
import { setupShippingChatAfterDigitalPay } from "@/lib/shippingChatSetup";
import { deductInventoryForOrder } from "@/lib/orderInventory";

export async function completeCheckoutPayment(
  admin: SupabaseClient,
  orderIds: string[],
  options: {
    success?: boolean;
    createChat?: boolean;
    paymentType?: "digital" | "offline";
    deductInventory?: boolean;
  } = {}
): Promise<{ chatIds: string[] }> {
  const success = options.success !== false;
  const isOffline = options.paymentType === "offline";
  const orderStatus = success ? "diproses" : "dibatalkan";
  const payStatus = success ? (isOffline ? "pending" : "success") : "failed";
  const now = new Date().toISOString();
  const chatIds: string[] = [];

  for (const id_order of orderIds) {
    const { data: orderRow } = await admin
      .from("order")
      .select("stat_order, tipe_pembayaran")
      .eq("id_order", id_order)
      .maybeSingle();

    if (orderRow?.stat_order === "dibatalkan") continue;
    const wasPending = orderRow?.stat_order === "pending";

    const { error: payErr } = await admin
      .from("payment")
      .update({ stat_pay: payStatus, tgl_pay: success && !isOffline ? now : null })
      .eq("id_order", id_order);
    if (payErr) throw payErr;

    const { error: orderErr } = await admin
      .from("order")
      .update({ stat_order: orderStatus, updated_at: now })
      .eq("id_order", id_order);
    if (orderErr) throw orderErr;

    if (success && wasPending && options.deductInventory !== false) {
      await deductInventoryForOrder(admin, id_order);
    }

    if (success && !isOffline && (options.createChat || options.paymentType === "digital")) {
      const chatId = await setupShippingChatAfterDigitalPay(admin, id_order);
      if (chatId) chatIds.push(chatId);
    }

    if (success && isOffline) {
      const { data: order } = await admin
        .from("order")
        .select("id_user")
        .eq("id_order", id_order)
        .maybeSingle();
      if (order?.id_user) {
        await admin.from("notifikasi").insert({
          id_user: order.id_user,
          judul: "Pesanan Pickup Dikonfirmasi",
          pesan: "Pesanan pickup Anda siap. Datang ke toko kami untuk bayar dan ambil barang.",
          tipe: "order",
          link: "/account/orders",
          id_order,
          is_read: false,
        });
      }
    }
  }

  return { chatIds };
}

export async function findOrderIdsByTransactionRef(
  admin: SupabaseClient,
  transactionRef: string
): Promise<string[]> {
  const { data, error } = await admin
    .from("order")
    .select("id_order")
    .eq("transaction_ref", transactionRef);

  if (error) throw error;
  return (data || []).map((row) => row.id_order);
}
