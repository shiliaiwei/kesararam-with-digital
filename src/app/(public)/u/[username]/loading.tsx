// Skeleton for the public student profile. Mirrors the real one-scroll layout:
// avatar + name + summary sentence, the four metric cards, and the stacked
// blocks below — so the page shape is stable before data arrives.

function MetricSkeleton({ accent }: { accent: string }) {
  return (
    <div className="bg-white border-2 border-black" style={{ boxShadow: "4px 4px 0 #000" }}>
      <div style={{ height: 8, background: accent, borderBottom: "2px solid #000" }} />
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0 w-full">
          <div className="h-8 w-20 bg-gray-200 animate-pulse" />
          <div className="h-2.5 w-24 bg-gray-100 animate-pulse mt-3" />
        </div>
        <div className="size-9 bg-gray-200 border-2 border-black flex-shrink-0 animate-pulse" />
      </div>
    </div>
  );
}

function BlockSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}>
      <div style={{ background: "#eab308", borderBottom: "2px solid #000", padding: "10px 16px" }}>
        <div className="h-3.5 w-32 bg-black/20 animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-100 animate-pulse" style={{ width: `${85 - i * 12}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* Top nav placeholder */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <div className="h-4 w-12 bg-gray-200 animate-pulse" />
        <div className="h-3 w-24 bg-gray-100 animate-pulse hidden sm:block" />
        <div className="w-16" />
      </div>

      {/* Caution-tape strip */}
      <div
        style={{
          height: 10,
          background: "repeating-linear-gradient(45deg,#eab308 0 10px,#000 10px 20px)",
          borderBottom: "2px solid #000",
        }}
      />

      {/* Hero: avatar + name + sentence */}
      <div className="bg-white border-b-2 border-black px-5 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div
            className="flex-shrink-0 animate-pulse"
            style={{ width: 90, height: 90, borderRadius: "50%", border: "3px solid #000", background: "#e5e7eb", boxShadow: "3px 3px 0 #000" }}
          />
          <div className="min-w-0 w-full">
            <div className="h-6 w-40 bg-gray-200 animate-pulse" />
            <div className="h-3 w-56 max-w-full bg-gray-100 animate-pulse mt-2" />
          </div>
        </div>
      </div>

      {/* Content: metric cards + stacked blocks */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <div style={{ background: "#fff", border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}>
          <div style={{ background: "#eab308", borderBottom: "2px solid #000", padding: "10px 16px" }}>
            <div className="h-3.5 w-28 bg-black/20 animate-pulse" />
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <MetricSkeleton accent="#eab308" />
            <MetricSkeleton accent="#3b82f6" />
            <MetricSkeleton accent="#22c55e" />
            <MetricSkeleton accent="#f97316" />
          </div>
        </div>
        <BlockSkeleton rows={3} />
        <BlockSkeleton rows={2} />
      </div>
    </div>
  );
}
