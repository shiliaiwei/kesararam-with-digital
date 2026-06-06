import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dot-bg px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000]">
          {/* Caution stripe */}
          <div
            className="h-[6px] w-full"
            style={{ background: "repeating-linear-gradient(90deg,#eab308 0,#eab308 18px,#000 18px,#000 36px)" }}
          />

          <div className="p-8 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/brand/kwd-black_nobackground.png"
                alt="KWD"
                width={120}
                height={48}
                className="object-contain h-12 w-auto"
                unoptimized
                priority
              />
            </div>

            {/* 404 */}
            <h1 className="text-8xl font-black text-yellow-400 mb-2" style={{ textShadow: "4px 4px 0 #000" }}>
              404
            </h1>
            <div className="h-1 w-24 bg-black mx-auto mb-4" />
            <h2 className="text-2xl font-black text-black mb-1">
              Page Not Found
            </h2>
            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest font-mono mb-3">
              រកមិនឃើញទំព័រ
            </p>
            <p className="text-zinc-600 text-sm font-medium mb-2 font-google-sans">
              ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ប្ដូរ។
              <span className="block text-xs text-zinc-400 mt-1 font-english">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </span>
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-6">
              <Link
                href="/"
                className="w-full px-6 py-3 bg-yellow-400 text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                ទំព័រដើម · Go Home
              </Link>
              <Link
                href="/play"
                className="w-full px-6 py-3 bg-white text-black font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                ចូលរួមលេង · Browse Quizzes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
