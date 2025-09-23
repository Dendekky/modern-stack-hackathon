import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("customer"), v.literal("agent")),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }),

  tickets: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    category: v.optional(v.string()),
    customerId: v.id("users"),
    assignedAgentId: v.optional(v.id("users")),
    teamId: v.optional(v.id("teams")),
    createdAt: v.number(),
    updatedAt: v.number(),
    aiSuggestions: v.optional(v.object({
      category: v.optional(v.string()),
      priority: v.optional(v.string()),
      suggestedReply: v.optional(v.string()),
      relevantDocs: v.optional(v.array(v.string())),
    })),
    aiSummary: v.optional(v.string()),
    isVoiceTicket: v.optional(v.boolean()),
    voiceTranscript: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_agent", ["assignedAgentId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  messages: defineTable({
    ticketId: v.id("tickets"),
    authorId: v.id("users"),
    content: v.string(),
    isInternal: v.optional(v.boolean()), // For agent-only notes
    createdAt: v.number(),
  }).index("by_ticket", ["ticketId"]),

  knowledgeBase: defineTable({
    title: v.string(),
    content: v.string(),
    url: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    embedding: v.optional(v.array(v.number())), // For vector search
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
