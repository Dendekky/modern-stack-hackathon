"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/ui/page-layout";
import { AISuggestions } from "@/components/AISuggestions";
import { TicketDetailSkeleton } from "@/components/skeletons/TicketDetailSkeleton";
import { formatDate, formatStatus } from "@/lib/ui-utils";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";

interface TicketDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const [ticketId, setTicketId] = useState<Id<"tickets"> | null>(null);
  const { data: session } = authClient.useSession();
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Resolve the async params
  useEffect(() => {
    params.then(({ id }) => {
      setTicketId(id as Id<"tickets">);
    });
  }, [params]);
  
  const me = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : ("skip" as any)
  );
  
  const ticket = useQuery(api.tickets.getTicketById, ticketId ? { ticketId } : "skip");
  const messages = useQuery(api.tickets.getMessagesForTicket, ticketId ? { ticketId } : "skip");
  const addMessage = useMutation(api.tickets.addMessage);
  const markAsViewed = useMutation(api.tickets.markTicketAsViewed);

  // Check if current user owns this ticket or is an agent
  const canViewTicket = me && ticket && (
    (me.role === "customer" && ticket.customerId === me._id) ||
    me.role === "agent"
  );

  // Mark ticket as viewed when user visits the page
  useEffect(() => {
    if (me?._id && ticket?._id && canViewTicket) {
      markAsViewed({
        ticketId: ticket._id,
        userId: me._id,
      }).catch(console.error);
    }
  }, [me?._id, ticket?._id, canViewTicket, markAsViewed]);

  // Auto-scroll conversation to bottom when messages change
  useEffect(() => {
    if (conversationRef.current && messages && messages.length > 0) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !me || isSubmitting || !ticketId) return;
    
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

  // Relative time formatting function
  const formatRelativeTime = (date: string | number) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Same day - show time only
    if (diffDays === 0) {
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Yesterday
    if (diffDays === 1) {
      return `Yesterday ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // This year - show month/day and time
    if (messageDate.getFullYear() === now.getFullYear()) {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Different year - show full date
    return messageDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) +
           ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Show loading while resolving params
  if (!ticketId) {
    return <TicketDetailSkeleton />;
  }

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

  // Show loading state while fetching user data (needed to check canViewTicket)
  if (me === undefined) {
    return <TicketDetailSkeleton />;
  }

  if (!canViewTicket) {
    return (
      <PageLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to view this ticket.
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
                    <div className="bg-green-50 border border-green-200 rounded-lg max-h-[25.8rem] overflow-y-auto">
                      <div className="p-4">
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
              <div ref={conversationRef} className="min-h-96 max-h-96 overflow-y-auto py-2">
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
                  messages.map((message) => {
                    // For agents, flip the layout: customer on left, agent on right
                    const isCustomerMessage = message.author?.role === "customer";
                    const shouldJustifyEnd = me?.role === "agent" ? !isCustomerMessage : isCustomerMessage;
                    const isAIMessage = message.messageType === "ai";
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex flex-col ${shouldJustifyEnd ? "items-end mr-4" : "items-start"} mb-4 ${!shouldJustifyEnd ? "pr-8" : ""}`}
                      >
                        {/* Message bubble with optional agent indicator */}
                        <div className={`flex items-end gap-2 ${shouldJustifyEnd ? "flex-row-reverse" : ""}`}>
                          {/* Agent indicator - only show for agent messages */}
                          {!isCustomerMessage && !isAIMessage && (
                            <div className="w-6 h-6 bg-gray-600 text-white text-xs font-medium flex items-center justify-center rounded-full flex-shrink-0 mb-1">
                              A
                            </div>
                          )}
                          
                          {/* AI indicator */}
                          {isAIMessage && (
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium flex items-center justify-center rounded-full flex-shrink-0 mb-1">
                              🤖
                            </div>
                          )}
                          
                          {/* Message bubble */}
                          <div
                            className={`max-w-[100%] rounded-2xl px-4 py-3 shadow-sm ${
                              isAIMessage
                                ? "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-gray-900"
                                : isCustomerMessage
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-gray-100 border border-gray-200 text-gray-900 rounded-bl-md"
                            }`}
                          >
                            <div className="prose prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-ul:text-inherit prose-ol:text-inherit prose-code:bg-black/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-inherit">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                        
                        {/* Timestamp below message */}
                        <div className={`text-xs text-gray-500 mt-1 px-2 ${shouldJustifyEnd ? "text-right" : "text-left"}`}>
                          {formatRelativeTime(message.createdAt)}
                          {isAIMessage && (
                            <span className="ml-2 text-purple-600">• AI generated</span>
                          )}
                        </div>
                      </div>
                    );
                  })
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
