import { db } from "@/lib/db";
import { roadMarkings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoadMarkingsTable } from "./road-markings-table";

export const dynamic = "force-dynamic";

export default async function AdminRoadMarkingsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  type RoadMarkingRow = {
    id: number;
    category: string;
    nameEn: string;
    nameKm: string;
    descriptionEn: string;
    descriptionKm: string;
    imageUrl: string | null;
    colorCode: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
  };
  let rows: RoadMarkingRow[] = [];
  let dbError: string | null = null;

  try {
    rows = await db
      .select({
        id: roadMarkings.id,
        category: roadMarkings.category,
        nameEn: roadMarkings.nameEn,
        nameKm: roadMarkings.nameKm,
        descriptionEn: roadMarkings.descriptionEn,
        descriptionKm: roadMarkings.descriptionKm,
        imageUrl: roadMarkings.imageUrl,
        colorCode: roadMarkings.colorCode,
        isActive: roadMarkings.isActive,
        sortOrder: roadMarkings.sortOrder,
        createdAt: roadMarkings.createdAt,
      })
      .from(roadMarkings)
      .orderBy(desc(roadMarkings.createdAt));
  } catch (err) {
    console.error("[road-markings] DB error:", err);
    dbError =
      "Database table not found. Run `npx drizzle-kit push` to create the road_markings table.";
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[#006747]" />
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Road Markings
          </h1>
        </div>
        <p className="text-sm text-zinc-500 font-medium pl-5">
          Manage curbs, signals, and longitudinal road markings.
        </p>
      </div>

      {/* Category legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border-2 border-black bg-[#ffffff] shadow-[4px_4px_0_#000] p-3 flex items-start gap-3">
          <div className="w-3 h-full min-h-[40px] bg-[#006747] shrink-0" />
          <div>
            <p className="font-black uppercase text-xs tracking-widest text-[#006747]">
              Curbs Markings
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">
              Edge line and curb delineation markings
            </p>
          </div>
        </div>
        <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000] p-3 flex items-start gap-3">
          <div className="w-3 h-full min-h-[40px] bg-[#3b82f6] shrink-0" />
          <div>
            <p className="font-black uppercase text-xs tracking-widest text-[#3b82f6]">
              Signals Markings
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">
              Stop lines, pedestrian crossings, and signal zones
            </p>
          </div>
        </div>
        <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000] p-3 flex items-start gap-3">
          <div className="w-3 h-full min-h-[40px] bg-[#f97316] shrink-0" />
          <div>
            <p className="font-black uppercase text-xs tracking-widest text-[#f97316]">
              Longitudinal Markings
            </p>
            <p className="text-xs text-zinc-600 mt-0.5">
              Center lines, lane dividers, and caution zones
            </p>
          </div>
        </div>
      </div>

      {/* Main CRUD table */}
      {dbError ? (
        <div className="border-2 border-[#ef4444] bg-[#fda4af] shadow-[4px_4px_0_#000] p-5">
          <p className="font-black uppercase text-sm text-black tracking-widest">
            DB Setup Required
          </p>
          <p className="text-sm text-black mt-1">{dbError}</p>
        </div>
      ) : (
        <div className="border-2 border-black shadow-[4px_4px_0_#000] bg-white p-5">
          <RoadMarkingsTable initialRows={rows} />
        </div>
      )}
    </div>
  );
}
