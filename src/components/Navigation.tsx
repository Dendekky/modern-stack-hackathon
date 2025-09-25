"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Navigation() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (!session || !me) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href={me.role === "customer" ? "/my-tickets" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Support Tickets</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {me.role === "customer" ? (
              <>
                <Link 
                  href="/my-tickets"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Tickets
                </Link>
                <Link 
                  href="/create-ticket"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Ticket
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              </>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{me.name || session.user?.email}</div>
                <div className="text-gray-500 capitalize">{me.role}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
