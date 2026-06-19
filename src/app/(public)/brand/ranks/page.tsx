"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToBrandRanks() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/brand#ranks");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-system">
      <div className="text-center">
        <p className="font-bold text-lg animate-pulse">Redirecting to Brand Guidelines...</p>
      </div>
    </div>
  );
}
