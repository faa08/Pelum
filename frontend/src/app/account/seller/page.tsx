"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BecomeSellerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-secondary font-medium">Mengalihkan...</p>
      </div>
    </div>
  );
}
