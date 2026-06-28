import type { ChatReceiptFields } from "@/lib/chatReadReceipts";
import { apiFetch } from "@/lib/api-client";

export interface ReturnChatMessage extends ChatReceiptFields {
  id_message: string;
  id_chat: string;
  sender_role: "admin" | "customer";
  sender_id: string | null;
  text: string;
  created_at: string;
}

export interface ReturnItem {
  id_retur: string;
  alasan: string;
  status: string;
  created_at: string;
  order_item?: {
    id_order_item: string;
    produk?: { id_produk: string; nama_produk: string; cover_img?: string | null; img?: string | null } | null;
    order?: { id_order: string; seller?: { nm_store: string } | null };
  };
}

export const returnService = {
  async completeOrder(orderId: string, userId: string): Promise<boolean> {
    const res = await apiFetch("/api/orders/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyelesaikan pesanan.");
    return true;
  },

  async submitReview(payload: {
    userId: string;
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
    photoReview?: string;
  }): Promise<boolean> {
    const res = await apiFetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan ulasan.");
    return true;
  },

  async getReviewedProductIds(userId: string, productIds: string[]): Promise<string[]> {
    if (!productIds.length) return [];
    const res = await apiFetch(
      `/api/review?userId=${encodeURIComponent(userId)}&productIds=${productIds.join(",")}`
    );
    const data = await res.json();
    return data.reviewed || [];
  },

  async submitReturn(userId: string, orderItemId: string, alasan: string): Promise<string> {
    const res = await apiFetch("/api/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, orderItemId, alasan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal mengajukan return.");
    return data.id_retur as string;
  },

  async listReturns(userId: string): Promise<ReturnItem[]> {
    const res = await apiFetch(`/api/return?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.returns || [];
  },
};

export const returnChatService = {
  async getMessages(
    chatId: string,
    viewerRole?: "admin" | "customer",
    options?: { markRead?: boolean }
  ): Promise<ReturnChatMessage[]> {
    const params = new URLSearchParams({ chatId });
    if (viewerRole) params.set("viewerRole", viewerRole);
    if (options?.markRead) params.set("markRead", "true");
    const res = await apiFetch(`/api/return-chat?${params}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.messages || [];
  },

  async getRoomByRetur(returId: string) {
    const res = await apiFetch(`/api/return-chat?returId=${encodeURIComponent(returId)}`);
    const data = await res.json();
    if (!res.ok) return null;
    return data.room;
  },

  async sendMessage(
    chatId: string,
    senderRole: "admin" | "customer",
    senderId: string | null,
    text: string
  ): Promise<boolean> {
    const res = await apiFetch("/api/return-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", chatId, senderRole, senderId, text }),
    });
    if (res.ok && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("pelum-notif-refresh"));
    }
    return res.ok;
  },

  async listRoomsForAdmin() {
    const res = await apiFetch("/api/return-chat?list=admin");
    const data = await res.json();
    if (!res.ok) return [];
    return data.rooms || [];
  },
};
