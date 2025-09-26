import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Create a new ticket
export const createTicket = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    customerId: v.id("authUsers"),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    category: v.optional(v.string()),
    isVoiceTicket: v.optional(v.boolean()),
    voiceTranscript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auto-assign to an available agent
    const agents = await ctx.db
      .query("authUsers")
      .withIndex("by_role", (q) => q.eq("role", "agent"))
      .collect();
    
    let assignedAgentId = undefined;
    if (agents.length > 0) {
      // For now, assign to the first available agent
      // In the future, this could be more sophisticated (round-robin, workload-based, etc.)
      assignedAgentId = agents[0]._id;
    }

    const ticketId = await ctx.db.insert("tickets", {
      title: args.title,
      description: args.description,
      status: "open",
      priority: args.priority || "medium",
      category: args.category,
      customerId: args.customerId,
      assignedAgentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isVoiceTicket: args.isVoiceTicket || false,
      voiceTranscript: args.voiceTranscript,
    });
    
    // Get customer info for email
    const customer = await ctx.db.get(args.customerId);
    
    // Schedule email notification
    if (customer && customer.email) {
      await ctx.scheduler.runAfter(0, api.emails.sendTicketCreatedEmail, {
        to: customer.email,
        customerName: customer.name || "Customer",
        ticketId: ticketId,
        ticketTitle: args.title,
        ticketDescription: args.description,
      });
    }
    
    // Schedule AI analysis
    await ctx.scheduler.runAfter(2000, api.ai.analyzeTicket, {
      ticketId: ticketId,
      title: args.title,
      description: args.description,
    });

    // Schedule AI conversation summary (initial summary after creation)
    await ctx.scheduler.runAfter(4000, api.ai.generateConversationSummary, {
      ticketId: ticketId,
    });
    
    return ticketId;
  },
});

// Get all tickets (for agent dashboard)
export const getAllTickets = query({
  args: {
    currentUserId: v.optional(v.id("authUsers")),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    
    // Enrich with customer information and message count
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const customer = await ctx.db.get(ticket.customerId);
        const assignedAgent = ticket.assignedAgentId 
          ? await ctx.db.get(ticket.assignedAgentId)
          : null;
        
        // Get message count for conversation indicator
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_ticket", (q) => q.eq("ticketId", ticket._id))
          .collect();
        
        const messageCount = messages.length;
        const hasConversation = messageCount > 0;
        
        // Get unread message count if currentUserId is provided
        let unreadCount = 0;
        if (args.currentUserId) {
          const ticketView = await ctx.db
            .query("ticketViews")
            .withIndex("by_ticket_user", (q) => 
              q.eq("ticketId", ticket._id).eq("userId", args.currentUserId!)
            )
            .first();
          
          const lastViewedAt = ticketView?.lastViewedAt || 0;
          const unreadMessages = messages.filter(msg => msg.createdAt > lastViewedAt);
          unreadCount = unreadMessages.length;
        }
        
        return {
          ...ticket,
          customer,
          assignedAgent,
          messageCount,
          hasConversation,
          unreadCount,
        };
      })
    );
    
    return enrichedTickets;
  },
});

// Get tickets for a specific customer
export const getCustomerTickets = query({
  args: { 
    customerId: v.id("authUsers"),
    currentUserId: v.optional(v.id("authUsers")),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
    
    // Enrich with message count for conversation indicator
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_ticket", (q) => q.eq("ticketId", ticket._id))
          .collect();
        
        const messageCount = messages.length;
        const hasConversation = messageCount > 0;
        
        // Get unread message count if currentUserId is provided
        let unreadCount = 0;
        if (args.currentUserId) {
          const ticketView = await ctx.db
            .query("ticketViews")
            .withIndex("by_ticket_user", (q) => 
              q.eq("ticketId", ticket._id).eq("userId", args.currentUserId!)
            )
            .first();
          
          const lastViewedAt = ticketView?.lastViewedAt || 0;
          const unreadMessages = messages.filter(msg => msg.createdAt > lastViewedAt);
          unreadCount = unreadMessages.length;
        }
        
        return {
          ...ticket,
          messageCount,
          hasConversation,
          unreadCount,
        };
      })
    );
    
    return enrichedTickets;
  },
});

// Update ticket status
export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    assignedAgentId: v.optional(v.id("authUsers")),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");
    
    const updateData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };
    
    // Only update assignedAgentId if it's provided
    if (args.assignedAgentId !== undefined) {
      updateData.assignedAgentId = args.assignedAgentId;
    }
    
    await ctx.db.patch(args.ticketId, updateData);
    
    // Get customer and agent info for email
    const customer = await ctx.db.get(ticket.customerId);
    const agent = args.assignedAgentId ? await ctx.db.get(args.assignedAgentId) : null;
    
    // Send status update email
    if (customer && customer.email && args.status !== "open") {
      await ctx.scheduler.runAfter(0, api.emails.sendTicketStatusEmail, {
        to: customer.email,
        customerName: customer.name || "Customer",
        ticketId: args.ticketId,
        ticketTitle: ticket.title,
        status: args.status,
        agentName: agent?.name || undefined,
      });
    }
  },
});

