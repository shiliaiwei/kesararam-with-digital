import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getUserActiveSubscription } from "../src/db/queries/subscriptions.ts";
import { getSubscriptionDisplayInfo } from "../src/lib/subscription-utils.ts";

async function run() {
  try {
    console.log("Calling getUserActiveSubscription(18)...");
    const sub = await getUserActiveSubscription(18);
    console.log("RESULT sub:", JSON.stringify(sub, null, 2));

    console.log("Calling getSubscriptionDisplayInfo(18)...");
    const info = await getSubscriptionDisplayInfo(18);
    console.log("RESULT info:", JSON.stringify(info, null, 2));
  } catch (err) {
    console.error("ERROR EXECUTING QUERIES:", err);
  }
  process.exit(0);
}

run();
