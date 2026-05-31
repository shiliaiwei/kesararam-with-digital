import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/auth";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File type validation
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role - only staff and admin can upload
    if (session.role !== "staff" && session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - insufficient permissions" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "learning-hub";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isAudio = ALLOWED_AUDIO_TYPES.includes(file.type);

    if (!isImage && !isAudio) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          message: "Only JPG, PNG, SVG, WebP images and MP3, WAV, OGG audio files are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large",
          message: `${isImage ? "Images" : "Audio files"} must be ${isImage ? "5MB" : "10MB"} or less`,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type
    const resourceType = isAudio ? "video" : "image"; // Cloudinary uses 'video' for audio

    // Upload to Cloudinary
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const res = result || {};
    const url = String(res.secure_url ?? "");
    const publicId = String(res.public_id ?? "");
    const format = String(res.format ?? "");
    const size = typeof res.bytes === 'number' ? res.bytes : Number(res.bytes ?? 0);
    const width = typeof res.width === 'number' ? res.width : Number(res.width ?? 0);
    const height = typeof res.height === 'number' ? res.height : Number(res.height ?? 0);
    const resourceType = String(res.resource_type ?? "");

    return NextResponse.json({
      url,
      publicId,
      format,
      size,
      width,
      height,
      resourceType,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const maybeErr = typeof error === 'object' && error !== null ? error as { message?: unknown } : undefined;
    return NextResponse.json(
      {
        error: "Failed to upload file",
        message: typeof maybeErr?.message === 'string' ? maybeErr.message : String(error),
      },
      { status: 500 }
    );
  }
}
