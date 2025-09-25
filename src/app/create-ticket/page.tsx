"use client";

import { TicketForm } from "@/components/TicketForm";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PageLayout } from "@/components/ui/page-layout";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to create a ticket</h1>
          <Link href="/">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (!me || me.role !== "customer") {
    return (
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only customers can create support tickets.</p>
          <Link href="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="md">
      <PageHeader 
        title="Create Support Ticket"
        description="Describe your issue and we'll help you resolve it"
      >
        <Link href="/my-tickets">
          <Button variant="outline">
            ← Back to My Tickets
          </Button>
        </Link>
      </PageHeader>

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
    </PageLayout>
  );
}
