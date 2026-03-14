import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_COLORS, CATEGORY_SHADOW } from "@/lib/utils";
import { FaClipboardList } from "react-icons/fa";

interface ContentCardSkeletonProps {
  slug: string;
}

function ContentCardSkeleton({ slug }: ContentCardSkeletonProps) {
  const color = CATEGORY_COLORS[slug] ?? "#eab308";
  return (
    <div
      className="bg-white border-2 border-[#a8a8a8] rounded-3xl overflow-hidden"
      style={{ boxShadow: "4px 4px 0 #000" }}
    >
      <div className="h-2" style={{ backgroundColor: color }} />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4 rounded-xl" />
        <Skeleton className="h-3 w-1/2 rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-8 w-24 rounded-xl" />
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

  return (
    <div className="min-h-screen dot-bg">
      {/* Category hero */}
      <div
        className="border-b-4 border-[#a8a8a8] py-16 md:py-20"
        style={{ backgroundColor: color }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black tracking-widest uppercase bg-black text-white px-3 py-1.5 rounded-lg w-fit">
              Knowledge Category
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-black leading-tight">
              {titleEn}
            </h1>
            <p
              className="text-xl text-black/70 font-kh-header"
              style={{
                fontFamily: "Kantumruy Pro, sans-serif",
                fontWeight: 700,
              }}
            >
              {titleKh}
            </p>
            <p className="text-base text-black/80 max-w-xl leading-relaxed mt-1">
              {descEn}
            </p>

            {/* Related links */}
            <div className="flex flex-wrap gap-3 mt-4">
              {["Flashcards", "Quiz", "Practice Test", "Challenge"].map(
                (mode) => (
                  <span
                    key={mode}
                    className="px-4 py-2 bg-white border-2 border-[#a8a8a8] rounded-xl text-sm font-bold shadow-[2px_2px_0_#000] cursor-not-allowed opacity-60"
                    title="Coming soon — content managed by admin"
                  >
                    {mode}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
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
            className="bg-white border-2 border-[#a8a8a8] rounded-3xl p-12 text-center max-w-lg mx-auto"
            style={{ boxShadow: shadow }}
          >
            <div
              className="w-16 h-16 border-2 border-[#a8a8a8] rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <FaClipboardList size={28} className="text-black" />
            </div>
            <h3 className="text-xl font-black mb-2">No content yet</h3>
            <p className="text-sm text-zinc-500">
              An administrator will publish content for this category soon.
              Check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
