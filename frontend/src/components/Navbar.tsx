"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShoppingCart, 
  Bell, 
  Tag, 
  Check, 
  MessageSquare, 
  Trash2, 
  BellOff, 
  RotateCcw 
} from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  text: string;
  time: string;
  type: "offer" | "accepted" | "message";
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    text: "satriyo0997 membuat penawaran baru pada produk Anda",
    time: "21 jam yang lalu",
    type: "offer",
    unread: true,
  },
  {
    id: "2",
    text: "Penawaran Anda telah diterima! Buka transaksi untuk berkoordinasi.",
    time: "23 jam yang lalu",
    type: "accepted",
    unread: true,
  },
  {
    id: "3",
    text: "Pesan baru dari toko Sugar",
    time: "1 hari yang lalu",
    type: "message",
    unread: false,
  },
  {
    id: "4",
    text: "MuhammadJesen mengirimkan penawaran harga",
    time: "1 hari yang lalu",
    type: "offer",
    unread: false,
  },
  {
    id: "5",
    text: "Pesan baru dari wuajitrade",
    time: "2 hari yang lalu",
    type: "message",
    unread: false,
  }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const handleReset = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const renderNotifIcon = (type: Notification["type"]) => {
    switch (type) {
      case "offer":
        return <Tag size={15} />;
      case "accepted":
        return <Check size={15} />;
      case "message":
        return <MessageSquare size={15} />;
    }
  };

  return (
    <header className="site-header">
      <div className="navbar-top-row">
        {/* Left: Logo */}
        <div className="nav-brand">
          <Link href="/" className="navbar-logo-custom">
            <div className="logo-stripes">
              <span className="stripe-orange"></span>
              <span className="stripe-gray"></span>
            </div>
            <span className="logo-text-bold">Pelataran UMKM</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="nav-actions-right">
          <Link href="/keranjang" className="nav-cart-btn" id="cart-btn">
            <ShoppingCart size={18} className="nav-icon-orange" />
            <span>Keranjang</span>
          </Link>

          {/* Notification Button and Dropdown Card */}
          <div className="relative inline-block" ref={containerRef}>
            <button 
              className="relative flex items-center justify-center p-1 text-[#E8600A] hover:text-[#C24E08] transition-colors" 
              id="notif-btn" 
              title="Notifikasi"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E8600A] text-white text-[10px] font-extrabold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border border-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] pointer-events-none">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isOpen && (
              <div className="absolute top-[calc(100%+14px)] right-[-60px] w-[380px] bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-[#FCFCFA]">
                  <span className="text-[15px] font-extrabold text-neutral-800">Notifikasi</span>
                  <div className="flex items-center gap-3">
                    {notifications.length > 0 && (
                      <>
                        <button 
                          className="text-[12px] font-bold text-[#E8600A] hover:text-[#C24E08] transition-colors bg-transparent border-none cursor-pointer" 
                          onClick={handleMarkAllRead}
                        >
                          Tandai semua dibaca
                        </button>
                        <button 
                          className="text-neutral-400 hover:text-red-600 transition-colors bg-transparent border-none cursor-pointer" 
                          onClick={handleClearAll}
                          title="Hapus semua"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3.5 px-5 py-4 cursor-pointer hover:bg-neutral-50 transition-colors text-left w-full relative ${notif.unread ? "bg-[#FFF9F5] hover:bg-[#FFF3EA]" : ""}`}
                        onClick={() => handleToggleRead(notif.id)}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          notif.type === "offer" ? "bg-[#FFF3ED] text-[#E8600A]" :
                          notif.type === "accepted" ? "bg-emerald-50 text-emerald-700" :
                          "bg-blue-50 text-blue-700"
                        }`}>
                          {renderNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <p className={`text-[13px] leading-relaxed text-neutral-600 ${notif.unread ? "font-bold text-neutral-800" : ""}`}>{notif.text}</p>
                          <span className="text-[11px] text-neutral-400">{notif.time}</span>
                        </div>
                        {notif.unread && (
                          <div className="w-2 h-2 bg-[#E8600A] rounded-full self-center shrink-0 shadow-[0_0_0_2px_#FFF9F5]" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-11 px-6 flex flex-col items-center justify-center text-center">
                      <BellOff size={36} className="text-neutral-400 opacity-60 mb-3" />
                      <h4 className="text-sm font-extrabold text-neutral-800 mb-1">Tidak ada notif</h4>
                      <p className="text-xs text-neutral-400 max-w-[240px] leading-relaxed">
                        Semua notifikasi baru akan muncul di sini.
                      </p>
                      <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#E8600A] px-3 py-1.5 border border-dashed border-[#E8600A] rounded hover:bg-[#FFF3ED] hover:border-solid transition-all cursor-pointer bg-white" onClick={handleReset}>
                        <RotateCcw size={12} />
                        <span>Simulasikan Notifikasi</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="nav-separator" />

          <Link href="/daftar" className="nav-auth-link" id="register-btn">
            Daftar
          </Link>
          <Link href="/masuk" className="nav-auth-link" id="login-btn">
            Login
          </Link>

          <div className="nav-profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-icon">👤</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

