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
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Ticket } from "@/types";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter tickets based on selected filters and search - moved before early returns to satisfy hooks rules
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    
    return tickets.filter((ticket) => {
      const statusMatch = statusFilter === "all" || ticket.status === statusFilter;
      const priorityMatch = priorityFilter === "all" || ticket.priority === priorityFilter;
      
      let searchMatch = true;
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        searchMatch = 
          ticket.title.toLowerCase().includes(searchTerm) ||
          ticket.description.toLowerCase().includes(searchTerm) ||
          (ticket.category?.toLowerCase().includes(searchTerm) ?? false);
      }
      
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [tickets, statusFilter, priorityFilter, searchQuery]);

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
                { label: "Active", count: tickets.filter((t) => t.status === "open" || t.status === "in_progress").length, color: "bg-orange-50 text-orange-700", icon: "⚡" },
                { label: "Resolved", count: tickets.filter((t) => t.status === "resolved").length, color: "bg-green-50 text-green-700", icon: "✅" },
                { label: "Closed", count: tickets.filter((t) => t.status === "closed").length, color: "bg-gray-50 text-gray-700", icon: "📁" }
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

          {/* Search and Filters */}
          <Card className="mb-6 border-gray-200/60 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search tickets by title, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              {/* Filters */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32 bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600">Priority</label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-32 bg-white border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(statusFilter !== "all" || priorityFilter !== "all" || searchQuery.trim() !== "") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setStatusFilter("all");
                        setPriorityFilter("all");
                        setSearchQuery("");
                      }}
                      className="text-xs"
                    >
                      Clear All
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
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4 pb-4">
                {filteredTickets.map((ticket) => (
                  <TicketCard 
                    key={ticket._id}
                    ticket={ticket}
                  />
                ))}
                
                {/* Show loading indicator if searching */}
                {searchQuery.trim() && filteredTickets.length === 0 && tickets && tickets.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tickets match your search criteria.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </PageLayout>
    </div>
  );
}
