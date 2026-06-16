import type { CSSProperties } from "react";

// Skeleton for the public student profile. It mirrors the refreshed board-style
// layout so the first paint keeps the same responsive shape as the real page.

const checkerboardStyle: CSSProperties = {
  background:
    "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 28px 28px",
};

function PulseBlock({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse bg-zinc-200 ${className}`} style={style} />;
}

function StatSkeleton({ accent }: { accent: string }) {
  return (
    <div className="min-h-[126px] border-[3px] border-black bg-white" style={{ boxShadow: "5px 5px 0 #000" }}>
      <div className="flex h-full">
        <div className="w-3 border-r-[3px] border-black" style={{ background: accent }} />
        <div className="flex flex-1 flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <PulseBlock className="h-11 w-24" />
            <PulseBlock className="size-10 border-[3px] border-black" />
          </div>
          <PulseBlock className="mt-4 h-3 w-28" />
        </div>
      </div>
    </div>
  );
}

function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="border-[3px] border-black bg-white" style={{ boxShadow: "5px 5px 0 #000" }}>
      <div className="border-b-[3px] border-black bg-[#eab308] px-4 py-3">
        <PulseBlock className="h-4 w-36 bg-black/20" />
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-[44px_1fr] border-[3px] border-black bg-white">
            <PulseBlock className="h-14 border-r-[3px] border-black" />
            <div className="space-y-2 p-3">
              <PulseBlock className="h-2.5 w-20" />
              <PulseBlock className="h-3.5" style={{ width: `${80 - i * 12}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black">
      <div className="border-b-[3px] border-black bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <PulseBlock className="h-9 w-24 border-[3px] border-black bg-white" />
          <PulseBlock className="hidden h-3 w-48 sm:block" />
          <div className="w-[86px]" />
        </div>
      </div>

      <div
        className="h-3.5 border-b-[3px] border-black"
        style={{ background: "repeating-conic-gradient(#eab308 0% 25%, #000 0% 50%) 0 0 / 14px 14px" }}
      />

      <main className="grid-bg">
        <section className="border-b-[3px] border-black bg-white">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-8">
            <div className="border-[3px] border-black bg-white" style={{ boxShadow: "6px 6px 0 #000" }}>
              <div className="h-14 border-b-[3px] border-black" style={checkerboardStyle} />
              <div className="flex flex-col items-center gap-5 p-4 text-center sm:p-6 md:p-8">
                <div className="border-[3px] border-black bg-white p-2" style={{ boxShadow: "5px 5px 0 #000" }}>
                  <PulseBlock className="h-[124px] w-[124px] border-[3px] border-black sm:h-[140px] sm:w-[140px]" />
                </div>
                <div className="flex w-full max-w-3xl flex-col items-center space-y-4">
                  <div className="flex justify-center gap-2">
                    <PulseBlock className="h-7 w-24 border-[3px] border-black" />
                  </div>
                  <PulseBlock className="h-12 w-full max-w-xl" />
                  <PulseBlock className="h-4 w-full max-w-2xl" />
                </div>
              </div>
            </div>

            <aside className="border-[3px] border-black bg-black text-white" style={{ boxShadow: "6px 6px 0 #000" }}>
              <div
                className="h-8 border-b-[3px] border-black"
                style={{ background: "repeating-conic-gradient(#eab308 0% 25%, #000 0% 50%) 0 0 / 20px 20px" }}
              />
              <div className="space-y-5 p-5">
                <PulseBlock className="h-20 w-40 bg-white/20" />
                <div className="grid grid-cols-2 gap-3">
                  <PulseBlock className="h-20 border-[3px] border-white bg-white" />
                  <PulseBlock className="h-20 border-[3px] border-white bg-[#eab308]" />
                </div>
                <PulseBlock className="h-24 border-[3px] border-white bg-white/10" />
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatSkeleton accent="#eab308" />
            <StatSkeleton accent="#3b82f6" />
            <StatSkeleton accent="#22c55e" />
            <StatSkeleton accent="#f97316" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            <div className="space-y-6">
              <PanelSkeleton rows={4} />
              <PanelSkeleton rows={2} />
            </div>
            <PanelSkeleton rows={5} />
          </div>
        </section>
      </main>
    </div>
  );
}
