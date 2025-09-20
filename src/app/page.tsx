import { TicketForm } from "@/components/TicketForm";
import { TicketDashboard } from "@/components/TicketDashboard";
import { DemoSetup } from "@/components/DemoSetup";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Support Ticketing System
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            AI-powered customer support with real-time updates and voice capabilities
          </p>
        </div>
        
        <div className="mb-6">
          <DemoSetup />
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Customer Portal</h2>
            <TicketForm />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Agent Dashboard</h2>
            <TicketDashboard />
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
            <span className="text-green-800 font-medium">
              ✅ Project Status: Basic ticketing system with Convex backend ready!
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
