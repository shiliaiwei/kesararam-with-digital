import { db } from "./src/lib/db";
import { topics } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const all = await db.select().from(topics);
  console.log("Topics with images:", all.filter(t => t.primaryImageUrl).map(t => ({ id: t.id, name: t.nameEn, img: t.primaryImageUrl })));
  console.log("Topics without images:", all.filter(t => !t.primaryImageUrl).map(t => ({ id: t.id, name: t.nameEn })));
}
run();
