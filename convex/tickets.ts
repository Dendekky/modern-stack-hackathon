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
    const ticketId = await ctx.db.insert("tickets", {
      title: args.title,
      description: args.description,
      status: "open",
      priority: args.priority || "medium",
      category: args.category,
      customerId: args.customerId,
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
  args: {},
  handler: async (ctx) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    
    // Enrich with customer information
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const customer = await ctx.db.get(ticket.customerId);
        const assignedAgent = ticket.assignedAgentId 
          ? await ctx.db.get(ticket.assignedAgentId)
          : null;
        
        return {
          ...ticket,
          customer,
          assignedAgent,
        };
      })
    );
    
    return enrichedTickets;
  },
});

// Get tickets for a specific customer
export const getCustomerTickets = query({
  args: { customerId: v.id("authUsers") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
    
    return tickets;
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
    
    await ctx.db.patch(args.ticketId, {
      status: args.status,
      assignedAgentId: args.assignedAgentId,
      updatedAt: Date.now(),
    });
    
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
    isInternal: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      ticketId: args.ticketId,
      authorId: args.authorId,
      content: args.content,
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
