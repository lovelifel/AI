import { config } from "dotenv";
import { betterAuth } from "better-auth";
import { authOptions } from "./src/lib/auth-options";

config({ path: ".env.local", quiet: true });

// CLI only: --adapter/--dialect generate table definitions without loading db.
export const auth = betterAuth({
  ...authOptions,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
