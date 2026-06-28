import type { SupabaseClient } from "@supabase/supabase-js";

export type ChatViewerRole = "admin" | "customer";
export type ChatMessageTable =
  | "order_chat_message"
  | "support_chat_message"
  | "return_chat_message";

export interface ChatReceiptFields {
  delivered_at?: string | null;
  read_at?: string | null;
}

export type ChatReceiptStatus = "sent" | "delivered" | "read";

export function getChatReceiptStatus(msg: ChatReceiptFields): ChatReceiptStatus {
  if (msg.read_at) return "read";
  if (msg.delivered_at) return "delivered";
  return "sent";
}

function oppositeRole(role: ChatViewerRole): ChatViewerRole {
  return role === "admin" ? "customer" : "admin";
}

/** Tandai pesan lawan bicara sebagai terkirim ke perangkat / sudah dibaca */
export async function applyChatReadReceipts(
  admin: SupabaseClient,
  table: ChatMessageTable,
  chatId: string,
  viewerRole: ChatViewerRole,
  options: { markRead?: boolean } = {}
): Promise<void> {
  const senderRole = oppositeRole(viewerRole);
  const now = new Date().toISOString();

  await admin
    .from(table)
    .update({ delivered_at: now })
    .eq("id_chat", chatId)
    .eq("sender_role", senderRole)
    .is("delivered_at", null);

  if (options.markRead) {
    await admin
      .from(table)
      .update({ read_at: now, delivered_at: now })
      .eq("id_chat", chatId)
      .eq("sender_role", senderRole)
      .is("read_at", null);
  }
}

export async function fetchChatMessagesWithReceipts<T extends Record<string, unknown>>(
  admin: SupabaseClient,
  table: ChatMessageTable,
  chatId: string,
  viewerRole?: ChatViewerRole | null,
  markRead = false
): Promise<T[]> {
  if (viewerRole) {
    await applyChatReadReceipts(admin, table, chatId, viewerRole, { markRead });
  }

  const { data, error } = await admin
    .from(table)
    .select("*")
    .eq("id_chat", chatId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as T[];
}
