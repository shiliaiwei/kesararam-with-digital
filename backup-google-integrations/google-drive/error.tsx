"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Google Drive page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div
        className="bg-red-50 border-2 border-red-400 p-8 max-w-md"
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-600" size={32} />
          <h2 className="text-2xl font-black text-red-900">Something went wrong!</h2>
        </div>
        <p className="text-red-800 mb-4">
          Unable to load Google Drive resources. This might be due to:
        </p>
        <ul className="list-disc list-inside text-sm text-red-700 mb-6 space-y-1">
          <li>Missing environment variables</li>
          <li>Google Drive API configuration issues</li>
          <li>Network connectivity problems</li>
        </ul>
        <button
          onClick={reset}
          className="w-full px-6 py-3 bg-red-400 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
