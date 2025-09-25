"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AuthHeader() {
  const { data: session, isPending } = authClient.useSession();
  const updateUserProfile = useMutation(api.users.updateUserProfile);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const ensureConvexUser = async (role: "customer" | "agent") => {
    if (!session?.user?.id) return;
    await updateUserProfile({
      userId: session.user.id,
      role,
      plan: "free",
    });
  };

  // No need to create users - Better Auth handles that automatically

  return (
    <header className="border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Support Ticketing System</div>
        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-sm text-gray-500">Checking session...</span>
          ) : session ? (
            <>
              <span className="text-sm text-gray-700">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="outline"
                onClick={() => ensureConvexUser("customer")}
              >
                Customer role
              </Button>
              <Button
                variant="outline"
                onClick={() => ensureConvexUser("agent")}
              >
                Agent role
              </Button>
              <Button
                variant="secondary"
                onClick={() => authClient.signOut()}
              >
                Sign out
              </Button>
            </>
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


