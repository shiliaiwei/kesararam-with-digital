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
    <Card className="@container/card mt-4 overflow-hidden border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudUpload className="h-5 w-5" />
          Cloudinary Upload
        </CardTitle>
        <CardDescription>
          Upload files with folder and category tags.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#a8a8a8]">
              Folder
            </span>
            <input
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="road-signs"
              className="h-10 border-2 border-[#a8a8a8] px-3 text-sm font-medium outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#a8a8a8]">
              Tags (comma separated)
            </span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="road-sign, warning"
              className="h-10 border-2 border-[#a8a8a8] px-3 text-sm font-medium outline-none"
            />
          </label>
        </div>

        <CldUploadWidget
          uploadPreset={uploadPreset}
          options={{
            folder: folder || undefined,
            tags: normalizedTags.length > 0 ? normalizedTags : undefined,
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
                className="border-2 border-[#a8a8a8] rounded-none shadow-[3px_3px_0_#000]"
                onClick={() => open()}
              >
                Choose File to Upload
              </Button>
            );
          }}
        </CldUploadWidget>

        {error && (
          <div className="border-2 border-[#ef4444] bg-[#fda4af] p-3 text-xs font-bold text-black">
            {error}
          </div>
        )}

        {imageUrl && (
          <div className="mt-4 border-2 border-[#a8a8a8] p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">
              Recently Uploaded:
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded to CDN"
              className="h-32 w-auto object-cover border-2 border-[#a8a8a8]"
            />
            <p className="mt-2 truncate text-xs">{imageUrl}</p>
            <p className="mt-1 text-xs text-[#a8a8a8]">
              folder: {folder || "root"} | tags:{" "}
              {normalizedTags.join(", ") || "none"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
