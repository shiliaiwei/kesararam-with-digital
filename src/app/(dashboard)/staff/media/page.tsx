import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MediaLibrary } from "@/components/media/media-library";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media Library | Staff Dashboard",
};

export default async function StaffMediaPage() {
  const session = await getSession();
  if (!session || (session.role !== "staff" && session.role !== "admin")) redirect("/login");

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-black">Media Library</h1>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
          Browse and manage all Cloudinary resources
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}
