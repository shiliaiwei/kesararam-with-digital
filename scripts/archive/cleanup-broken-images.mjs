import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const cloudName = env.match(/^NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
const apiKey = env.match(/^CLOUDINARY_API_KEY=(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
const apiSecret = env.match(/^CLOUDINARY_API_SECRET=(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
const sql = neon(dbUrl);

// Step 1: Find all 0-byte (broken) assets in Cloudinary and destroy them
console.log("🔍 Fetching all resources from Cloudinary to find broken ones...");

let allResources = [];
let nextCursor = null;

do {
  const opts = { type: "upload", resource_type: "image", max_results: 500 };
  if (nextCursor) opts.next_cursor = nextCursor;
  const result = await cloudinary.api.resources(opts);
  allResources = allResources.concat(result.resources || []);
  nextCursor = result.next_cursor || null;
} while (nextCursor);

console.log(`  Total resources fetched: ${allResources.length}`);

const broken = allResources.filter(r => (r.bytes || 0) === 0);
console.log(`  Broken (0 bytes): ${broken.length}`);

if (broken.length > 0) {
  console.log("\n🗑️  Destroying broken assets one by one...");
  let destroyed = 0;
  let failed = 0;

  for (const asset of broken) {
    try {
      const result = await cloudinary.uploader.destroy(asset.public_id, {
        resource_type: "image",
        invalidate: true,
      });
      if (result.result === "ok" || result.result === "not found") {
        destroyed++;
        process.stdout.write(`\r  Destroyed: ${destroyed}/${broken.length}`);
      } else {
        failed++;
        console.log(`\n  Failed: ${asset.public_id} → ${result.result}`);
      }
    } catch (err) {
      failed++;
      console.log(`\n  Error: ${asset.public_id} → ${err.message}`);
    }
  }

  console.log(`\n  ✅ Destroyed: ${destroyed}, Failed: ${failed}`);
} else {
  console.log("  No broken assets found.");
}

// Step 2: Also specifically destroy the known PW03 public_ids
const KNOWN_BAD_IDS = [
  "PW03-M3-08_yquewm","PW03-M1-02_qqzrlu","PW03-M2-01_vrnsuk","PW03-M1-03_cffuzd",
  "PW03-M1-04_axphwq","PW03-M2-03_zszrk7","PW03-M2-02_gxdore","PW03-M2-04_rmmfxl",
  "PW03-M2-05_kfrnui","PW03-M2-06_gmtrsm","PW03-M2-07_eybqvc","PW03-M2-09_vzebjk",
  "PW03-M2-08_iu37aa","PW03-M2-10_vptlta","PW03-M2-11_s7upd5","PW03-M3-01_qcl5uk",
  "PW03-M3-02_dzhvhx","PW03-M3-03_zfkbph","PW03-M3-05_pttuom","PW03-M3-04_uqwifm",
  "PW03-M3-06_mpwkwf","PW03-M3-07_axfibm","PW03-M3-08_csm5hv",
  "PW03-W1-27_RAILWAY_CROSSING_WITH_GATES_g3a81z","PW03-W1-23_RIGHT_TURN_AND_LEFT_TURN_zjnlj2",
  "PW03-W1-02_RIGHT_BEND_dhepeo","PW03-W1-30_STEEP_DESCENT_amzk4b","PW03-W1-01_DENGERS_hiwsf7",
  "PW03-W1-08_ROAD_JUNCTION_ON_THE_LEFT_bhvzbb","PW03-W1-28_RAILWAY_CROSSING_WITHOUT_GATES_c4fbwz",
  "PW03-W1-26_RAILWAY_CROSSING_ON_LEFT_ROAD_yd5k8o","PW03-W1-07_ROAD_JUNCTION_ON_THE_RIGHT_xup5e9",
  "PW03-W1-19_CARRIAGE_WAY_NARROWS_ON_RHS_agrffp","PW03-W1-17_TWO-WAY_TRAFFIC_ZONE_hhfi8v",
  "PW03-W1-12_ROAD_JUNCTION_ON_THE_RIGHT_nq0wae","PW03-W1-11_ROAD_JUNCTION_ON_THE_LEFT_uam4lr",
  "PW03-W1-16_ROUND_ABOUT_zakjir","PW03-W1-36_ANIMALS_CROSSING_u3z763",
  "PW03-W1-39_FALLING_ROCKS_uddkdv","PW03-W1-32_BUMPY_ROAD_dl5gdj",
  "PW03-W1-40_LOOSE_STONES_epbg8i","PW03-W1-35_DISABLED_PEOPLE_CROSSING_AHEAD_zdf2r6",
  "PW03-P1-07_qxa5ie","PW03-P1-05_gypfr7","PW03-P1-08_bkoo28","PW03-P1-01_fyvjbq",
  "PW03-P1-10_dbg9ur","PW03-P1-03_xzdndo","PW03-P1-04_hdgd3p","PW03-P1-09_q2tzb9",
  "PW03-P1-06_y9zxlp","PW03-P1-02_zfr6sp","PW03-S1-17_qfotrc","PW03-S1-18_biq3iz",
  "PW03-S1-12_dly57n","PW03-S1-14_mkz5bc","PW03-S1-25_it0rzb","PW03-S1-15_jeh3rv",
  "PW03-S1-16_poiehb","PW03-S1-23_ggtxyg","PW03-S1-22_dh46md","PW03-S1-24_tcj5tn",
  "PW03-S1-11_zawjnj","PW03-S1-19_y9zk9d","PW03-S1-20_awnptd","PW03-S1-13_ozeo6v",
  "PW03-S1-09_wpfl0u","PW03-S1-06_ixv6rv","PW03-S1-21_briahg","PW03-S1-03_lbobkz",
  "PW03-S1-07_h93jnb","PW03-S1-02_azq91k","PW03-S1-01_trlk8t","PW03-S1-08_hmwmhd",
  "PW03-S1-04_g9l6yo","PW03-S1-10_ja2uva","PW03-L1-05_mdpbgp","PW03-S1-05_vmzapy",
  "PW03-L1-10_kl9eok","PW03-L1-09_lohurd","PW03-L1-11_kkolta","PW03-L1-01_ccwdzi",
  "PW03-L1-08_cgge6d","PW03-L1-04_oqxhj4","PW03-L1-06_erwj6j","PW03-L1-02_hpttc8",
  "PW03-L1-03_pwnfns","PW03-L1-07_vw9qr6","PW03-M1-01_dzoxx3","PW03-M1-02_x6wj38",
  "PW03-M1-04_qip1bi","PW03-M2-01_mabo1f","PW03-M2-03_ug6ar6","PW03-M2-02_nwuqro",
  "PW03-M2-04_yh2yyk","PW03-M2-06_gdv7g3","PW03-M2-08_i1ze0v","PW03-M2-05_nnxiz0",
  "PW03-M2-07_b6yaxq","PW03-M2-09_vqrn63","PW03-M2-10_yj02xk","PW03-M3-02_pwidsc",
  "PW03-M3-01_fesjlc","PW03-M2-11_mw8yj6","PW03-M3-06_b4yn1l","PW03-M3-03_hgdumi",
  "PW03-M3-04_xcgxat","PW03-M3-07_dcaum0","PW03-M3-05_k9ew4u",
];

console.log(`\n🗑️  Force-destroying ${KNOWN_BAD_IDS.length} known bad public_ids...`);
let forceDestroyed = 0;
for (const pid of KNOWN_BAD_IDS) {
  try {
    await cloudinary.uploader.destroy(pid, { resource_type: "image", invalidate: true });
    forceDestroyed++;
  } catch (_) {}
}
console.log(`  ✅ Force-destroyed: ${forceDestroyed}`);

console.log("\n✅ Done!\n");
