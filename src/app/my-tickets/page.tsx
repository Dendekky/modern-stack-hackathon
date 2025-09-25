"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/ui/page-layout";
import { PageHeader } from "@/components/ui/page-header";
import { TicketCard } from "@/components/ui/ticket-card";
import Link from "next/link";
import { useState } from "react";

export default function MyTicketsPage() {
  const { data: session } = authClient.useSession();
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );
  
  const tickets = useQuery(
    api.tickets.getCustomerTickets,
    me ? { customerId: me._id } : ("skip" as any)
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  if (!session) {
    return (
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your tickets</h1>
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
          <p className="text-gray-600 mb-4">This page is only available to customers.</p>
          <Link href="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Filter tickets based on selected filters
  const filteredTickets = tickets?.filter(ticket => {
    const statusMatch = statusFilter === "all" || ticket.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  }) || [];

  return (
    <PageLayout>
      <PageHeader 
        title="My Support Tickets"
        description="Track and manage your support requests"
      >
        <Link href="/create-ticket">
          <Button variant="outline">
            Create New Ticket
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-4">
              {tickets?.length === 0 
                ? "You haven't created any support tickets yet." 
                : "No tickets match your current filters."}
            </p>
            <Link href="/create-ticket">
              <Button>Create Your First Ticket</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <TicketCard 
              key={ticket._id}
              ticket={ticket}
              actions={
                <Link href={`/ticket/${ticket._id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              }
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {tickets && tickets.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tickets.length}
                </div>
                <div className="text-sm text-gray-600">Total Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.status === "open" || t.status === "in_progress").length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.status === "resolved").length}
                </div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {tickets.filter(t => t.status === "closed").length}
                </div>
                <div className="text-sm text-gray-600">Closed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
