"use client";

import { useEffect } from "react";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Staff dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div
        className="bg-yellow-50 border-2 border-yellow-400 p-8 max-w-lg"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-yellow-600" size={32} />
          <h2 className="text-2xl font-black text-yellow-900">Oops! Something went wrong</h2>
        </div>
        <p className="text-yellow-800 mb-6">
          We encountered an unexpected error while loading this page. Don't worry, your data is safe.
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-6 py-3 bg-yellow-400 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all"
          >
            Try Again
          </button>
          <Link
            href="/staff"
            className="flex-1 px-6 py-3 bg-white border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Dashboard
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 p-3 bg-white border border-yellow-400 text-xs">
            <summary className="font-bold cursor-pointer">Error Details</summary>
            <pre className="mt-2 overflow-auto">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
