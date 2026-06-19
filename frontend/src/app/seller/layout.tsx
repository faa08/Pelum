"use client";

import React from "react";
import SellerSidebar from "@/components/SellerSidebar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      {/* Seller Sidebar */}
      <SellerSidebar />

      {/* Content Area */}
      <main className="ml-72 flex-1 p-8 min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
