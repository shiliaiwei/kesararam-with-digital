import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getFolderFromPublicId(publicId: string): string {
  const parts = publicId.split("/");
  if (parts.length <= 1) {
    return "root";
  }
  return parts.slice(0, -1).join("/");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder")?.trim();
    const tag = searchParams.get("tag");

    if (
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET ||
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    ) {
      return NextResponse.json(
        { error: "Cloudinary environment variables are missing." },
        { status: 500 },
      );
    }

    // Use the Cloudinary API to fetch image resources
    const params: {
      max_results: number;
      resource_type: "image";
      type: "upload";
      tags?: true;
      prefix?: string;
    } = {
      max_results: 200,
      resource_type: "image",
      type: "upload",
      tags: true,
    };

    if (folder && folder !== "root") {
      params.prefix = `${folder}/`;
    }

    // Fetch resources using Admin API (server side only)
    const api = cloudinary as any;
    const result: any = await api.api.resources(params);
    let rawResources = (result.resources || []) as any[];

    if (tag) {
      rawResources = rawResources.filter(
        (resource) =>
          Array.isArray(resource.tags) && resource.tags.includes(tag),
      );
    }

    const folderCount = new Map<string, number>();
    const categoryCount = new Map<string, number>();

    for (const resource of rawResources) {
      const resourceFolder = getFolderFromPublicId(resource.public_id);
      folderCount.set(
        resourceFolder,
        (folderCount.get(resourceFolder) ?? 0) + 1,
      );
      for (const resourceTag of resource.tags || []) {
        categoryCount.set(
          resourceTag,
          (categoryCount.get(resourceTag) ?? 0) + 1,
        );
      }
    }

    // Transform the result to return only necessary data
    const resources = rawResources.map((resource: any) => ({
      public_id: resource.public_id,
      url: cloudinary.url(resource.public_id, {
        secure: true,
        transformation: [{ fetch_format: "auto", quality: "auto" }],
      }),
      folder: getFolderFromPublicId(resource.public_id),
      tags: resource.tags || [],
      width: resource.width,
      height: resource.height,
      created_at: resource.created_at,
    }));

    const folders = Array.from(folderCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const categories = Array.from(categoryCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      resources,
      total: resources.length,
      folders,
      categories,
    });
  } catch (error) {
    console.error("[Cloudinary API Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch images from Cloudinary" },
      { status: 500 },
    );
  }
}
