import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    console.log("Fetching Slide images from Cloudinary...");
    
    // Check if environment variables are set
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log("Config:", {
      cloud_name: cloudName || "MISSING",
      api_key: apiKey ? "SET" : "MISSING",
      api_secret: apiSecret ? "SET" : "MISSING",
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Missing Cloudinary credentials");
      return NextResponse.json(
        { 
          error: "Cloudinary credentials not configured",
          details: "Please set CLOUDINARY environment variables",
          images: [],
        },
        { status: 500 }
      );
    }

    // Specific 100 image filenames for the homepage slide (from kwd/ folder)
    const slideImageFilenames = [
      "4a30b62ab9d71fc3_fc2fhr", "ee5cdbd7c4eb71a4_wljoeq", "4be5ff4cded51228_lxgdwn",
      "67a9cd2d581b29d4_bpigg6", "06322cde74134cba_esidzk", "98eefbd1eb849feb_stqsqh",
      "a286f36b3e1a3e2b_hbtnsb", "8a3b706911aab4e4_mhpvob", "702d45ea977b018c_mstuyi",
      "6738fbeee44f1105_k7rl2m", "01154925f4a7c15e_v15ztf", "3d2bc1450a1395ae_hplqah",
      "46a55b6d169000d0_vjcj77", "1c72537f5d1dab5e_kwjydl", "baed0fccac31bcbe_efofti",
      "16a4c99da701ea28_idcl3e", "e55fa77b8eba978d_mqtnhe", "ec4e0a5dfee7fe88_srgnqf",
      "6b37492b7ae8446f_iulnhr", "a369b88ab49b5c53_fg22fv", "cea23412d0ee4270_ebhnrw",
      "4e2bab9187943560_bije62", "c869e95527555c27_udezcp", "5361882f65a0e108_lfqvrb",
      "8f94a5d1650ef162_p4h8w2", "bdbb731df9086536_rftdtl", "6d12620a69479c82_j1xfey",
      "1674492bf3c78162_xoa4md", "afe770139087986f_np4j2n", "6ec559a44b9bf87a_et8ygh",
      "8fbafd0bf8394ee9_rekqhh", "2420c4b2b3fa09d2_fnf7ut", "4c665c5fe2eaaf28_zw9cyj",
      "0c41578b5a40da05_zxajlc", "bdc35f4bab51ec49_dtoxdp", "90e610381992d065_cu6ssu",
      "6517590947ae2bb2_ghb1d4", "7d772e69509f3159_hslqyp", "dc88dc38c1ea7c60_c0wzku",
      "d0cc40ceafaad695_exq6pq", "d4ac931dc958f723_irj6gn", "be998eb55b7227b0_itj2fy",
      "9a1bcb39a4c63105_kyahec", "d58becd2a7198da4_gd75pn", "2ca3967f9f600c9b_mlqqpe",
      "119bdbdddfac94b5_kookri", "85c9397fa480f1c4_mus6z8", "0581e35e569d1ea6_vnyla2",
      "7ec23cb36ab9cc76_zm4e0x", "e67f53c95406b4a1_j6qqnv", "885f738e06ea2a08_aq9p3a",
      "d6a1526241b79fe1_lhaoo5", "d8801b09a399faf9_d4ppvv", "ba0e5a7ee8a501f0_w8lzen",
      "9ca6d982a5be1ade_igvhuy", "e638eac8a6045664_ryneml", "f913777345d83441_xefh7d",
      "69053e43a1206672_bselxq", "613c641a4eb43468_wwpfjf", "f29c1b87be3d0e2f_use5oo",
      "6c444458bbf765bd_aqoxum", "5e436f80ba0101e0_yj6stv", "f34d19ea7c16604a_p2gqfq",
      "1d2f48f1a2d4a64c_xrnmua", "8c6c690dec075ba0_qpmq9x", "3fd0a3d6b78da1d1_owavvg",
      "dca242246bfd8aec_f2nidp", "80f2258b7e8a9f4e_rturej", "c225ac2113430698_uz2ng6",
      "55dcad1433067806_zc8bmb", "bd6a3f4465450ee8_zjmc5t", "4bb567290caef209_wv9ch4",
      "7bf3d64f202b891f_f3mrl1", "0fe5a2402ee7cbd6_jjzj17", "74720ab0c788de1f_jm9rxd",
      "9a58b8e8b144243f_goe10q", "735db9f94d59d105_sijta5", "5821441a245dea75_slgevy",
      "4fc8a5ea1243bb0d_bt5sro", "67970dab94072eb1_ifdlec", "eba53481f44b1e0e_em9erv",
      "4b39f08347ece909_xpxvuk", "3f2ef615e293c6d0_fhdiyl", "2cb1ea5682e8c2f1_ubqgvs",
      "3b88b013a4a1e480_qs6xyy", "50787adbfb4e23c6_fogghd", "a3a8aa42669d2b6d_tjk7ky",
      "2c6e96357208ae34_zfxgij", "42c6fd3c0efea77e_ubzht5", "66335ecdc4f57c5d_k8seat",
      "94713785e285c37f_uxeh0c", "a714322731cc6f77_fw3std", "a18904d0511e8481_va4xv6",
      "b674f6338a3dbc89_en9xqs", "9a0ecef773190648_cxsqbz", "82d1639617d0e217_jongq4",
      "4598e7541096edf6_fxe1vq", "25154ebba4cc0743_v7rtub", "98763cd1f1dc8501_npoote",
      "29280546f27eef8c_hgv1uf"
    ];

    // Try to fetch from kwd/ folder
    console.log("Fetching from kwd/ folder...");
    
    let result: Record<string, any> | null = null;
    
    try {
      result = await cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
        prefix: "kwd/",
        max_results: 500,
      });
      
      console.log(`Found ${result?.resources?.length ?? 0} images in kwd/ folder`);
    } catch (err) {
      console.error("Failed to fetch from kwd/ folder:", err);
      return NextResponse.json(
        { 
          error: "Failed to fetch images from kwd folder",
          details: err instanceof Error ? err.message : "Unknown error",
          images: [],
        },
        { status: 500 }
      );
    }

    if (!result || !result.resources || result.resources.length === 0) {
      console.error("No images found in kwd/ folder");
      return NextResponse.json(
        { 
          error: "No slide images found in kwd folder",
          images: [],
        },
        { status: 404 }
      );
    }

    // Filter for only the specific 100 slide images
    const filteredResources = (result.resources || []).filter((resource: Record<string, unknown>) => {
      const public_id = String(resource.public_id ?? "");
      const filename = public_id.split('/').pop() || "";
      return slideImageFilenames.includes(filename);
    });

    console.log(`Filtered to ${filteredResources.length} specific slide images`);

    // If no specific images found, use all images from kwd folder
    const resourcesToUse = filteredResources.length > 0 ? filteredResources : result.resources;

    // Extract URLs
    let imageUrls = resourcesToUse.map((resource: Record<string, unknown>) => String(resource.secure_url ?? ""));

    // Randomize the order using Fisher-Yates shuffle algorithm
    for (let i = imageUrls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [imageUrls[i], imageUrls[j]] = [imageUrls[j], imageUrls[i]];
    }

    console.log(`Returning ${imageUrls.length} randomized slide images from kwd/ folder`);

    return NextResponse.json({
      images: imageUrls,
      total: imageUrls.length,
      source: `kwd/ folder (${imageUrls.length} images, randomized)`,
    });
  } catch (error) {
    console.error("Error fetching Slide images:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: errMsg || "Failed to fetch images",
        details: "",
        images: [],
      },
      { status: 500 }
    );
  }
}
