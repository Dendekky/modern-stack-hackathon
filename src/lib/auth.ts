import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { convexAdapter } from "./convex-auth-adapter";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key-change-in-production",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: convexAdapter,
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: { 
        type: "string",
        defaultValue: "customer"
      },
      plan: { 
        type: "string",
        defaultValue: "free"
      },
    },
  },
});

export type Auth = typeof auth;