// Add AI suggestions to a ticket
export const addAISuggestions = mutation({
  args: {
    ticketId: v.id("tickets"),
    suggestions: v.object({
      category: v.optional(v.string()),
      priority: v.optional(v.string()),
      suggestedReply: v.optional(v.string()),
      relevantDocs: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      aiSuggestions: args.suggestions,
      updatedAt: Date.now(),
    });
  },
});

// Add AI quick response for customers
export const addAIQuickResponse = mutation({
  args: {
    ticketId: v.id("tickets"),
    quickResponse: v.object({
      hasKnowledgeBaseMatch: v.boolean(),
      response: v.optional(v.string()),
      relevantDocs: v.optional(v.array(v.object({
        title: v.string(),
        url: v.string(),
        snippet: v.string(),
      }))),
      escalatedToHighPriority: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      aiQuickResponse: args.quickResponse,
      updatedAt: Date.now(),
    });
  },
});

// Update ticket priority
export const updateTicketPriority = mutation({
  args: {
    ticketId: v.id("tickets"),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      priority: args.priority,
      updatedAt: Date.now(),
    });
  },
});

// Get a single ticket by id (for AI summary and other actions)
export const getTicketById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ticketId);
  },
});

// Get messages for a ticket in chronological order with author info
export const getMessagesForTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();
    
    // Enrich with author information
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.authorId);
        return {
          ...message,
          author,
        };
      })
    );
    
    return enrichedMessages;
  },
});

// Add a message to a ticket
export const addMessage = mutation({
  args: {
    ticketId: v.id("tickets"),
    authorId: v.id("authUsers"),
    content: v.string(),
    messageType: v.optional(v.union(v.literal("human"), v.literal("ai"))),
    isInternal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      ticketId: args.ticketId,
      authorId: args.authorId,
      content: args.content,
      messageType: args.messageType || "human",
      isInternal: args.isInternal || false,
      createdAt: Date.now(),
    });
    
    // Update ticket's updatedAt timestamp
    await ctx.db.patch(args.ticketId, {
      updatedAt: Date.now(),
    });
    
    return messageId;
  },
});

// Send AI suggestion as a message in the conversation
export const sendAIReply = mutation({
  args: {
    ticketId: v.id("tickets"),
    agentId: v.id("authUsers"),
    aiSuggestedReply: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the agent has permission to send AI replies
    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.role !== "agent") {
      throw new Error("Only agents can send AI replies");
    }

    // Add the AI reply as a message in the conversation
    const messageId = await ctx.db.insert("messages", {
      ticketId: args.ticketId,
      authorId: args.agentId,
      content: args.aiSuggestedReply,
      messageType: "ai",
      isInternal: false,
      createdAt: Date.now(),
    });
    
    // Update ticket's updatedAt timestamp
    await ctx.db.patch(args.ticketId, {
      updatedAt: Date.now(),
    });
    
    // Get ticket and customer info for email notification
    const ticket = await ctx.db.get(args.ticketId);
    if (ticket) {
      const customer = await ctx.db.get(ticket.customerId);
      if (customer && customer.email) {
        // Send email notification about the AI reply
        await ctx.scheduler.runAfter(0, api.emails.sendTicketStatusEmail, {
          to: customer.email,
          customerName: customer.name || "Customer",
          ticketId: args.ticketId,
          ticketTitle: ticket.title,
          status: ticket.status,
          agentName: "AI Assistant",
        });
      }
    }
    
    return messageId;
  },
});

// Update AI summary on a ticket
export const updateAISummary = mutation({
  args: {
    ticketId: v.id("tickets"),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ticketId, {
      aiSummary: args.summary,
      updatedAt: Date.now(),
    });
  },
});

// Mark a ticket as viewed by a user (for unread indicators)
export const markTicketAsViewed = mutation({
  args: {
    ticketId: v.id("tickets"),
    userId: v.id("authUsers"),
  },
  handler: async (ctx, args) => {
    // Find existing view record
    const existingView = await ctx.db
      .query("ticketViews")
      .withIndex("by_ticket_user", (q) => 
        q.eq("ticketId", args.ticketId).eq("userId", args.userId)
      )
      .first();
    
    if (existingView) {
      // Update existing view
      await ctx.db.patch(existingView._id, {
        lastViewedAt: Date.now(),
      });
    } else {
      // Create new view record
      await ctx.db.insert("ticketViews", {
        ticketId: args.ticketId,
        userId: args.userId,
        lastViewedAt: Date.now(),
      });
    }
  },
});

// Get unread message count for a user on a ticket
export const getUnreadMessageCount = query({
  args: {
    ticketId: v.id("tickets"),
    userId: v.id("authUsers"),
  },
  handler: async (ctx, args) => {
    // Get the last viewed time for this user on this ticket
    const ticketView = await ctx.db
      .query("ticketViews")
      .withIndex("by_ticket_user", (q) => 
        q.eq("ticketId", args.ticketId).eq("userId", args.userId)
      )
      .first();
    
    const lastViewedAt = ticketView?.lastViewedAt || 0;
    
    // Count messages created after the last viewed time
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .filter((q) => q.gt(q.field("createdAt"), lastViewedAt))
      .collect();
    
    return messages.length;
  },
});
