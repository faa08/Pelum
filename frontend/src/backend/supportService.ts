import { supabase } from "./supabase";

const isPlaceholder = () =>
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export const supportService = {
  async submitContact(payload: {
    userId?: string;
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    if (isPlaceholder()) {
      console.log("support_ticket (local):", payload);
      return true;
    }

    try {
      const { error } = await supabase.from("support_ticket").insert({
        id_user: payload.userId || null,
        subject: `[${payload.name} <${payload.email}>] ${payload.subject}`,
        message: payload.message,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("supportService.submitContact failed:", err);
      return false;
    }
  },

  async createSupportTicket(
    userId: string | null,
    subject: string,
    message: string
  ): Promise<boolean> {
    if (isPlaceholder()) {
      console.log("support_ticket (local):", { userId, subject, message });
      return true;
    }

    try {
      const { error } = await supabase.from("support_ticket").insert({
        id_user: userId,
        subject,
        message,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("supportService.createSupportTicket failed:", err);
      return false;
    }
  },
};
