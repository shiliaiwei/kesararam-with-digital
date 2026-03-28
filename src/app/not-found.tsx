import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dot-bg">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24">
              <Image
                src="/logo.svg"
                alt="KWD Logo"
                width={96}
                height={96}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* 404 */}
          <div className="mb-6">
            <h1 className="text-8xl font-black text-yellow-400 mb-2" style={{ textShadow: "4px 4px 0 #000" }}>
              404
            </h1>
            <div className="h-1 w-24 bg-black mx-auto mb-4" />
            <h2 className="text-2xl font-black text-black mb-2">
              Page Not Found
            </h2>
            <p className="text-zinc-600 text-sm">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full px-6 py-3 bg-yellow-400 text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Go Home
            </Link>
            <Link
              href="/home"
              className="w-full px-6 py-3 bg-white text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
