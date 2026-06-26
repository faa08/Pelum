"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/backend/authService";
import { supportChatService, SupportChatMessage, SupportChatRoom } from "@/backend/supportChatService";
import { orderChatService, OrderChatMessage, OrderChatRoom } from "@/backend/orderChatService";
import { returnChatService } from "@/backend/returnService";
import { getOrderPaymentDisplay } from "@/lib/checkoutConstants";

type TabId = "support" | "shipping" | "return";

const TABS: { id: TabId; label: string; desc: string }[] = [
  { id: "support", label: "Chat Pelanggan", desc: "Pertanyaan umum & bantuan" },
  { id: "shipping", label: "Pengiriman", desc: "QRIS — wajib chat pembeli" },
  { id: "return", label: "Return", desc: "Pengajuan pengembalian" },
];

function ChatBubble({
  text,
  time,
  isAdmin,
}: {
  text: string;
  time: string;
  isAdmin: boolean;
}) {
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-xl px-4 py-2.5 text-sm ${
          isAdmin
            ? "bg-[#1D4ED8] text-white rounded-br-sm"
            : "bg-[#F5F3F0] text-[#1F1B18] rounded-bl-sm"
        }`}
      >
        <p className="leading-relaxed">{text}</p>
        <p className={`text-[10px] mt-1 ${isAdmin ? "text-white/70" : "text-[#8E8680]"}`}>{time}</p>
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatOrderId(id: string) {
  return `ORD-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function SupportPanel() {
  const [rooms, setRooms] = useState<SupportChatRoom[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supportChatService.listRoomsForAdmin().then((data) => {
      setRooms(data);
      if (data[0]?.id_chat) setSelectedId(data[0].id_chat);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    supportChatService.getMessages(selectedId).then(setMessages);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const ok = await supportChatService.sendMessage(selectedId, "admin", user?.id_user || null, text.trim());
    if (ok) {
      setMessages(await supportChatService.getMessages(selectedId));
      setText("");
    }
    setSending(false);
  };

  return (
    <ChatLayout
      loading={loading}
      empty={rooms.length === 0}
      emptyText="Belum ada chat pelanggan."
      list={
        rooms.map((room) => {
          const rawUser = room.users;
          const user = Array.isArray(rawUser) ? rawUser[0] : rawUser;
          return (
            <button
              key={room.id_chat}
              type="button"
              onClick={() => setSelectedId(room.id_chat)}
              className={`w-full text-left px-4 py-3 border-b border-[#F5F3F0] transition ${
                room.id_chat === selectedId ? "bg-[#EFF6FF]" : "hover:bg-[#FCFCFA]"
              }`}
            >
              <p className="font-bold text-sm text-[#1F1B18]">{user?.nama_lengkap || user?.email || "Pelanggan"}</p>
              <p className="text-[10px] text-[#8E8680] mt-0.5 uppercase font-bold tracking-wider">Chat umum</p>
            </button>
          );
        })
      }
      headerTitle={selectedId ? "Chat Pelanggan" : undefined}
      messages={
        messages.map((msg) => (
          <ChatBubble
            key={msg.id_message}
            text={msg.text}
            time={formatTime(msg.created_at)}
            isAdmin={msg.sender_role === "admin"}
          />
        ))
      }
      bottomRef={bottomRef}
      text={text}
      setText={setText}
      onSend={handleSend}
      sending={sending}
      hasSelection={!!selectedId}
      placeholder="Balas pelanggan..."
    />
  );
}

function ShippingPanel({ focusOrderId }: { focusOrderId?: string | null }) {
  const [rooms, setRooms] = useState<OrderChatRoom[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const selectedRoom = rooms.find((r) => r.id_chat === selectedId);

  useEffect(() => {
    orderChatService.listRoomsForAdmin().then((data) => {
      setRooms(data);
      if (focusOrderId) {
        const match = data.find((r) => r.id_order === focusOrderId);
        if (match?.id_chat) {
          setSelectedId(match.id_chat);
        } else if (data[0]?.id_chat) {
          setSelectedId(data[0].id_chat);
        }
      } else if (data[0]?.id_chat) {
        setSelectedId(data[0].id_chat);
      }
      setLoading(false);
    });
  }, [focusOrderId]);

  useEffect(() => {
    if (!selectedId) return;
    orderChatService.getMessages(selectedId).then(setMessages);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const ok = await orderChatService.sendMessage(selectedId, "admin", user?.id_user || null, text.trim());
    if (ok) {
      setMessages(await orderChatService.getMessages(selectedId));
      setText("");
    }
    setSending(false);
  };

  const order = selectedRoom
    ? Array.isArray(selectedRoom.order)
      ? selectedRoom.order[0]
      : selectedRoom.order
    : null;

  const orderPay = order
    ? getOrderPaymentDisplay({ tipe_pembayaran: order.tipe_pembayaran })
    : null;

  return (
    <ChatLayout
      loading={loading}
      empty={rooms.length === 0}
      emptyText="Belum ada chat pengiriman."
      list={rooms.map((room) => {
        const rawUser = room.users ?? room.user;
        const user = Array.isArray(rawUser) ? rawUser[0] : rawUser;
        const ord = Array.isArray(room.order) ? room.order[0] : room.order;
        const pay = getOrderPaymentDisplay({ tipe_pembayaran: ord?.tipe_pembayaran });
        return (
          <button
            key={room.id_chat}
            type="button"
            onClick={() => setSelectedId(room.id_chat)}
            className={`w-full text-left px-4 py-3 border-b border-[#F5F3F0] transition ${
              room.id_chat === selectedId ? "bg-[#EFF6FF]" : "hover:bg-[#FCFCFA]"
            }`}
          >
            <p className="font-bold text-sm text-[#1F1B18]">{user?.nama_lengkap || user?.email || "Pelanggan"}</p>
            <p className="text-xs text-[#8E8680] mt-0.5">
              {formatOrderId(room.id_order)} · Rp {Number(ord?.total_hrg || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] mt-1 font-bold text-indigo-700">{pay.label} · Chat pengiriman</p>
          </button>
        );
      })}
      headerTitle={selectedRoom ? `Pengiriman ${formatOrderId(selectedRoom.id_order)}` : undefined}
      headerSub={
        order
          ? `Status: ${order.stat_order}${orderPay ? ` · ${orderPay.label} — ${orderPay.desc}` : ""}`
          : undefined
      }
      messages={messages.map((msg) => (
        <ChatBubble
          key={msg.id_message}
          text={msg.text}
          time={formatTime(msg.created_at)}
          isAdmin={msg.sender_role === "admin"}
        />
      ))}
      bottomRef={bottomRef}
      text={text}
      setText={setText}
      onSend={handleSend}
      sending={sending}
      hasSelection={!!selectedId}
      placeholder="Koordinasi alamat, kurir, jadwal kirim..."
    />
  );
}

function ReturnPanel() {
  const [rooms, setRooms] = useState<
    {
      id_chat: string;
      id_retur: string;
      retur?: { alasan: string; status: string } | { alasan: string; status: string }[];
      users?: { nama_lengkap?: string; email?: string } | { nama_lengkap?: string; email?: string }[];
    }[]
  >([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ id_message: string; sender_role: string; text: string; created_at: string }[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    returnChatService.listRoomsForAdmin().then((data) => {
      setRooms(data);
      if (data[0]?.id_chat) setSelectedId(data[0].id_chat);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    returnChatService.getMessages(selectedId).then(setMessages);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const ok = await returnChatService.sendMessage(selectedId, "admin", user?.id_user || null, text.trim());
    if (ok) {
      setMessages(await returnChatService.getMessages(selectedId));
      setText("");
    }
    setSending(false);
  };

  return (
    <ChatLayout
      loading={loading}
      empty={rooms.length === 0}
      emptyText="Belum ada chat return."
      list={rooms.map((room) => {
        const rawUser = room.users;
        const user = Array.isArray(rawUser) ? rawUser[0] : rawUser;
        const rawRetur = room.retur;
        const retur = Array.isArray(rawRetur) ? rawRetur[0] : rawRetur;
        return (
          <button
            key={room.id_chat}
            type="button"
            onClick={() => setSelectedId(room.id_chat)}
            className={`w-full text-left px-4 py-3 border-b border-[#F5F3F0] transition ${
              room.id_chat === selectedId ? "bg-orange-50" : "hover:bg-[#FCFCFA]"
            }`}
          >
            <p className="font-bold text-sm text-[#1F1B18]">{user?.nama_lengkap || user?.email || "Pelanggan"}</p>
            <p className="text-xs text-[#8E8680] mt-0.5 line-clamp-1">{retur?.alasan || "Return"}</p>
          </button>
        );
      })}
      headerTitle="Chat Return"
      messages={messages.map((msg) => (
        <ChatBubble
          key={msg.id_message}
          text={msg.text}
          time={formatTime(msg.created_at)}
          isAdmin={msg.sender_role === "admin"}
        />
      ))}
      bottomRef={bottomRef}
      text={text}
      setText={setText}
      onSend={handleSend}
      sending={sending}
      hasSelection={!!selectedId}
      placeholder="Balas pengajuan return..."
      sendClassName="bg-[#EA580C] hover:bg-orange-700"
    />
  );
}

function ChatLayout({
  loading,
  empty,
  emptyText,
  list,
  headerTitle,
  headerSub,
  messages,
  bottomRef,
  text,
  setText,
  onSend,
  sending,
  hasSelection,
  placeholder,
  sendClassName = "bg-[#1D4ED8] hover:bg-blue-700",
}: {
  loading: boolean;
  empty: boolean;
  emptyText: string;
  list: React.ReactNode;
  headerTitle?: string;
  headerSub?: string;
  messages: React.ReactNode;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  text: string;
  setText: (v: string) => void;
  onSend: (e: React.FormEvent) => void;
  sending: boolean;
  hasSelection: boolean;
  placeholder: string;
  sendClassName?: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 520 }}>
      <div className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#EAE5E0] font-bold text-sm text-[#8E8680] uppercase tracking-wider">
          Daftar Chat
        </div>
        <div className="max-h-[480px] overflow-y-auto">
          {loading ? (
            <p className="p-6 text-sm text-[#8E8680]">Memuat...</p>
          ) : empty ? (
            <p className="p-6 text-sm text-[#8E8680]">{emptyText}</p>
          ) : (
            list
          )}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white border border-[#EAE5E0] rounded-xl flex flex-col overflow-hidden">
        {hasSelection ? (
          <>
            {headerTitle && (
              <div className="px-4 py-3 border-b border-[#EAE5E0]">
                <p className="font-bold text-sm text-[#1F1B18]">{headerTitle}</p>
                {headerSub && <p className="text-xs text-[#8E8680]">{headerSub}</p>}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[360px]">
              {messages}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={onSend} className="border-t border-[#EAE5E0] p-4 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="flex-1 h-11 px-4 rounded-lg border border-[#D5CFC9] text-sm outline-none focus:border-[#1D4ED8]"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className={`px-5 h-11 text-white font-bold text-sm rounded-lg disabled:opacity-50 ${sendClassName}`}
              >
                Kirim
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[#8E8680] p-8">
            Pilih chat dari daftar.
          </div>
        )}
      </div>
    </div>
  );
}

function AdminChatHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as TabId | null;
  const focusOrderId = searchParams.get("order");
  const activeTab: TabId =
    tabParam === "shipping" || tabParam === "return" ? tabParam : focusOrderId ? "shipping" : "support";

  const setTab = (id: TabId) => {
    router.replace(`/admin/chat?tab=${id}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-2xl font-bold text-[#1F1B18]">Pusat Chat</h1>
        <p className="text-sm text-[#5C5550] mt-1">
          Pesanan <strong>Bayar QRIS</strong>: admin wajib chat pembeli untuk koordinasi pengiriman sebelum input resi.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 bg-white border border-[#EAE5E0] rounded-xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-left transition min-w-[140px] ${
              activeTab === tab.id
                ? "bg-[#1D4ED8] text-white shadow-sm"
                : "hover:bg-[#F5F3F0] text-[#5C5550]"
            }`}
          >
            <p className="text-xs font-extrabold uppercase tracking-wider">{tab.label}</p>
            <p className={`text-[10px] mt-0.5 ${activeTab === tab.id ? "text-white/80" : "text-[#8E8680]"}`}>
              {tab.desc}
            </p>
          </button>
        ))}
      </div>

      {activeTab === "support" && <SupportPanel />}
      {activeTab === "shipping" && <ShippingPanel focusOrderId={focusOrderId} />}
      {activeTab === "return" && <ReturnPanel />}
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[#8E8680] p-8">Memuat pusat chat...</div>}>
      <AdminChatHubContent />
    </Suspense>
  );
}
