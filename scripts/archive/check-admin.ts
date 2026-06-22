import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  await sql`UPDATE users SET login_attempts = 0, locked_until = NULL WHERE username = 'vi'`;
  console.log("Reset login_attempts for vi");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
