"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/backend/authService";
import { returnChatService } from "@/backend/returnService";
import ChatReadReceipt from "@/components/ChatReadReceipt";
import { useChatPolling } from "@/hooks/useChatPolling";
import { useChatScroll } from "@/hooks/useChatScroll";
import { RETURN_EVIDENCE_GUIDE, RETURN_EVIDENCE_NOTE } from "@/lib/returnConstants";

export default function ReturnChatPage() {
  const params = useParams();
  const router = useRouter();
  const returId = String(params.id || "");
  const [chatId, setChatId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const fetchMessages = useCallback(
    (id: string) => returnChatService.getMessages(id, "customer", { markRead: true }),
    []
  );

  const { messages, refresh } = useChatPolling(chatId, fetchMessages);
  const { containerRef, onScroll, scrollToBottomAfterSend } = useChatScroll(messages);

  useEffect(() => {
    async function load() {
      const user = authService.getCurrentUser();
      if (!user) {
        router.replace(`/masuk?redirect=/account/orders/return/${returId}/chat`);
        return;
      }

      const room = await returnChatService.getRoomByRetur(returId);
      if (room?.id_chat) {
        setChatId(room.id_chat);
      }
      setLoading(false);
    }
    load();
  }, [returId, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!user || !chatId || !text.trim()) return;

    setSending(true);
    const ok = await returnChatService.sendMessage(chatId, "customer", user.id_user, text.trim());
    if (ok) {
      await refresh();
      setText("");
      scrollToBottomAfterSend();
    }
    setSending(false);
  };

  if (loading) {
    return <div className="bg-white border border-surface-container rounded-xl p-12 text-center text-secondary text-sm">Memuat chat return...</div>;
  }

  if (!chatId) {
    return (
      <div className="bg-white border border-surface-container rounded-xl p-12 text-center space-y-4">
        <p className="text-secondary text-sm">Chat return tidak ditemukan.</p>
        <Link href="/account/orders" className="text-primary font-bold text-sm">← Kembali ke Pesanan</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href="/account/orders" className="text-xs font-bold text-secondary hover:text-primary mb-2 inline-block">
          ← Pesanan Saya
        </Link>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Chat Return</h2>
        <p className="text-sm text-secondary mt-1">Diskusi pengembalian barang langsung dengan admin.</p>
      </header>

      <div className="rounded-xl border border-orange-200 bg-orange-50/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-bold text-orange-800 uppercase tracking-wider"
        >
          <span>Panduan bukti return</span>
          <span className="material-symbols-outlined text-base">{showGuide ? "expand_less" : "expand_more"}</span>
        </button>
        {showGuide && (
          <div className="px-4 pb-4 space-y-2 border-t border-orange-200/80 max-h-48 overflow-y-auto">
            {RETURN_EVIDENCE_GUIDE.map((section) => (
              <div key={section.title} className="text-[11px]">
                <p className={`font-bold ${section.highlight ? "text-orange-700" : "text-on-surface"}`}>
                  {section.highlight && "★ "}{section.title}
                </p>
                <ul className="list-disc list-inside text-secondary pl-1">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-[10px] text-orange-800/80 pt-1">{RETURN_EVIDENCE_NOTE}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-surface-container rounded-xl shadow-sm flex flex-col" style={{ height: "min(480px, 65vh)" }}>
        <div ref={containerRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isAdmin = msg.sender_role === "admin";
            const isOwn = !isAdmin;
            return (
              <div key={msg.id_message} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${isAdmin ? "bg-surface-container text-on-surface rounded-bl-sm" : "bg-orange-500 text-white rounded-br-sm"}`}>
                  {isAdmin && <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-70 mb-1">Admin</p>}
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isAdmin ? "text-secondary" : "text-white/70"}`}>
                    <span>
                      {new Date(msg.created_at).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                    </span>
                    {isOwn && <ChatReadReceipt message={msg} onLight />}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSend} className="border-t border-surface-container p-4 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis pesan untuk admin..."
            className="flex-1 h-11 px-4 rounded-lg border border-surface-container-high text-sm outline-none focus:border-primary"
          />
          <button type="submit" disabled={sending || !text.trim()} className="px-5 h-11 bg-orange-500 text-white font-bold text-sm rounded-lg disabled:opacity-50">
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
