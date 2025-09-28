"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/ui/page-layout";
import { PageHeader } from "@/components/ui/page-header";
import { TicketCard } from "@/components/ui/ticket-card";
import { CreateTicketModal } from "@/components/CreateTicketModal";
import { DialogTrigger } from "@/components/ui/dialog";
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
    me ? { customerId: me._id, currentUserId: me._id } : ("skip" as any)
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <PageLayout maxWidth="2xl">
        <div className="py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              My Support Tickets
            </h1>
            <p className="text-lg text-gray-600">
              Track and manage your support requests
            </p>
          </div>

          {/* Quick Stats */}
          {tickets && tickets.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total", count: tickets.length, color: "bg-blue-50 text-blue-700", icon: "📊" },
                { label: "Active", count: tickets.filter(t => t.status === "open" || t.status === "in_progress").length, color: "bg-orange-50 text-orange-700", icon: "⚡" },
                { label: "Resolved", count: tickets.filter(t => t.status === "resolved").length, color: "bg-green-50 text-green-700", icon: "✅" },
                { label: "Closed", count: tickets.filter(t => t.status === "closed").length, color: "bg-gray-50 text-gray-700", icon: "📁" }
              ].map((stat) => (
                <Card key={stat.label} className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-gray-900 mb-1">{stat.count}</div>
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6 border-gray-200/60 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                  {(statusFilter !== "all" || priorityFilter !== "all") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setStatusFilter("all");
                        setPriorityFilter("all");
                      }}
                      className="text-xs"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                
                {/* Create New Ticket Button */}
                <CreateTicketModal 
                  open={isCreateModalOpen} 
                  onOpenChange={setIsCreateModalOpen}
                  trigger={
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Create New Ticket
                      </Button>
                    </DialogTrigger>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <Card className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tickets?.length === 0 ? "No tickets yet" : "No matching tickets"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {tickets?.length === 0 
                    ? "You haven't created any support tickets yet. Create your first ticket to get started." 
                    : "No tickets match your current filters. Try adjusting your filter criteria."}
                </p>
                {tickets?.length === 0 && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create Your First Ticket
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <TicketCard 
                  key={ticket._id}
                  ticket={ticket}
                  // actions={
                  //   <Link href={`/ticket/${ticket._id}`}>
                  //     <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                  //       View Details
                  //     </Button>
                  //   </Link>
                  // }
                />
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </div>
  );
}
