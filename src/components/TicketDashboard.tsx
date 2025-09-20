"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketStatusUpdater } from "./TicketStatusUpdater";
import { AISuggestions } from "./AISuggestions";

export function TicketDashboard() {
  const tickets = useQuery(api.tickets.getAllTickets);

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

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Agent Dashboard</CardTitle>
          <CardDescription>
            Manage and respond to customer support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tickets found. Create a ticket to get started!
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                      <p className="text-gray-600 mb-2">{ticket.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Customer: {ticket.customer?.name || 'Unknown'}</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.assignedAgent && (
                          <span>Assigned: {ticket.assignedAgent.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : ticket.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : ticket.status === 'resolved'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : ticket.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : ticket.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {ticket.priority.toUpperCase()}
                      </span>
                      {ticket.isVoiceTicket && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          🎤 VOICE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <AISuggestions 
                    suggestions={ticket.aiSuggestions}
                    isLoading={!ticket.aiSuggestions}
                  />
                  
                  <div className="flex justify-end">
                    <TicketStatusUpdater
                      ticketId={ticket._id}
                      currentStatus={ticket.status}
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
