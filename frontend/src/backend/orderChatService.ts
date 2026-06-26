export interface OrderChatMessage {
  id_message: string;
  id_chat: string;
  sender_role: "admin" | "customer";
  sender_id: string | null;
  text: string;
  created_at: string;
}

export interface OrderChatRoom {
  id_chat: string;
  id_order: string;
  id_user: string;
  created_at: string;
  order?: {
    stat_order: string;
    total_hrg: number;
    tipe_pembayaran?: string;
  };
  user?: {
    nama_lengkap?: string;
    email?: string;
  };
  users?: {
    nama_lengkap?: string;
    email?: string;
  } | {
    nama_lengkap?: string;
    email?: string;
  }[];
  last_message?: string;
}

export const orderChatService = {
  async ensureRoom(orderId: string, userId: string): Promise<string | null> {
    const res = await fetch("/api/order-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ensure", orderId, userId }),
    });
    const data = await res.json();
    if (!res.ok) return null;
    return data.id_chat as string;
  },

  async getMessages(chatId: string): Promise<OrderChatMessage[]> {
    const res = await fetch(`/api/order-chat?chatId=${encodeURIComponent(chatId)}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.messages || [];
  },

  async sendMessage(
    chatId: string,
    senderRole: "admin" | "customer",
    senderId: string | null,
    text: string
  ): Promise<boolean> {
    const res = await fetch("/api/order-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", chatId, senderRole, senderId, text }),
    });
    return res.ok;
  },

  async getRoomByOrder(orderId: string): Promise<OrderChatRoom | null> {
    const res = await fetch(`/api/order-chat?orderId=${encodeURIComponent(orderId)}`);
    const data = await res.json();
    if (!res.ok) return null;
    return data.room || null;
  },

  async listRoomsForAdmin(): Promise<OrderChatRoom[]> {
    const res = await fetch("/api/order-chat?list=admin");
    const data = await res.json();
    if (!res.ok) return [];
    return data.rooms || [];
  },

  async listRoomsForUser(userId: string): Promise<OrderChatRoom[]> {
    const res = await fetch(`/api/order-chat?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.rooms || [];
  },
};
