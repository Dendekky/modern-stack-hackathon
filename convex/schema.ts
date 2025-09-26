import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Consolidated user table (used by Better Auth and application)
  authUsers: defineTable({
    id: v.string(),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    name: v.optional(v.union(v.string(), v.null())),
    image: v.optional(v.union(v.string(), v.null())),
    // Application-specific fields with proper typing
    role: v.optional(v.union(v.literal("customer"), v.literal("agent"), v.null())),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_user_id", ["id"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  authSessions: defineTable({
    id: v.string(),
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.union(v.string(), v.null())),
    userAgent: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),

  authAccounts: defineTable({
    id: v.string(),
    userId: v.string(),
    providerId: v.string(),
    accountId: v.string(),
    accessToken: v.optional(v.union(v.string(), v.null())),
    refreshToken: v.optional(v.union(v.string(), v.null())),
    idToken: v.optional(v.union(v.string(), v.null())),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.union(v.string(), v.null())),
    password: v.optional(v.union(v.string(), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_provider_account", ["providerId", "accountId"]),

  authVerifications: defineTable({
    id: v.string(),
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_identifier_value", ["identifier", "value"]),

  authRateLimits: defineTable({
    id: v.string(),
    identifier: v.string(),
    window: v.number(),
    hits: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_identifier_window", ["identifier", "window"]),

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
    customerId: v.id("authUsers"),
    assignedAgentId: v.optional(v.id("authUsers")),
    teamId: v.optional(v.id("teams")),
    createdAt: v.number(),
    updatedAt: v.number(),
    aiSuggestions: v.optional(v.object({
      category: v.optional(v.string()),
      priority: v.optional(v.string()),
      suggestedReply: v.optional(v.string()),
      relevantDocs: v.optional(v.array(v.string())),
    })),
    aiSummary: v.optional(v.string()), // Keep for backward compatibility
    aiQuickResponse: v.optional(v.object({
      hasKnowledgeBaseMatch: v.boolean(),
      response: v.optional(v.string()),
      relevantDocs: v.optional(v.array(v.object({
        title: v.string(),
        url: v.string(),
        snippet: v.string(),
      }))),
      escalatedToHighPriority: v.optional(v.boolean()),
    })),
    isVoiceTicket: v.optional(v.boolean()),
    voiceTranscript: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_agent", ["assignedAgentId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  messages: defineTable({
    ticketId: v.id("tickets"),
    authorId: v.id("authUsers"),
    content: v.string(),
    messageType: v.optional(v.union(v.literal("human"), v.literal("ai"))), // Distinguish AI vs human messages
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

  // Track when users last viewed tickets for unread message indicators
  ticketViews: defineTable({
    ticketId: v.id("tickets"),
    userId: v.id("authUsers"),
    lastViewedAt: v.number(),
  })
    .index("by_ticket_user", ["ticketId", "userId"])
    .index("by_user", ["userId"]),
});
