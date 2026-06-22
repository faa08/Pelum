import { supabase } from "./supabase";

export interface ChatRoom {
  id_room: string;
  id_buyer: string;
  id_seller: string;
  created_at: string;
  seller?: {
    nm_store: string;
    logo_toko: string;
  };
  buyer?: {
    nama_lengkap: string;
    avatar: string;
  };
}

export interface ChatMessage {
  id_message: string;
  id_room: string;
  sender_id: string;
  text: string;
  created_at: string;
}

const isPlaceholder = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
};

export const chatService = {
  // Get or create room
  async getOrCreateChatRoom(buyerId: string, sellerId: string): Promise<string | null> {
    if (isPlaceholder()) {
      const key = `pelum_chat_rooms`;
      const rooms: ChatRoom[] = JSON.parse(localStorage.getItem(key) || "[]");
      let room = rooms.find(r => r.id_buyer === buyerId && r.id_seller === sellerId);
      if (!room) {
        room = {
          id_room: Math.random().toString(36).substring(2, 9),
          id_buyer: buyerId,
          id_seller: sellerId,
          created_at: new Date().toISOString()
        };
        rooms.push(room);
        localStorage.setItem(key, JSON.stringify(rooms));
      }
      return room.id_room;
    }

    try {
      // Find existing
      const { data: existing, error: findError } = await supabase
        .from("chat_room")
        .select("id_room")
        .eq("id_buyer", buyerId)
        .eq("id_seller", sellerId)
        .maybeSingle();

      if (findError) throw findError;
      if (existing) return existing.id_room;

      // Insert new
      const { data: newRoom, error: insertError } = await supabase
        .from("chat_room")
        .insert({ id_buyer: buyerId, id_seller: sellerId })
        .select("id_room")
        .single();

      if (insertError) throw insertError;
      return newRoom.id_room;
    } catch (err) {
      console.error("chatService.getOrCreateChatRoom failed:", err);
      return null;
    }
  },

  // Get buyer chat rooms
  async getBuyerRooms(buyerId: string): Promise<ChatRoom[]> {
    if (isPlaceholder()) {
      const rooms: ChatRoom[] = JSON.parse(localStorage.getItem(`pelum_chat_rooms`) || "[]");
      const filtered = rooms.filter(r => r.id_buyer === buyerId);
      // Attach seller info if possible
      const sellers = JSON.parse(localStorage.getItem("pelum_sellers") || "[]");
      return filtered.map(r => {
        const s = sellers.find((seller: any) => seller.id_seller === r.id_seller);
        return {
          ...r,
          seller: s ? { nm_store: s.nm_store, logo_toko: s.logo_toko } : { nm_store: "Toko UMKM", logo_toko: "" }
        };
      });
    }

    try {
      const { data, error } = await supabase
        .from("chat_room")
        .select(`
          id_room, id_buyer, id_seller, created_at,
          seller ( nm_store, logo_toko )
        `)
        .eq("id_buyer", buyerId);

      if (error) throw error;
      return (data || []).map((r: any) => ({
        id_room: r.id_room,
        id_buyer: r.id_buyer,
        id_seller: r.id_seller,
        created_at: r.created_at,
        seller: r.seller ? {
          nm_store: r.seller.nm_store,
          logo_toko: r.seller.logo_toko || ""
        } : undefined
      }));
    } catch (err) {
      console.error("chatService.getBuyerRooms failed:", err);
      return [];
    }
  },

  // Get seller chat rooms
  async getSellerRooms(sellerId: string): Promise<ChatRoom[]> {
    if (isPlaceholder()) {
      const rooms: ChatRoom[] = JSON.parse(localStorage.getItem(`pelum_chat_rooms`) || "[]");
      const filtered = rooms.filter(r => r.id_seller === sellerId);
      // Attach buyer info if possible (users)
      const users = JSON.parse(localStorage.getItem("pelum_users") || "[]");
      return filtered.map(r => {
        const u = users.find((user: any) => user.id_user === r.id_buyer);
        return {
          ...r,
          buyer: u ? { nama_lengkap: u.nama_lengkap || u.username, avatar: u.avatar || "" } : { nama_lengkap: "Pembeli", avatar: "" }
        };
      });
    }

    try {
      const { data, error } = await supabase
        .from("chat_room")
        .select(`
          id_room, id_buyer, id_seller, created_at,
          users:id_buyer ( nama_lengkap, username, avatar )
        `)
        .eq("id_seller", sellerId);

      if (error) throw error;
      return (data || []).map((r: any) => {
        const buyerUser = Array.isArray(r.users) ? r.users[0] : r.users;
        return {
          id_room: r.id_room,
          id_buyer: r.id_buyer,
          id_seller: r.id_seller,
          created_at: r.created_at,
          buyer: buyerUser ? {
            nama_lengkap: buyerUser.nama_lengkap || buyerUser.username || "Pembeli",
            avatar: buyerUser.avatar || ""
          } : undefined
        };
      });
    } catch (err) {
      console.error("chatService.getSellerRooms failed:", err);
      return [];
    }
  },

  // Get chat messages in a room
  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    if (isPlaceholder()) {
      const messages: ChatMessage[] = JSON.parse(localStorage.getItem(`pelum_chat_messages`) || "[]");
      return messages.filter(m => m.id_room === roomId).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    try {
      const { data, error } = await supabase
        .from("chat_message")
        .select("*")
        .eq("id_room", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("chatService.getChatMessages failed:", err);
      return [];
    }
  },

  // Send message
  async sendMessage(roomId: string, senderId: string, text: string): Promise<ChatMessage | null> {
    const newMessage = {
      id_message: typeof crypto !== "undefined" ? crypto.randomUUID() : `msg-${Math.random().toString(36).substring(2, 9)}`,
      id_room: roomId,
      sender_id: senderId,
      text,
      created_at: new Date().toISOString()
    };

    if (isPlaceholder()) {
      const messages: ChatMessage[] = JSON.parse(localStorage.getItem(`pelum_chat_messages`) || "[]");
      messages.push(newMessage);
      localStorage.setItem(`pelum_chat_messages`, JSON.stringify(messages));
      return newMessage;
    }

    try {
      const { data, error } = await supabase
        .from("chat_message")
        .insert({
          id_room: roomId,
          sender_id: senderId,
          text
        })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("chatService.sendMessage failed:", err);
      return null;
    }
  },

  // Support tickets
  async createSupportTicket(userId: string | null, subject: string, message: string): Promise<boolean> {
    if (isPlaceholder()) {
      const tickets = JSON.parse(localStorage.getItem("pelum_support_tickets") || "[]");
      tickets.push({
        id_ticket: Math.random().toString(36).substring(2, 9),
        id_user: userId,
        subject,
        message,
        created_at: new Date().toISOString()
      });
      localStorage.setItem("pelum_support_tickets", JSON.stringify(tickets));
      return true;
    }

    try {
      const { error } = await supabase
        .from("support_ticket")
        .insert({
          id_user: userId,
          subject,
          message
        });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("chatService.createSupportTicket failed:", err);
      return false;
    }
  }
};
