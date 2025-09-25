"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCard } from "@/components/ui/ticket-card";
import { Button } from "@/components/ui/button";
import { TicketStatusUpdater } from "./TicketStatusUpdater";
import { AISuggestions } from "./AISuggestions";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export function TicketDashboard() {
  const tickets = useQuery(api.tickets.getAllTickets);
  const { data: session, isPending } = authClient.useSession();
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );

  if (tickets === undefined) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading tickets...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isPending && me !== undefined) {
    const isAgent = me?.role === "agent";
    if (!isAgent) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Agent Dashboard</CardTitle>
            <CardDescription>Agents only. Sign in as an agent to view tickets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 text-sm">Access denied</div>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Agent Dashboard</CardTitle>
          <CardDescription className="text-lg">
            Manage and respond to customer support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600 mb-6">Tickets will appear here when customers create them.</p>
              <Link href="/create-ticket">
                <Button variant="outline">Create Test Ticket</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="space-y-4">
                  <TicketCard 
                    ticket={ticket}
                    showCustomer={true}
                    showAgent={true}
                    actions={
                      <div className="flex flex-col gap-2">
                        <Link href={`/ticket/${ticket._id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <TicketStatusUpdater
                          ticketId={ticket._id}
                          currentStatus={ticket.status}
                        />
                      </div>
                    }
                  />
                  
                  <div className="ml-6">
                    <AISuggestions 
                      suggestions={ticket.aiSuggestions}
                      isLoading={!ticket.aiSuggestions}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
