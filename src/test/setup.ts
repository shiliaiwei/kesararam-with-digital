// Test setup file
import { beforeAll, afterAll } from "vitest";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

beforeAll(() => {
  // Setup code before all tests
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }
});

afterAll(() => {
  // Cleanup code after all tests
});
