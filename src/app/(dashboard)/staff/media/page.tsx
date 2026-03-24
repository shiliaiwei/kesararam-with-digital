import { Metadata } from "next";
import { CloudinaryMediaLibrary } from "@/components/staff/media/cloudinary-media-library";

export const metadata: Metadata = {
  title: "Media Library | Staff Dashboard",
  description: "Manage media resources from Cloudinary",
};

export default function StaffMediaPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Media Library</h1>
        <p className="text-zinc-600">
          Browse and manage images from your Cloudinary account
        </p>
      </div>

      <CloudinaryMediaLibrary />
    </div>
  );
}
