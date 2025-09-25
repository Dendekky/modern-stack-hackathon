"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const navLinks = me.role === "customer" 
    ? [
        { href: "/my-tickets", label: "My Tickets" },
        { href: "/create-ticket", label: "Create Ticket" }
      ]
    : [
        { href: "/", label: "Dashboard" }
      ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link 
            href={me.role === "customer" ? "/my-tickets" : "/"} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Support Tickets</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-right">
                <div className="font-medium text-gray-900 truncate max-w-32">
                  {me.name || session.user?.email}
                </div>
                <Badge variant="outline" className="text-xs">
                  {me.role}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="hover:bg-gray-100"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
