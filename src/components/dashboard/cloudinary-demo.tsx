"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloudUpload } from "lucide-react";
import { useState } from "react";

export function CloudinaryDemo() {
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default_preset";
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [folder, setFolder] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalizedTags = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <Card className="@container/card mt-4 overflow-hidden border-2 border-black shadow-[4px_4px_0_#000] rounded-none bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-black">
          <CloudUpload className="h-6 w-6" />
          Cloudinary Upload
        </CardTitle>
        <CardDescription className="text-xs font-bold uppercase tracking-widest text-black">
          Upload files with folder and category tags
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-widest text-black">
              Folder
            </span>
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="E.G. ROAD-SIGNS"
              className="h-10 border-2 border-black px-3 text-sm font-bold bg-white focus:outline-none focus:ring-0 placeholder:text-black/60 uppercase"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-widest text-black">
              Tags (comma separated)
            </span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="E.G. WARNING, URBAN"
              className="h-10 border-2 border-black px-3 text-sm font-bold bg-white focus:outline-none focus:ring-0 placeholder:text-black/60 uppercase"
            />
          </label>
        </div>

        <CldUploadWidget
          uploadPreset={uploadPreset}
          options={{
            folder: folder || undefined,
            tags: normalizedTags.length > 0 ? normalizedTags : undefined,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#000000",
                tabIcon: "#000000",
                menuIcons: "#000000",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#000000",
                action: "#000000",
                inactiveTabIcon: "#555555",
                error: "#000000",
                inProgress: "#000000",
                complete: "#000000",
                sourceBg: "#FFFFFF"
              },
              fonts: {
                default: null,
                "'KWD Roboto', sans-serif": {
                  url: "/Roboto/Roboto-VariableFont_wdth,wght.woff2",
                  active: true
                }
              }
            }
          }}
          onSuccess={(result: any) => {
            if (result.info?.secure_url) {
              setImageUrl(result.info.secure_url);
              setError(null);
            }
          }}
          onError={(uploadError) => {
            console.error("[cloudinary upload error]", uploadError);
            setError(
              "Upload failed. Check upload preset and Cloudinary permissions.",
            );
          }}
        >
          {({ open }) => {
            return (
              <Button
                variant="outline"
                className="w-full h-12 text-sm font-black uppercase tracking-widest border-2 border-black bg-white text-black shadow-[4px_4px_0_#000] hover:bg-black hover:text-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] rounded-none"
                onClick={() => open()}
              >
                Choose File to Upload
              </Button>
            );
          }}
        </CldUploadWidget>

        {error && (
          <div className="border-2 border-black bg-white p-3 text-xs font-black text-black uppercase">
            Error: {error}
          </div>
        )}

        {imageUrl && (
          <div className="mt-4 border-2 border-black bg-white p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-black">
              Recently Uploaded
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-32 aspect-square bg-white border-2 border-black shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Uploaded to CDN"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black">URL</p>
                  <p className="text-xs truncate font-mono bg-white border border-black p-1 text-black">{imageUrl}</p>
                </div>
                <div className="flex gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">Folder</p>
                    <p className="text-xs font-bold text-black uppercase">{folder || "ROOT"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">Tags</p>
                    <p className="text-xs font-bold text-black uppercase">{normalizedTags.length > 0 ? normalizedTags.join(", ") : "NONE"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
