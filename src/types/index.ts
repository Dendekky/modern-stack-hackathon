// Database types based on Convex schema
export type UserRole = "customer" | "agent";
export type UserPlan = "free" | "pro";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface User {
  _id: string;
  email?: string;
  name?: string | null;
  role?: UserRole | null;
  plan?: UserPlan | null;
  createdAt: number;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  customerId: string;
  assignedAgentId?: string;
  teamId?: string;
  createdAt: number;
  updatedAt: number;
  aiSuggestions?: {
    category?: string;
    priority?: string;
    suggestedReply?: string;
    relevantDocs?: string[];
  };
  isVoiceTicket?: boolean;
  voiceTranscript?: string;
  // Extended fields from queries
  customer?: User | null;
  assignedAgent?: User | null;
  messageCount?: number;
  hasConversation?: boolean;
  unreadCount?: number;
}

export interface Message {
  _id: string;
  ticketId: string;
  authorId: string;
  content: string;
  messageType?: "human" | "ai";
  isInternal?: boolean;
  createdAt: number;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface KnowledgeBase {
  _id: string;
  title: string;
  content: string;
  url?: string;
  tags?: string[];
  embedding?: number[];
  createdAt: number;
  updatedAt: number;
}
