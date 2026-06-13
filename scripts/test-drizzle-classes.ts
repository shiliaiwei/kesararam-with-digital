import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { classes } from "../src/db/schema";

async function run() {
  try {
    const allCls = await db.select().from(classes).limit(1);
    console.log("Drizzle select succeeded:", allCls);
  } catch (err) {
    console.error("Drizzle select failed:", err);
  }
}
run();
