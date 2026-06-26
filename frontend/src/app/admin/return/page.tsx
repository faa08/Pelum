"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminReturnRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/chat?tab=return");
  }, [router]);
  return (
    <div className="text-sm text-[#8E8680] p-8">Mengalihkan ke Pusat Chat...</div>
  );
}
