"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { PageLayout } from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCard } from "@/components/ui/ticket-card";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Ticket } from "@/types";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );
  const tickets = useQuery(
    api.tickets.getAllTickets,
    me?._id ? { currentUserId: me._id } : ("skip" as any)
  );

  const [activeTab, setActiveTab] = useState<"tickets" | "knowledge">("tickets");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Knowledge Base state
  const [knowledgeSearchTerm, setKnowledgeSearchTerm] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);
  const [isScrapingPage, setIsScrapingPage] = useState(false);

  // Filter tickets based on search query - moved before early returns to satisfy hooks rules
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    
    if (!searchQuery.trim()) return tickets;
    
    const searchTerm = searchQuery.toLowerCase().trim();
    return tickets.filter((ticket) => 
      ticket.title.toLowerCase().includes(searchTerm) ||
      ticket.description.toLowerCase().includes(searchTerm) ||
      ticket.customer?.name?.toLowerCase().includes(searchTerm) ||
      ticket.assignedAgent?.name?.toLowerCase().includes(searchTerm) ||
      ticket.category?.toLowerCase().includes(searchTerm)
    );
  }, [tickets, searchQuery]);

  // Redirect non-agents away from dashboard
  useEffect(() => {
    if (me && me.role !== "agent") {
      router.push("/my-tickets");
    }
  }, [me, router]);

  if (!session) {
    return (
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access the dashboard</h1>
          <Link href="/">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Show loading state while fetching user data
  if (me === undefined) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading user data...</span>
        </div>
      </PageLayout>
    );
  }

  if (!me || me.role !== "agent") {
    return (
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This dashboard is only available to agents.</p>
          <Link href="/my-tickets">
            <Button>Go to My Tickets</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (tickets === undefined) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading dashboard...</span>
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
              Agent Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage and respond to customer support tickets
            </p>
          </div>

          {/* Quick Stats */}
          {tickets && tickets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total", count: tickets.length, color: "bg-blue-50 text-blue-700", icon: "📊" },
                { label: "Open", count: tickets.filter((t) => t.status === "open").length, color: "bg-orange-50 text-orange-700", icon: "🔓" },
                { label: "In Progress", count: tickets.filter((t) => t.status === "in_progress").length, color: "bg-yellow-50 text-yellow-700", icon: "⚡" },
                { label: "Resolved", count: tickets.filter((t) => t.status === "resolved").length, color: "bg-green-50 text-green-700", icon: "✅" }
              ].map((stat) => (
                <Card key={stat.label} className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.count}</div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "tickets"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Support Tickets
                  {tickets && tickets.length > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                      {searchQuery.trim() ? filteredTickets.length : tickets.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("knowledge")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "knowledge"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Knowledge Base
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "tickets" ? (
            <div className="space-y-6">
              {/* Search Bar for Tickets */}
              {tickets && tickets.length > 0 && (
                <Card className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search tickets by title, description, customer, agent, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    {searchQuery.trim() && (
                      <div className="mt-2 text-sm text-gray-600">
                        Showing {filteredTickets.length} of {tickets.length} tickets
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {!tickets || tickets.length === 0 ? (
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
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4 pb-4">
                    {filteredTickets.map((ticket) => (
                      <TicketCard 
                        key={ticket._id}
                        ticket={ticket}
                        showCustomer={true}
                        showAgent={true}
                        showStatusDropdown={true}
                        actions={null}
                      />
                    ))}
                    
                    {/* Show message when search returns no results */}
                    {searchQuery.trim() && filteredTickets.length === 0 && tickets && tickets.length > 0 && (
                      <Card className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
                        <CardContent className="text-center py-16">
                          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No matching tickets</h3>
                          <p className="text-gray-600 mb-4">
                            No tickets match your search criteria. Try adjusting your search terms.
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => setSearchQuery("")}
                            className="text-sm"
                          >
                            Clear Search
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            <div>
              <KnowledgeBase 
                searchTerm={knowledgeSearchTerm}
                setSearchTerm={setKnowledgeSearchTerm}
                websiteUrl={websiteUrl}
                setWebsiteUrl={setWebsiteUrl}
                pageUrl={pageUrl}
                setPageUrl={setPageUrl}
                scrapeResult={scrapeResult}
                setScrapeResult={setScrapeResult}
                isScrapingWebsite={isScrapingWebsite}
                setIsScrapingWebsite={setIsScrapingWebsite}
                isScrapingPage={isScrapingPage}
                setIsScrapingPage={setIsScrapingPage}
              />
            </div>
          )}
        </div>
      </PageLayout>
    </div>
  );
}
