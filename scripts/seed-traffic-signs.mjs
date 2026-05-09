import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";
import { trafficSigns, users } from "../src/db/schema/index.ts";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

const sampleSigns = [
  {
    titleEn: "Stop Sign",
    titleKm: "សញ្ញាឈប់",
    descriptionEn: "A red octagonal sign that requires drivers to come to a complete stop before proceeding. Drivers must yield to pedestrians and other vehicles.",
    descriptionKm: "សញ្ញាពណ៌ក្រហមរាងប្រាំបីជ្រុង ដែលតម្រូវឱ្យអ្នកបើកបរឈប់ពេញលេញមុនពេលបន្ត។ អ្នកបើកបរត្រូវផ្តល់ផ្លូវដល់អ្នកថ្មើរជើង និងយានយន្តផ្សេងទៀត។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/v1/traffic-signs/stop-sign",
    signType: "regulatory",
    category: "mandatory",
  },
  {
    titleEn: "Speed Limit 40",
    titleKm: "កំណត់ល្បឿន ៤០",
    descriptionEn: "Maximum speed limit of 40 km/h. Drivers must not exceed this speed in the designated area.",
    descriptionKm: "កំណត់ល្បឿនអតិបរមា ៤០ គីឡូម៉ែត្រក្នុងមួយម៉ោង។ អ្នកបើកបរមិនត្រូវលើសល្បឿននេះក្នុងតំបន់កំណត់។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/v1/traffic-signs/speed-40",
    signType: "regulatory",
    category: "speed",
  },
  {
    titleEn: "No Entry",
    titleKm: "ហាមចូល",
    descriptionEn: "Entry is prohibited for all vehicles. This sign indicates a one-way street or restricted area.",
    descriptionKm: "ហាមចូលសម្រាប់យានយន្តទាំងអស់។ សញ្ញានេះបង្ហាញពីផ្លូវតែមួយទិស ឬតំបន់ដែលមានការរឹតបន្តឹង។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/v1/traffic-signs/no-entry",
    signType: "regulatory",
    category: "prohibition",
  },
  {
    titleEn: "Pedestrian Crossing",
    titleKm: "ចំណុចឆ្លងកាត់អ្នកថ្មើរជើង",
    descriptionEn: "Warning sign indicating a pedestrian crossing ahead. Drivers must slow down and yield to pedestrians.",
    descriptionKm: "សញ្ញាព្រមានបង្ហាញពីចំណុចឆ្លងកាត់អ្នកថ្មើរជើងនៅខាងមុខ។ អ្នកបើកបរត្រូវបន្ថយល្បឿន និងផ្តល់ផ្លូវដល់អ្នកថ្មើរជើង។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/v1/traffic-signs/pedestrian-crossing",
    signType: "warning",
    category: "pedestrian",
  },
  {
    titleEn: "Sharp Curve Ahead",
    titleKm: "ផ្លូវកោងស្រួចនៅខាងមុខ",
    descriptionEn: "Warning of a sharp curve ahead. Drivers should reduce speed and proceed with caution.",
    descriptionKm: "ព្រមានអំពីផ្លូវកោងស្រួចនៅខាងមុខ។ អ្នកបើកបរគួរបន្ថយល្បឿន និងបន្តដោយប្រុងប្រយ័ត្ន។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/v1/traffic-signs/sharp-curve",
    signType: "warning",
    category: "curve",
  },
  {
    titleEn: "Hospital",
    titleKm: "មន្ទីរពេទ្យ",
    descriptionEn: "Informational sign indicating a hospital nearby. Drivers should maintain quiet and reduce speed.",
    descriptionKm: "សញ្ញាព័ត៌មានបង្ហាញពីមន្ទីរពេទ្យនៅក្បែរ។ អ្នកបើកបរគួររក្សាភាពស្ងប់ស្ងាត់ និងបន្ថយល្បឿន។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/v1/traffic-signs/hospital",
    signType: "informational",
    category: "facility",
  },
  {
    titleEn: "Parking",
    titleKm: "ចតយានយន្ត",
    descriptionEn: "Designated parking area. Vehicles may park in this zone following local regulations.",
    descriptionKm: "តំបន់ចតយានយន្តដែលបានកំណត់។ យានយន្តអាចចតក្នុងតំបន់នេះតាមបទប្បញ្ញត្តិមូលដ្ឋាន។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/v1/traffic-signs/parking",
    signType: "informational",
    category: "parking",
  },
  {
    titleEn: "Direction to Phnom Penh",
    titleKm: "ទិសដៅទៅភ្នំពេញ",
    descriptionEn: "Guide sign showing direction to Phnom Penh. Follow the arrow for the indicated destination.",
    descriptionKm: "សញ្ញាណែនាំបង្ហាញទិសដៅទៅភ្នំពេញ។ តាមព្រួញសម្រាប់គោលដៅដែលបានបង្ហាញ។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/v1/traffic-signs/direction-pp",
    signType: "guide",
    category: "direction",
  },
];

async function seedTrafficSigns() {
  console.log("Seeding traffic signs...");

  try {
    // Find an admin user to set as creator
    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);

    if (!admin) {
      console.log("⚠️  No admin user found. Creating signs without creator.");
    }

    for (const sign of sampleSigns) {
      const [created] = await db
        .insert(trafficSigns)
        .values({
          ...sign,
          status: "approved", // Auto-approve sample data
          isActive: true,
          createdBy: admin?.id || null,
          approvedBy: admin?.id || null,
          approvedAt: new Date(),
        })
        .returning();

      console.log(`✓ Created: ${created.titleEn}`);
    }

    console.log(`\n✅ Successfully seeded ${sampleSigns.length} traffic signs!`);
  } catch (error) {
    console.error("❌ Error seeding traffic signs:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

seedTrafficSigns();
