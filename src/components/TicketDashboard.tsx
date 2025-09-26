"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCard } from "@/components/ui/ticket-card";
import { Button } from "@/components/ui/button";
import { AISuggestions } from "./AISuggestions";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export function TicketDashboard() {
  const { data: session, isPending } = authClient.useSession();
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );
  const tickets = useQuery(
    api.tickets.getAllTickets,
    me?._id ? { currentUserId: me._id } : ("skip" as any)
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
    <div className="space-y-8">
      {tickets.length === 0 ? (
        <Card className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Tickets will appear here when customers create them. Get started by creating a test ticket.
            </p>
            <Link href="/create-ticket">
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                Create Test Ticket
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", count: tickets.length, color: "bg-blue-50 text-blue-700" },
              { label: "Open", count: tickets.filter(t => t.status === "open").length, color: "bg-orange-50 text-orange-700" },
              { label: "In Progress", count: tickets.filter(t => t.status === "in_progress").length, color: "bg-yellow-50 text-yellow-700" },
              { label: "Resolved", count: tickets.filter(t => t.status === "resolved").length, color: "bg-green-50 text-green-700" }
            ].map((stat) => (
              <Card key={stat.label} className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${stat.color}`}>
                    <span className="text-xl font-bold">{stat.count}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tickets Grid */}
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="space-y-4">
                <TicketCard 
                  ticket={ticket}
                  showCustomer={true}
                  showAgent={true}
                  showStatusDropdown={true}
                  actions={null}
                />
                
                {/* AI Suggestions */}
                <div className="ml-6">
                  <AISuggestions 
                    suggestions={ticket.aiSuggestions}
                    isLoading={!ticket.aiSuggestions}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
