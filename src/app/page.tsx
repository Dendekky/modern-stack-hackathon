import { TicketForm } from "@/components/TicketForm";
import { TicketDashboard } from "@/components/TicketDashboard";
import { DemoSetup } from "@/components/DemoSetup";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
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
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Customer Portal</h2>
              </div>
              <TicketForm />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">2</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Agent Dashboard</h2>
              </div>
              <TicketDashboard />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg">
              <span className="mr-2">✅</span>
              <span className="font-medium">
                Project Status: Basic ticketing system with Convex backend ready!
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
