import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CloudinaryGallery } from "@/components/dashboard/cloudinary-gallery";
import { CloudinaryDemo } from "@/components/dashboard/cloudinary-demo";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cloudinary Media</h1>
        <p className="text-muted-foreground">
          Browse files by folders and categories, then upload new assets.
        </p>
      </div>

      <CloudinaryGallery />

      <div className="max-w-xl">
        <CloudinaryDemo />
      </div>
    </div>
  );
}
