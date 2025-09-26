"use client";
import { TicketForm } from "@/components/TicketForm";
import { TicketDashboard } from "@/components/TicketDashboard";
import { DemoSetup } from "@/components/DemoSetup";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { PageLayout } from "@/components/ui/page-layout";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );

  const isAgent = me?.role === "agent";

  // Redirect customers to their tickets dashboard
  useEffect(() => {
    if (me && me.role === "customer") {
      router.push("/my-tickets");
    }
  }, [me, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <PageLayout maxWidth="2xl">
        {/* Hero Section */}
        <div className="text-center py-16 mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Support System
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Support Ticketing
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience next-generation customer support with real-time updates, AI assistance, and voice capabilities.
          </p>
        </div>

        {/* Demo Setup */}
        <div className="mb-16">
          <DemoSetup />
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {isAgent ? (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Agent Dashboard</h2>
                <p className="text-gray-600 text-lg">Manage and respond to customer support tickets</p>
              </div>
              <TicketDashboard />
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Create Support Ticket</h2>
                <p className="text-gray-600 text-lg">Get help from our support team</p>
              </div>
              <TicketForm />
            </div>
          )}

          {/* Knowledge Base Section */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Knowledge Base</h2>
              <p className="text-gray-600 text-lg">Find answers to common questions</p>
            </div>
            <KnowledgeBase />
          </div>
        </div>

        {/* Status Footer */}
        <div className="text-center py-16 mt-24">
          <div className="inline-flex items-center px-6 py-3 bg-white border border-green-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-gray-700 font-medium">
              System Status: All services operational
            </span>
          </div>
        </div>
      </PageLayout>
    </div>
  )
}
