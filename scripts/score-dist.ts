import { config } from "dotenv"; config({ path: ".env.local" });
import { sql } from "../src/lib/db";
async function main(){
  const lp = await sql`SELECT COUNT(*)::int n, COALESCE(MAX(lifetime_points),0) mx, COALESCE(ROUND(AVG(NULLIF(lifetime_points,0))),0) avg_nonzero, COUNT(*) FILTER (WHERE lifetime_points>0)::int scoring FROM users WHERE role='student' AND is_active=true`;
  console.log("students:", lp[0]);
  const led = await sql`SELECT COUNT(*)::int plays, COALESCE(ROUND(AVG(points)),0) avg_pts, COALESCE(MAX(points),0) max_pts, COALESCE(MIN(points),0) min_pts FROM points_ledger`;
  console.log("live plays (pointsLedger):", led[0]);
  const byType = await sql`SELECT game_type, COUNT(*)::int plays, COALESCE(ROUND(AVG(points)),0) avg_pts FROM points_ledger GROUP BY game_type`;
  console.log("by gameType:", byType);
  process.exit(0);
}
main().catch(e=>{console.error(e);process.exit(1);});
