import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf-8");
let DATABASE_URL = "";
for (const line of envContent.split("\n")) {
    const m = line.match(/^DATABASE_URL='?([^']+)'?/);
    if (m) { DATABASE_URL = m[1]; break; }
}
const sql = neon(DATABASE_URL);

function cleanText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function parseFirstVehicle(descEn: string, descKm: string) {
  const enClean = descEn.replace(/\s+/g, " ").trim().toLowerCase();
  const kmClean = descKm.replace(/\s+/g, " ").trim();

  let firstEn = "";
  let firstKm = "";

  const toEnDigit = (ch: string) => {
    const map: Record<string, string> = { "០": "0", "១": "1", "២": "2", "៣": "3", "៤": "4", "៥": "5", "៦": "6", "៧": "7", "៨": "8", "៩": "9" };
    return map[ch] || ch;
  };
  const toKhDigit = (numStr: string) => {
    const map: Record<string, string> = { "0": "០", "1": "១", "2": "២", "3": "៣", "4": "៤", "5": "៥", "6": "៦", "7": "៧", "8": "៨", "9": "៩" };
    return String(numStr).split("").map(c => map[c] || c).join("");
  };

  // EN parsing: look for first mentioned vehicles/numbers
  // Check for dual/plural first that contains "and" at the beginning of the sentence
  const dualEnMatch = enClean.match(/^(?:the\s+answer\s+is:?\s+)?(?:first\s+)?(?:vehicles?|motorcycles?|numbers?|number)?\s*(\d)\s*(?:and|&)\s*(?:vehicles?|motorcycles?|numbers?|number)?\s*(\d)/i);
  if (dualEnMatch) {
    firstEn = `Vehicle ${dualEnMatch[1]} and Vehicle ${dualEnMatch[2]}`;
  } else {
    // Look for single
    const singleEnMatch = enClean.match(/(?:first|number|vehicle|motorcycle|departs|goes)\s*(\d+)/i);
    const singleEnMatch2 = enClean.match(/(\d+)\s*(?:departs|goes|leaves|first)/i);
    if (singleEnMatch) {
      firstEn = `Vehicle ${singleEnMatch[1]}`;
    } else if (singleEnMatch2) {
      firstEn = `Vehicle ${singleEnMatch2[1]}`;
    } else {
      firstEn = `Vehicle 1`;
    }
  }

  // KM parsing: look for first mentioned vehicles
  const dualKmMatch = kmClean.match(/^(?:ចម្លើយគឺ\s+)?(?:លេខ)?\s*([១-៩\d])\s*និង\s*(?:លេខ)?\s*([១-៩\d])/);
  if (dualKmMatch) {
    const d1 = toEnDigit(dualKmMatch[1]);
    const d2 = toEnDigit(dualKmMatch[2]);
    firstKm = `លេខ ${toKhDigit(d1)} និង លេខ ${toKhDigit(d2)}`;
  } else {
    const singleKmMatch = kmClean.match(/លេខ\s*([១-៩\d]+)/);
    if (singleKmMatch) {
      const d = toEnDigit(singleKmMatch[1]);
      firstKm = `លេខ ${toKhDigit(d)}`;
    } else {
      firstKm = `លេខ ១`;
    }
  }

  return { firstEn, firstKm };
}

async function main() {
  const topics = await sql`
    SELECT t.id, t.topic_code, t.description_en, t.description_km
    FROM topics t JOIN categories c ON c.id=t.category_id
    WHERE c.slug = 'priority' ORDER BY t.sort_order, t.id
  `;
  for (const t of topics) {
    const { firstEn, firstKm } = parseFirstVehicle(t.description_en, t.description_km);
    console.log(`${t.topic_code}:`);
    console.log(`  Orig EN: ${cleanText(t.description_en)}`);
    console.log(`  Parsed First EN: ${firstEn}`);
    console.log(`  Orig KM: ${cleanText(t.description_km)}`);
    console.log(`  Parsed First KM: ${firstKm}`);
    console.log("---");
  }
}

main().catch(console.error);
