"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/ui/page-layout";
import { AISuggestions } from "@/components/AISuggestions";
import { formatDate, formatStatus } from "@/lib/ui-utils";
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
        messageType: "human",
        isInternal: false,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToManualReply = (text: string) => {
    setNewMessage(text);
    // Scroll to the message input area
    const messageInput = document.querySelector('textarea');
    if (messageInput) {
      messageInput.scrollIntoView({ behavior: 'smooth' });
      messageInput.focus();
    }
  };

  if (!session) {
    return (
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view this ticket</h1>
          <Link href="/">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (!canViewTicket) {
    return (
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to view this ticket.
          </p>
          <Link href={me?.role === "customer" ? "/my-tickets" : "/"}>
            <Button>Go Back</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (!ticket) {
    return (
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
          <Link href={me?.role === "customer" ? "/my-tickets" : "/"}>
            <Button>Go Back</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }


  return (
    <PageLayout maxWidth="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href={me.role === "customer" ? "/my-tickets" : "/"}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
        >
          ← Back to {me.role === "customer" ? "My Tickets" : "Dashboard"}
        </Link>
      </div>

      {/* Ticket Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-4">{ticket.title}</CardTitle>
              <div className="flex gap-2 flex-wrap mb-4">
                <Badge variant={ticket.status as any} className="text-sm">
                  {formatStatus(ticket.status)}
                </Badge>
                <Badge variant={ticket.priority as any} className="text-sm">
                  {ticket.priority} priority
                </Badge>
                {ticket.category && (
                  <Badge variant="outline" className="text-sm">
                    {ticket.category}
                  </Badge>
                )}
                {ticket.isVoiceTicket && (
                  <Badge variant="voice" className="text-sm">
                    🎤 Voice Ticket
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
            </div>
            
            {ticket.voiceTranscript && (
              <div>
                <h4 className="font-semibold text-lg mb-3">Voice Transcript</h4>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <p className="text-gray-700 italic leading-relaxed">{ticket.voiceTranscript}</p>
                </div>
              </div>
            )}

            {ticket.aiSummary && (
              <div>
                <h4 className="font-semibold text-lg mb-3">AI Summary</h4>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{ticket.aiSummary}</p>
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
        <div className="mb-6">
          <AISuggestions 
            suggestions={ticket.aiSuggestions}
            ticketId={ticketId}
            agentId={me._id}
            showSendButton={true}
            onCopyToManualReply={handleCopyToManualReply}
          />
        </div>
      )}

      {/* Conversation Thread */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!messages || messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">
                  No messages yet. Start the conversation below!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.author?.role === "customer" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-xl p-4 shadow-sm ${
                      message.messageType === "ai"
                        ? "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-gray-900"
                        : message.author?.role === "customer"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 border border-gray-200 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-sm">
                        {message.messageType === "ai" ? "🤖 AI Assistant" : message.author?.name || "Unknown User"}
                      </span>
                      <Badge 
                        variant={message.messageType === "ai" ? "ai" : "outline"} 
                        className="text-xs"
                      >
                        {message.messageType === "ai" ? "ai" : message.author?.role}
                      </Badge>
                      <span className="text-xs opacity-75 ml-auto">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    {message.messageType === "ai" && (
                      <div className="mt-3 text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded-lg">
                        💡 This response was generated by AI and sent by an agent
                      </div>
                    )}
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
            <CardTitle className="text-xl">Add a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitMessage} className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || isSubmitting}
                  className="px-6"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
