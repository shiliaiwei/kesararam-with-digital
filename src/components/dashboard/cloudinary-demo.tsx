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
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <Card className="@container/card mt-4 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudUpload className="h-5 w-5" />
          CDN Storage Integration
        </CardTitle>
        <CardDescription>
          Upload files directly to your configured Cloudinary storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CldUploadWidget
          uploadPreset="default_preset" // You map this in your Cloudinary Dashboard
          onSuccess={(result: any) => {
            if (result.info?.secure_url) {
              setImageUrl(result.info.secure_url);
            }
          }}
        >
          {({ open }) => {
            return (
              <Button variant="outline" onClick={() => open()}>
                Choose File to Upload
              </Button>
            );
          }}
        </CldUploadWidget>

        {imageUrl && (
          <div className="mt-4 rounded-md border p-4 text-sm text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">Recently Uploaded:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
               src={imageUrl} 
               alt="Uploaded to CDN" 
               className="h-32 w-auto rounded-md object-cover" 
            />
            <p className="mt-2 truncate text-xs">{imageUrl}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
