import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    console.log("Fetching Slide images from Cloudinary...");
    console.log("Config:", {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
    });

    // Specific image filenames for the homepage slide
    const slideImageFilenames = [
      "bdbb731df9086536_idzgve",
      "afe770139087986f_c9rykx",
      "6d12620a69479c82_wvf21b",
      "1674492bf3c78162_vcld9h",
      "42113d99f311ce6d_k5bjaz",
      "6ec559a44b9bf87a_lb3ftn",
      "f3a4dec9cd5894a0_tg2lsj",
      "7a3414c55a6ad2f9_qfq5tm",
      "bd9c5c58d21f574f_zho6me",
      "d3cf60679044644e_m4misx",
      "4bd6ca3345ce4f52_i6owvp",
      "50acecfa7ea843ea_jmnj0p",
      "7ce064865085220f_rx07cu",
      "615f40e142cd8a32_rngjxk",
      "033abc9c74d98c46_rdczvk",
      "e2b9373773ab0cff_gxz03f",
      "0c41578b5a40da05_tnqimu",
      "90e610381992d065_o09h2m",
      "03e3767d778e363f_ccebmn",
      "7d772e69509f3159_i4iehy",
      "bdc35f4bab51ec49_xotpmr",
      "4c665c5fe2eaaf28_hnpk2x",
      "2420c4b2b3fa09d2_jjv2cb",
      "8fbafd0bf8394ee9_hmzvfr",
      "d58becd2a7198da4_e1sciv",
      "6517590947ae2bb2_sgasgi",
      "e67f53c95406b4a1_tisu3c",
      "9ca6d982a5be1ade_z7uwby",
      "d4ac931dc958f723_vawjf0",
      "d0cc40ceafaad695_f6ttrb",
      "be998eb55b7227b0_lxxucb",
      "2ca3967f9f600c9b_k5ajhk",
      "885f738e06ea2a08_z55ybg",
      "85c9397fa480f1c4_dg3nnv",
      "9a1bcb39a4c63105_pf8iep",
      "e638eac8a6045664_revg1b",
      "119bdbdddfac94b5_imb1sm",
      "dc88dc38c1ea7c60_p8px7c",
      "d6a1526241b79fe1_qxbv2i",
      "7ec23cb36ab9cc76_mkk1me",
      "0581e35e569d1ea6_wdxfyz",
      "d8801b09a399faf9_k8jwh4",
      "f913777345d83441_rx1lbo",
      "ba0e5a7ee8a501f0_dtihvd",
      "8c6c690dec075ba0_h3pztt",
      "69053e43a1206672_px5gsw",
      "dca242246bfd8aec_aoev74",
      "6c444458bbf765bd_mod2hj",
      "f29c1b87be3d0e2f_btvg9q",
      "5e436f80ba0101e0_ycwium",
    ];

    // Fetch from kwd folder
    console.log("Fetching from kwd/ folder...");
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: "kwd/",
      max_results: 500,
    });

    // Filter for only the specific slide images
    const filteredResources = result.resources.filter((resource: any) => {
      const filename = resource.public_id.split('/').pop();
      return slideImageFilenames.includes(filename);
    });

    // Extract just the URLs
    const imageUrls = filteredResources.map((resource: any) => resource.secure_url);

    console.log(`Returning ${imageUrls.length} slide images from kwd folder`);

    return NextResponse.json({
      images: imageUrls,
      total: imageUrls.length,
      source: "kwd folder (filtered)",
    });
  } catch (error: any) {
    console.error("Error fetching Slide images:", error);
    console.error("Error details:", {
      message: error.message,
      http_code: error.http_code,
      error: error.error,
    });
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch images",
        details: error.error?.message || "",
        images: [],
      },
      { status: 500 }
    );
  }
}

// Enable caching for 1 hour
export const revalidate = 3600;
