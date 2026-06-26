export interface ReturnChatMessage {
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
    produk?: { id_produk: string; nama_produk: string; img: string } | null;
    order?: { id_order: string; seller?: { nm_store: string } | null };
  };
}

export const returnService = {
  async completeOrder(orderId: string, userId: string): Promise<boolean> {
    const res = await fetch("/api/orders/complete", {
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
    const res = await fetch("/api/review", {
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
    const res = await fetch(
      `/api/review?userId=${encodeURIComponent(userId)}&productIds=${productIds.join(",")}`
    );
    const data = await res.json();
    return data.reviewed || [];
  },

  async submitReturn(userId: string, orderItemId: string, alasan: string): Promise<string> {
    const res = await fetch("/api/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, orderItemId, alasan }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal mengajukan return.");
    return data.id_retur as string;
  },

  async listReturns(userId: string): Promise<ReturnItem[]> {
    const res = await fetch(`/api/return?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.returns || [];
  },
};

export const returnChatService = {
  async getMessages(chatId: string): Promise<ReturnChatMessage[]> {
    const res = await fetch(`/api/return-chat?chatId=${encodeURIComponent(chatId)}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.messages || [];
  },

  async getRoomByRetur(returId: string) {
    const res = await fetch(`/api/return-chat?returId=${encodeURIComponent(returId)}`);
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
    const res = await fetch("/api/return-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", chatId, senderRole, senderId, text }),
    });
    return res.ok;
  },

  async listRoomsForAdmin() {
    const res = await fetch("/api/return-chat?list=admin");
    const data = await res.json();
    if (!res.ok) return [];
    return data.rooms || [];
  },
};
