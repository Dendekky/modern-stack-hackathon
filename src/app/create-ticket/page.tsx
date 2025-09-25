"use client";

import { TicketForm } from "@/components/TicketForm";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateTicketPage() {
  const { data: session } = authClient.useSession();
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to create a ticket</h1>
          <Link href="/">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!me || me.role !== "customer") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only customers can create support tickets.</p>
          <Link href="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create Support Ticket
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Describe your issue and we'll help you resolve it
              </p>
            </div>
            <Link href="/my-tickets">
              <Button variant="outline">
                ← Back to My Tickets
              </Button>
            </Link>
          </div>

          {/* Ticket Form */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Tell us about your issue</h2>
            </div>
            <TicketForm />
          </div>
        </div>
      </div>
    </main>
  );
}
