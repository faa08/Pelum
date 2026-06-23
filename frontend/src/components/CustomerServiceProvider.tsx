"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Headphones, X, Send, Bot, Loader2 } from "lucide-react";
import "./CustomerService.css";
import { CUSTOMER_SERVICE_WELCOME } from "@/data/customerServiceKnowledge";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface CustomerServiceContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CustomerServiceContext = createContext<CustomerServiceContextValue | null>(null);

export function useCustomerService() {
  const ctx = useContext(CustomerServiceContext);
  if (!ctx) throw new Error("useCustomerService must be used within CustomerServiceProvider");
  return ctx;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  text: CUSTOMER_SERVICE_WELCOME,
  time: "",
};

function formatTime() {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function CustomerServiceChat({ onClose, fullPage = false }: { onClose?: () => void; fullPage?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      time: formatTime(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const history = updated
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/customer-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: res.ok ? data.reply : data.error || "Maaf, terjadi kesalahan.",
        time: formatTime(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "Koneksi gagal. Periksa internet Anda dan coba lagi.",
          time: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`cs-chat ${fullPage ? "cs-chat--full" : ""}`}>
      <div className="cs-chat-header">
        <div className="cs-chat-header-info">
          <div className="cs-chat-avatar">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="cs-chat-title">Customer Service</h3>
            <p className="cs-chat-status">
              <span className="cs-online-dot" />
              TANYA AI · Online
            </p>
          </div>
        </div>
        {onClose && (
          <button type="button" className="cs-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="cs-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`cs-message cs-message--${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="cs-msg-avatar">
                <Bot size={14} />
              </div>
            )}
            <div className="cs-msg-bubble">
              <p>{msg.text}</p>
              {msg.time && <span className="cs-msg-time">{msg.time}</span>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="cs-message cs-message--assistant">
            <div className="cs-msg-avatar">
              <Bot size={14} />
            </div>
            <div className="cs-msg-bubble cs-msg-bubble--typing">
              <Loader2 size={16} className="cs-spinner" />
              <span>Mengetik...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="cs-input-area" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaan Anda..."
          disabled={loading}
          className="cs-input"
        />
        <button type="submit" disabled={!input.trim() || loading} className="cs-send-btn" aria-label="Kirim">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

export default function CustomerServiceProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <CustomerServiceContext.Provider value={{ open, close, toggle, isOpen }}>
      {children}

      {/* Floating button — hidden on full /chat page */}
      {!isChatPage && (
        <>
          <button
            type="button"
            className={`cs-fab ${isOpen ? "cs-fab--active" : ""}`}
            onClick={toggle}
            aria-label="Customer Service"
            title="Customer Service"
          >
            {isOpen ? <X size={22} /> : <Headphones size={22} />}
          </button>

          {isOpen && (
            <>
              <div className="cs-backdrop" onClick={close} aria-hidden="true" />
              <div className="cs-panel">
                <CustomerServiceChat onClose={close} />
              </div>
            </>
          )}
        </>
      )}
    </CustomerServiceContext.Provider>
  );
}

export { CustomerServiceChat };
