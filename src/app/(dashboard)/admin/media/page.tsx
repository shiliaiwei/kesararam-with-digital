import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CloudinaryGallery } from "@/components/dashboard/cloudinary-gallery";
import { CloudinaryDemo } from "@/components/dashboard/cloudinary-demo";
import { Images, Upload, Folder, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-purple-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <Images size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
                Media Library
              </h1>
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                Browse files by folders and categories, then upload new assets
              </p>
            </div>
          </div>
          
          {/* Upload Button */}
          <button className="flex items-center gap-2 px-4 py-3 bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100">
            <Upload size={20} className="text-black" />
            <span className="font-black text-sm uppercase tracking-wide text-black">
              Upload Media
            </span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Images size={20} className="text-black" />
          </div>
          <div>
            <span className="text-2xl font-black text-black">∞</span>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Total Images
            </p>
          </div>
        </div>
        
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-black bg-green-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Folder size={20} className="text-black" />
          </div>
          <div>
            <span className="text-2xl font-black text-black">∞</span>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Folders
            </p>
          </div>
        </div>
        
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-black bg-orange-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Tag size={20} className="text-black" />
          </div>
          <div>
            <span className="text-2xl font-black text-black">∞</span>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Categories
            </p>
          </div>
        </div>
      </div>

      {/* Cloudinary Gallery */}
      <CloudinaryGallery />

      {/* Upload Demo */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
        <div className="border-b-2 border-black bg-purple-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            Upload New Media
          </h2>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            Upload images and files to Cloudinary
          </p>
        </div>
        <div className="p-6">
          <div className="max-w-xl">
            <CloudinaryDemo />
          </div>
        </div>
      </div>
    </div>
  );
}
