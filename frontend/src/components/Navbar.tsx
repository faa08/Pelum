"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  ShoppingCart, 
  Tag, 
  Check, 
  MessageSquare, 
  Trash2, 
  BellOff, 
  RotateCcw, 
  User,
  Ticket,
  Briefcase,
  LogOut 
} from "lucide-react";
import { authService } from "@/backend/authService";

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

export default function Navbar({ searchQuery, setSearchQuery }: { searchQuery?: string; setSearchQuery?: (q: string) => void }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync current user on mount and on storage changes (login/logout in other tabs)
  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
    const handleStorage = () => setCurrentUser(authService.getCurrentUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isOpen || isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isProfileOpen]);

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

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsProfileOpen(false);
    router.push("/");
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

          {/* Chat Icon */}
          <Link href="/chat" className="nav-cart-btn" id="chat-btn" title="Chat">
            <MessageSquare size={18} className="nav-icon-orange" />
            <span>Chat</span>
          </Link>

          {/* Notification Button and Dropdown Card */}
          <div className="notif-container" ref={containerRef}>
            <button 
              className="nav-bell-btn" 
              id="notif-btn" 
              title="Notifikasi"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <Bell size={18} className="nav-icon-orange" />
              {unreadCount > 0 && (
                <span className="notif-badge-count">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span className="notif-title">Notifikasi</span>
                  <div className="notif-header-actions">
                    {notifications.length > 0 && (
                      <>
                        <button 
                          className="notif-btn-action" 
                          onClick={handleMarkAllRead}
                        >
                          Tandai semua dibaca
                        </button>
                        <button 
                          className="notif-btn-action notif-btn-action-danger" 
                          onClick={handleClearAll}
                          title="Hapus semua"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="notif-list">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notif-item ${notif.unread ? "unread" : ""}`}
                        onClick={() => handleToggleRead(notif.id)}
                      >
                        <div className={`notif-icon-box ${notif.type}`}>
                          {renderNotifIcon(notif.type)}
                        </div>
                        <div className="notif-content">
                          <p className="notif-text">{notif.text}</p>
                          <span className="notif-time">{notif.time}</span>
                        </div>
                        {notif.unread && (
                          <div className="notif-unread-indicator" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="notif-empty">
                      <BellOff size={36} className="notif-empty-icon" />
                      <h4 className="notif-empty-title">Tidak ada notif</h4>
                      <p className="notif-empty-desc">
                        Semua notifikasi baru akan muncul di sini.
                      </p>
                      <button className="notif-empty-reset" onClick={handleReset}>
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

          {currentUser ? (
            /* ── Logged-in: avatar + profile dropdown ── */
            <div className="nav-profile-avatar relative" ref={profileContainerRef}>
              <button
                className="avatar-circle flex items-center gap-2 px-2"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-surface-container" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {(currentUser.nama_lengkap || currentUser.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-on-surface hidden sm:block max-w-[120px] truncate">
                  {currentUser.nama_lengkap || currentUser.username}
                </span>
              </button>

              {isProfileOpen && !isMobile && (
                <div className="absolute top-[calc(100%+14px)] right-0 w-[290px] bg-white border border-[#EAE5E0] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col py-3 px-3 text-[#1F1B18] normal-case tracking-normal">
                  {/* Profile Info Header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 px-1">
                    <div className="flex items-center gap-3">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                          {(currentUser.nama_lengkap || currentUser.username || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold leading-tight">{currentUser.nama_lengkap || currentUser.username}</span>
                        <span className="text-[11px] text-gray-400">@{currentUser.username}</span>
                      </div>
                    </div>
                    <Link
                      href="/account/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="px-3.5 py-1.5 bg-[#F5F3F0] hover:bg-[#EBE8E2] transition-colors rounded-full text-xs font-semibold text-gray-700"
                    >
                      Profil Saya
                    </Link>
                  </div>

                  {/* Dropdown Items */}
                  <div className="flex flex-col gap-0.5 text-left font-body">
                    <Link
                      href="/promo"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-gray-400" />
                      <span>Kupon dan Diskon</span>
                    </Link>

                    <Link
                      href="/account/seller"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>Daftar menjadi Seller</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left w-full mt-1 border-t border-gray-100 pt-3"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Guest: Daftar + Login ── */
            <>
              <Link href="/daftar" className="nav-auth-link" id="register-btn">
                Daftar
              </Link>
              <Link href="/masuk" className="nav-auth-link" id="login-btn">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Mobile Bottom Sheet — only shown when logged in */}
      {isProfileOpen && isMobile && currentUser && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(31, 27, 24, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}>
          <div 
            onClick={() => setIsProfileOpen(false)} 
            style={{ position: "absolute", inset: 0 }} 
          />
          <div style={{
            position: "relative",
            width: "100%",
            background: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: "16px 24px 32px",
            boxShadow: "0 -8px 30px rgba(0,0,0,0.15)",
            zIndex: 1010,
            display: "flex",
            flexDirection: "column",
            color: "#1F1B18",
          }}>
            <div style={{
              width: 48,
              height: 5,
              background: "#EAE5E0",
              borderRadius: 3,
              alignSelf: "center",
              marginBottom: 20,
              cursor: "pointer"
            }} onClick={() => setIsProfileOpen(false)} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #F5F3F0", paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="avatar" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#4C1D95", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.1rem", fontWeight: 800 }}>
                    {(currentUser.nama_lengkap || currentUser.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#1F1B18" }}>{currentUser.nama_lengkap || currentUser.username}</span>
                  <span style={{ fontSize: "0.75rem", color: "#8E8680" }}>@{currentUser.username}</span>
                </div>
              </div>
              <Link 
                href="/account/profile"
                onClick={() => setIsProfileOpen(false)}
                style={{
                  padding: "8px 16px", background: "#F5F3F0", borderRadius: 20,
                  fontSize: "0.75rem", fontWeight: 700, color: "#5C5550", textDecoration: "none"
                }}
              >
                Profil Saya
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Link
                href="/promo"
                onClick={() => setIsProfileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                  borderRadius: 10, fontSize: "0.875rem", fontWeight: 700, color: "#5C5550",
                  textDecoration: "none"
                }}
              >
                <Ticket size={18} color="#8E8680" />
                <span>Kupon dan Diskon</span>
              </Link>

              <Link
                href="/account/seller"
                onClick={() => setIsProfileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                  borderRadius: 10, fontSize: "0.875rem", fontWeight: 700, color: "#5C5550",
                  textDecoration: "none"
                }}
              >
                <Briefcase size={18} color="#8E8680" />
                <span>Daftar menjadi Seller</span>
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: "none", border: "none", borderTop: "1.5px solid #F5F3F0",
                  width: "100%", textAlign: "left", fontSize: "0.875rem", fontWeight: 700,
                  color: "#DC2626", cursor: "pointer", marginTop: 12, paddingTop: 16
                }}
              >
                <LogOut size={18} color="#DC2626" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
