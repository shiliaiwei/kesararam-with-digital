import { Metadata } from "next";
import { MediaLibraryRedesigned } from "@/components/staff/media/media-library-redesigned";

export const metadata: Metadata = {
  title: "Media Library | Staff Dashboard",
  description: "Manage media resources from Cloudinary",
};

export default function StaffMediaPage() {
  return <MediaLibraryRedesigned />;
}
