"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CustomerServiceChat } from "@/components/CustomerServiceProvider";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "admin" ? "admin" : "ai";

  return (
    <div className="h-dvh flex flex-col bg-surface overflow-hidden">
      <Navbar hideCartAndChat />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CustomerServiceChat fullPage initialMode={initialMode} />
      </main>
    </div>
  );
}

export default function CustomerServicePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center text-sm text-secondary">Memuat chat...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
