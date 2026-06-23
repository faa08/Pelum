"use client";

import Navbar from "@/components/Navbar";
import { CustomerServiceChat } from "@/components/CustomerServiceProvider";

export default function CustomerServicePage() {
  return (
    <div className="h-dvh flex flex-col bg-surface overflow-hidden">
      <Navbar hideCartAndChat />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CustomerServiceChat fullPage />
      </main>
    </div>
  );
}
