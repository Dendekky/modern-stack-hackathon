"use client";

import { authClient } from "@/lib/auth-client";

export function AuthHeader() {
  const { data: session, isPending } = authClient.useSession();

  // Only show when not signed in
  if (session) return null;

  return (
    <header className="border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Support Ticketing System</div>
        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-sm text-gray-500">Checking session...</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Please sign in below</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


