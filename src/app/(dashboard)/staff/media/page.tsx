import { Metadata } from "next";
import { MediaLibrary } from "@/components/staff/media/media-library";

export const metadata: Metadata = {
  title: "Media Library | Staff Dashboard",
  description: "Manage media resources",
};

export default function StaffMediaPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Media Library</h1>
        <p className="text-zinc-600">
          Manage images, audio, videos, logos, and brand assets
        </p>
      </div>

      <MediaLibrary />
    </div>
  );
}
