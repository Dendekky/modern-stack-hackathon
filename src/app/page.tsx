"use client";
import { TicketForm } from "@/components/TicketForm";
import { TicketDashboard } from "@/components/TicketDashboard";
import { DemoSetup } from "@/components/DemoSetup";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { PageLayout } from "@/components/ui/page-layout";
import { PageHeader } from "@/components/ui/page-header";
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
    <PageLayout>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Support Ticketing System
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          AI-powered customer support with real-time updates and voice capabilities
        </p>
      </div>
      
      <div className="mb-8">
        <DemoSetup />
      </div>
      
      {isAgent ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">1</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Agent Dashboard</h2>
          </div>
          <TicketDashboard />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Customer Portal</h2>
          </div>
          <TicketForm />
        </div>
      )}
      
      <div className="mt-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-semibold">3</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Knowledge Base</h2>
        </div>
        <KnowledgeBase />
      </div>
      
      <div className="mt-12 text-center">
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg">
          <span className="mr-2">✅</span>
          <span className="font-medium">
            Project Status: AI-powered ticketing with Firecrawl knowledge base integration ready!
          </span>
        </div>
      </div>
    </PageLayout>
  )
}
