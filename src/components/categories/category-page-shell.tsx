"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_COLORS, CATEGORY_SHADOW } from "@/lib/utils";
import { FaClipboardList } from "react-icons/fa";
import { useLang } from "@/context/lang-context";
import Image from "next/image";

interface ContentCardSkeletonProps {
  slug: string;
}

function ContentCardSkeleton({ slug }: ContentCardSkeletonProps) {
  const color = CATEGORY_COLORS[slug] ?? "#eab308";
  return (
    <div
      className="bg-white border-2 border-black rounded-none overflow-hidden"
      style={{ boxShadow: "4px 4px 0 #000" }}
    >
      <div className="h-2" style={{ backgroundColor: color }} />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4 rounded-none" />
        <Skeleton className="h-3 w-1/2 rounded-none" />
        <Skeleton className="h-16 w-full rounded-none" />
        <Skeleton className="h-8 w-24 rounded-none" />
      </div>
    </div>
  );
}

interface CategoryPageShellProps {
  slug: string;
  titleEn: string;
  titleKh: string;
  descEn: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export function CategoryPageShell({
  slug,
  titleEn,
  titleKh,
  descEn,
  children,
  isLoading = false,
}: CategoryPageShellProps) {
  const color = CATEGORY_COLORS[slug] ?? "#eab308";
  const shadow = CATEGORY_SHADOW[slug] ?? "4px 4px 0 #000";
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-learning)" } : {};

  // Mode translations
  const modes = [
    { en: "Flashcards", kh: "ប័ណ្ណសិក្សា" },
    { en: "Quiz", kh: "តេស្ត" },
    { en: "Practice Test", kh: "ហ្វឹកហ្វឺន" },
    { en: "Challenge", kh: "ប្រកួត" }
  ];

  return (
    <div className="min-h-screen dot-bg">
      {/* Category hero - reduced padding */}
      <div
        className="border-b-4 border-black py-10 md:py-12"
        style={{ backgroundColor: color }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6">
            {/* Character image on the left */}
            <div className="hidden md:block flex-shrink-0">
              <div
                className="w-32 h-32 rounded-none overflow-hidden bg-white relative"
                style={{
                  boxShadow: "4px 4px 0 #000",
                  border: "4px solid #000",
                  background: "repeating-linear-gradient(45deg, #000, #000 8px, #fbbf24 8px, #fbbf24 16px)"
                }}
              >
                <div className="w-full h-full bg-white m-1">
                  <Image
                    src="https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu"
                    alt="Character"
                    width={120}
                    height={120}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 flex-1">
              <span
                className="text-xs font-black tracking-widest uppercase bg-black text-white px-3 py-1.5 rounded-none w-fit"
                style={khFont}
              >
                {kh ? "ប្រភេទចំណេះដឹង" : "Knowledge Category"}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black leading-tight">
                {kh ? titleKh : titleEn}
              </h1>
              <p
                className="text-lg text-black/70"
                style={{ fontFamily: "var(--font-learning)" }}
              >
                {kh ? titleEn : titleKh}
              </p>
              <p className="text-sm text-black/80 max-w-2xl leading-relaxed" style={khFont}>
                {descEn}
              </p>

              {/* Related links - reduced spacing */}
              <div className="flex flex-wrap gap-2 mt-3">
                {modes.map((mode) => (
                  <span
                    key={mode.en}
                    className="px-3 py-1.5 bg-white border-2 border-black rounded-none text-xs font-bold shadow-[2px_2px_0_#000] cursor-not-allowed opacity-60"
                    title={kh ? "មកដល់ឆាប់ៗ" : "Coming soon — content managed by admin"}
                    style={khFont}
                  >
                    {kh ? mode.kh : mode.en}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area - reduced padding */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ContentCardSkeleton key={i} slug={slug} />
            ))}
          </div>
        ) : children ? (
          children
        ) : (
          /* Empty state */
          <div
            className="bg-white border-2 border-black rounded-none p-8 text-center max-w-lg mx-auto"
            style={{ boxShadow: shadow }}
          >
            <div
              className="w-16 h-16 border-2 border-black rounded-none mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <FaClipboardList size={28} className="text-black" />
            </div>
            <h3 className="text-xl font-black mb-2" style={khFont}>
              {kh ? "មិនទាន់មានមាតិកា" : "No content yet"}
            </h3>
            <p className="text-sm text-zinc-500" style={khFont}>
              {kh
                ? "អ្នកគ្រប់គ្រងនឹងបោះពុម្ពមាតិកាសម្រាប់ប្រភេទនេះឆាប់ៗនេះ។"
                : "An administrator will publish content for this category soon. Check back later."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
