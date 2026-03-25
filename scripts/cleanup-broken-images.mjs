import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

// Load env
const env = readFileSync(".env.local", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const cloudName = env.match(/^NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
const apiKey = env.match(/^CLOUDINARY_API_KEY=(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
const apiSecret = env.match(/^CLOUDINARY_API_SECRET=(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
const sql = neon(dbUrl);

const BROKEN_URLS = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435000/PW03-M3-08_yquewm.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461138/PW03-M1-02_qqzrlu.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461136/PW03-M2-01_vrnsuk.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461137/PW03-M1-03_cffuzd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461137/PW03-M1-04_axphwq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461136/PW03-M2-03_zszrk7.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461136/PW03-M2-02_gxdore.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461122/PW03-M2-04_rmmfxl.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461121/PW03-M2-05_kfrnui.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461121/PW03-M2-06_gmtrsm.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461121/PW03-M2-07_eybqvc.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461120/PW03-M2-09_vzebjk.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461120/PW03-M2-08_iu37aa.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461120/PW03-M2-10_vptlta.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461119/PW03-M2-11_s7upd5.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461109/PW03-M3-01_qcl5uk.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461108/PW03-M3-02_dzhvhx.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461107/PW03-M3-03_zfkbph.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461106/PW03-M3-05_pttuom.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461106/PW03-M3-04_uqwifm.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461105/PW03-M3-06_mpwkwf.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461105/PW03-M3-07_axfibm.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774461092/PW03-M3-08_csm5hv.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435377/PW03-W1-27_RAILWAY_CROSSING_WITH_GATES_g3a81z.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435375/PW03-W1-23_RIGHT_TURN_AND_LEFT_TURN_zjnlj2.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435375/PW03-W1-02_RIGHT_BEND_dhepeo.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435366/PW03-W1-30_STEEP_DESCENT_amzk4b.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435365/PW03-W1-01_DENGERS_hiwsf7.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435365/PW03-W1-08_ROAD_JUNCTION_ON_THE_LEFT_bhvzbb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435364/PW03-W1-28_RAILWAY_CROSSING_WITHOUT_GATES_c4fbwz.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435364/PW03-W1-26_RAILWAY_CROSSING_ON_LEFT_ROAD_yd5k8o.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435363/PW03-W1-07_ROAD_JUNCTION_ON_THE_RIGHT_xup5e9.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435351/PW03-W1-19_CARRIAGE_WAY_NARROWS_ON_RHS_agrffp.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435351/PW03-W1-17_TWO-WAY_TRAFFIC_ZONE_hhfi8v.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435345/PW03-W1-12_ROAD_JUNCTION_ON_THE_RIGHT_nq0wae.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435343/PW03-W1-11_ROAD_JUNCTION_ON_THE_LEFT_uam4lr.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435338/PW03-W1-16_ROUND_ABOUT_zakjir.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435334/PW03-W1-36_ANIMALS_CROSSING_u3z763.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435324/PW03-W1-39_FALLING_ROCKS_uddkdv.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435322/PW03-W1-32_BUMPY_ROAD_dl5gdj.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435320/PW03-W1-40_LOOSE_STONES_epbg8i.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435320/PW03-W1-35_DISABLED_PEOPLE_CROSSING_AHEAD_zdf2r6.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435319/PW03-P1-07_qxa5ie.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435319/PW03-P1-05_gypfr7.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435318/PW03-P1-08_bkoo28.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435318/PW03-P1-01_fyvjbq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435318/PW03-P1-10_dbg9ur.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435308/PW03-P1-03_xzdndo.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435306/PW03-P1-04_hdgd3p.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435304/PW03-P1-09_q2tzb9.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435305/PW03-P1-06_y9zxlp.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435304/PW03-P1-02_zfr6sp.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435304/PW03-S1-17_qfotrc.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435303/PW03-S1-18_biq3iz.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435303/PW03-S1-12_dly57n.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435295/PW03-S1-14_mkz5bc.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435291/PW03-S1-25_it0rzb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435290/PW03-S1-15_jeh3rv.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435290/PW03-S1-16_poiehb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435290/PW03-S1-23_ggtxyg.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435290/PW03-S1-22_dh46md.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435289/PW03-S1-24_tcj5tn.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435280/PW03-S1-11_zawjnj.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435277/PW03-S1-19_y9zk9d.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435275/PW03-S1-20_awnptd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435275/PW03-S1-13_ozeo6v.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435274/PW03-S1-09_wpfl0u.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435274/PW03-S1-06_ixv6rv.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435274/PW03-S1-21_briahg.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435274/PW03-S1-03_lbobkz.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435267/PW03-S1-07_h93jnb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435266/PW03-S1-02_azq91k.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435264/PW03-S1-01_trlk8t.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435264/PW03-S1-08_hmwmhd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435262/PW03-S1-04_g9l6yo.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435254/PW03-S1-10_ja2uva.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435250/PW03-L1-05_mdpbgp.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435251/PW03-S1-05_vmzapy.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435250/PW03-L1-10_kl9eok.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435250/PW03-L1-09_lohurd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435250/PW03-L1-11_kkolta.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435249/PW03-L1-01_ccwdzi.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435249/PW03-L1-08_cgge6d.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435239/PW03-L1-04_oqxhj4.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435237/PW03-L1-06_erwj6j.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435235/PW03-L1-02_hpttc8.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435234/PW03-L1-03_pwnfns.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435234/PW03-L1-07_vw9qr6.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435234/PW03-M1-01_dzoxx3.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435233/PW03-M1-02_x6wj38.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435208/PW03-M1-04_qip1bi.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435034/PW03-M2-01_mabo1f.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435032/PW03-M2-03_ug6ar6.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435032/PW03-M2-02_nwuqro.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435032/PW03-M2-04_yh2yyk.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435031/PW03-M2-06_gdv7g3.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435030/PW03-M2-08_i1ze0v.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435031/PW03-M2-05_nnxiz0.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435030/PW03-M2-07_b6yaxq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435002/PW03-M2-09_vqrn63.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435002/PW03-M2-10_yj02xk.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435002/PW03-M3-02_pwidsc.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435002/PW03-M3-01_fesjlc.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435001/PW03-M2-11_mw8yj6.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435000/PW03-M3-06_b4yn1l.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435000/PW03-M3-03_hgdumi.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435000/PW03-M3-04_xcgxat.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435000/PW03-M3-07_dcaum0.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774435000/PW03-M3-05_k9ew4u.png",
];

// Deduplicate
const uniqueUrls = [...new Set(BROKEN_URLS)];

// Extract public_ids (strip version prefix and file extension)
function extractPublicId(url) {
  const match = url.match(/\/upload\/v\d+\/(.+)$/);
  if (!match) return null;
  return match[1].replace(/\.[^.]+$/, "");
}

const publicIds = [...new Set(uniqueUrls.map(extractPublicId).filter(Boolean))];

console.log(`\n📋 Found ${uniqueUrls.length} unique URLs → ${publicIds.length} unique public_ids\n`);

async function run() {
  // Step 1: Try to delete from Cloudinary (best effort — they may not exist)
  console.log("☁️  Attempting to delete from Cloudinary...");
  let cloudinaryDeleted = 0;
  let cloudinaryNotFound = 0;

  // Cloudinary delete_resources accepts up to 100 at a time
  const chunks = [];
  for (let i = 0; i < publicIds.length; i += 100) {
    chunks.push(publicIds.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    try {
      const result = await cloudinary.api.delete_resources(chunk, {
        resource_type: "image",
        type: "upload",
      });
      const deleted = Object.values(result.deleted || {}).filter(v => v === "deleted").length;
      const notFound = Object.values(result.deleted || {}).filter(v => v === "not_found").length;
      cloudinaryDeleted += deleted;
      cloudinaryNotFound += notFound;
    } catch (err) {
      console.error("  Cloudinary delete error:", err.message);
    }
  }

  console.log(`  ✅ Deleted from Cloudinary: ${cloudinaryDeleted}`);
  console.log(`  ℹ️  Not found in Cloudinary: ${cloudinaryNotFound}`);

  // Step 2: Remove from database — clear primary_image_url on topics that use these URLs
  console.log("\n🗄️  Cleaning up database...");

  // Find topics using these URLs
  const affected = await sql`
    SELECT id, name_en, primary_image_url, status
    FROM topics
    WHERE primary_image_url = ANY(${uniqueUrls})
  `;

  console.log(`  Found ${affected.length} topics with broken image URLs`);

  if (affected.length > 0) {
    for (const t of affected) {
      console.log(`  - [${t.id}] ${t.name_en} (${t.status}) → ${t.primary_image_url}`);
    }

    // Clear the broken image URLs
    const result = await sql`
      UPDATE topics
      SET primary_image_url = NULL,
          primary_image_source = NULL,
          updated_at = NOW()
      WHERE primary_image_url = ANY(${uniqueUrls})
    `;

    console.log(`  ✅ Cleared primary_image_url on ${affected.length} topics`);
  }

  // Step 3: Also check questions table if it has image fields
  try {
    const affectedQ = await sql`
      SELECT id FROM questions
      WHERE image_url = ANY(${uniqueUrls})
    `;
    if (affectedQ.length > 0) {
      await sql`
        UPDATE questions SET image_url = NULL WHERE image_url = ANY(${uniqueUrls})
      `;
      console.log(`  ✅ Cleared image_url on ${affectedQ.length} questions`);
    }
  } catch (_) {
    // questions table may not have image_url column
  }

  console.log("\n✅ Cleanup complete!\n");
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
