"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

interface TicketDetailPageProps {
  params: {
    id: string;
  };
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const ticketId = params.id as Id<"tickets">;
  const { data: session } = authClient.useSession();
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );
  
  const ticket = useQuery(api.tickets.getTicketById, { ticketId });
  const messages = useQuery(api.tickets.getMessagesForTicket, { ticketId });
  const addMessage = useMutation(api.tickets.addMessage);

  // Check if current user owns this ticket or is an agent
  const canViewTicket = me && ticket && (
    (me.role === "customer" && ticket.customerId === me._id) ||
    me.role === "agent"
  );

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !me || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addMessage({
        ticketId,
        authorId: me._id,
        content: newMessage.trim(),
        isInternal: false,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view this ticket</h1>
          <Link href="/">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!canViewTicket) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to view this ticket.
          </p>
          <Link href={me?.role === "customer" ? "/my-tickets" : "/"}>
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
          <Link href={me?.role === "customer" ? "/my-tickets" : "/"}>
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href={me.role === "customer" ? "/my-tickets" : "/"}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to {me.role === "customer" ? "My Tickets" : "Dashboard"}
            </Link>
          </div>

          {/* Ticket Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-3">{ticket.title}</CardTitle>
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority} priority
                    </span>
                    {ticket.category && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {ticket.category}
                      </span>
                    )}
                    {ticket.isVoiceTicket && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
                        🎤 Voice Ticket
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
                
                {ticket.voiceTranscript && (
                  <div>
                    <h4 className="font-semibold mb-2">Voice Transcript</h4>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-700 italic">{ticket.voiceTranscript}</p>
                    </div>
                  </div>
                )}

                {ticket.aiSummary && (
                  <div>
                    <h4 className="font-semibold mb-2">AI Summary</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700">{ticket.aiSummary}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-6 text-sm text-gray-600 pt-4 border-t">
                  <span>Created: {formatDate(ticket.createdAt)}</span>
                  <span>Last Updated: {formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions (for agents) */}
          {me.role === "agent" && ticket.aiSuggestions && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🤖 AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticket.aiSuggestions.suggestedReply && (
                    <div>
                      <h4 className="font-semibold mb-2">Suggested Reply</h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {ticket.aiSuggestions.suggestedReply}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {ticket.aiSuggestions.relevantDocs && ticket.aiSuggestions.relevantDocs.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Relevant Documentation</h4>
                      <div className="space-y-2">
                        {ticket.aiSuggestions.relevantDocs.map((doc, index) => (
                          <div key={index} className="bg-yellow-50 p-3 rounded">
                            <p className="text-sm text-gray-700">{doc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Thread */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!messages || messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No messages yet. Start the conversation below!
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.author?.role === "customer" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          message.author?.role === "customer"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">
                            {message.author?.name || "Unknown User"}
                          </span>
                          <span className="text-xs opacity-75">
                            ({message.author?.role})
                          </span>
                          <span className="text-xs opacity-75">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Input (only if ticket is not closed) */}
          {ticket.status !== "closed" && (
            <Card>
              <CardHeader>
                <CardTitle>Add a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-3 py-2 border rounded-lg resize-none h-24"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!newMessage.trim() || isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
