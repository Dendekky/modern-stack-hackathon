import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { nextCookies } from "better-auth/next-js";

// Ephemeral in-memory DB for hackathon/demo
const memoryDb: Record<string, any[]> = {};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  adapter: memoryAdapter(memoryDb),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: true,
  },
  user: {
    additionalFields: {
      role: { type: "string" },
      plan: { type: "string" },
    },
  },
});

export type Auth = typeof auth;


