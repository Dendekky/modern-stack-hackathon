"use client";

import { createAuthClient } from "better-auth/react";

const origin =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: `${origin}/api/auth`,
});


