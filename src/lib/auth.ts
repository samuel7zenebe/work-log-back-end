import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import  {db} from "../db"; // your drizzle instance
import * as schema from "../db/schema"
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_APP_URL
      : process.env.DEVELOPMENT_APP_URL, // Your Hono server URL
  basePath: "/api/auth", // Default path for auth endpoints
  trustedOrigins: [
    "http://localhost:3000",
    "https://vercel-with-neon-postgres-indol-chi.vercel.app/",
  ], // Allow requests from Next.js origin
  secret: process.env.BETTER_AUTH_SECRET, // Use env var in prod
});
