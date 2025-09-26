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
import { useState, useEffect } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";

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
  const markAsViewed = useMutation(api.tickets.markTicketAsViewed);

  // Check if current user owns this ticket or is an agent
  const canViewTicket = me && ticket && (
    (me.role === "customer" && ticket.customerId === me._id) ||
    me.role === "agent"
  );

  // Mark ticket as viewed when user visits the page
  useEffect(() => {
    if (me && ticket && canViewTicket) {
      markAsViewed({
        ticketId: ticket._id,
        userId: me._id,
      }).catch(console.error);
    }
  }, [me?._id, ticket?._id, canViewTicket, markAsViewed]);

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
    <PageLayout maxWidth="xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href={me.role === "customer" ? "/my-tickets" : "/"}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
        >
          ← Back to {me.role === "customer" ? "My Tickets" : "Dashboard"}
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Ticket Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <Card>
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

                {ticket.aiQuickResponse && ticket.aiQuickResponse.hasKnowledgeBaseMatch && ticket.aiQuickResponse.response && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center">
                      <span className="mr-2">🤖</span>
                      Quick Response (powered by AI)
                    </h4>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="text-gray-700 leading-relaxed mb-4 prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-800">
                        <ReactMarkdown>{ticket.aiQuickResponse.response}</ReactMarkdown>
                      </div>
                      
                      {ticket.aiQuickResponse.relevantDocs && ticket.aiQuickResponse.relevantDocs.length > 0 && (
                        <div className="border-t border-green-200 pt-4">
                          <h5 className="font-medium text-green-800 mb-2">📚 Referenced Documentation:</h5>
                          <div className="space-y-2">
                            {ticket.aiQuickResponse.relevantDocs.map((doc, index) => (
                              <div key={index} className="bg-white p-3 rounded border border-green-100">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h6 className="font-medium text-gray-900 text-sm">{doc.title}</h6>
                                    <p className="text-xs text-gray-600 mt-1">{doc.snippet}</p>
                                  </div>
                                  {doc.url && (
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-blue-600 hover:text-blue-800 text-xs flex items-center"
                                    >
                                      View Source
                                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {ticket.aiQuickResponse && !ticket.aiQuickResponse.hasKnowledgeBaseMatch && ticket.aiQuickResponse.escalatedToHighPriority && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center">
                      <span className="mr-2">⚡</span>
                      Priority Support Required
                    </h4>
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        Your ticket has been automatically escalated to <strong>high priority</strong> as it requires specialized attention from our support team. 
                        Our agents will review your request and provide a personalized response soon.
                      </p>
                      <div className="mt-3 flex items-center text-sm text-orange-700">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Expected response time: Within 4 hours
                      </div>
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
            <AISuggestions 
              suggestions={ticket.aiSuggestions}
              ticketId={ticketId}
              agentId={me._id}
              showSendButton={true}
              onCopyToManualReply={handleCopyToManualReply}
            />
          )}
        </div>

        {/* Right Column - Conversation and Message Input */}
        <div className="space-y-6">
          {/* Conversation Thread */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {!messages || messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">
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
                        className={`max-w-[85%] rounded-xl p-3 shadow-sm ${
                          message.messageType === "ai"
                            ? "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-gray-900"
                            : message.author?.role === "customer"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 border border-gray-200 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-xs">
                            {message.messageType === "ai" ? "🤖 AI" : message.author?.name || "Unknown"}
                          </span>
                          <Badge 
                            variant={message.messageType === "ai" ? "ai" : "outline"} 
                            className="text-xs px-1 py-0"
                          >
                            {message.messageType === "ai" ? "ai" : message.author?.role}
                          </Badge>
                          <span className="text-xs opacity-75 ml-auto">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <div className="prose prose-xs max-w-none prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-ul:text-inherit prose-ol:text-inherit prose-code:bg-black/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-inherit">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        {message.messageType === "ai" && (
                          <div className="mt-2 text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                            💡 AI generated
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
                <CardTitle className="text-lg">Add a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || isSubmitting}
                      className="px-4 py-2 text-sm"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
