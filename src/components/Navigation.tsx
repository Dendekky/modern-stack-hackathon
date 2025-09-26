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
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <Link 
            href={me.role === "customer" ? "/my-tickets" : "/"} 
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Support Hub</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-sm text-right">
                  <div className="font-medium text-gray-900 truncate max-w-32">
                    {me.name || session.user?.email?.split('@')[0]}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize bg-gray-50">
                    {me.role}
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="hover:bg-gray-50 border-gray-300 text-gray-700 font-medium px-4 py-2"
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
