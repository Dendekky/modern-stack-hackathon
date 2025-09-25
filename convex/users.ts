import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update user profile (role/plan) - Better Auth handles user creation
export const updateUserProfile = mutation({
  args: {
    userId: v.string(), // Better Auth uses string IDs
    role: v.optional(v.union(v.literal("customer"), v.literal("agent"))),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
  },
  handler: async (ctx, args) => {
    // Find user by Better Auth ID
    const user = await ctx.db
      .query("authUsers")
      .withIndex("by_id", (q) => q.eq("id", args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update user profile
    await ctx.db.patch(user._id, {
      role: args.role,
      plan: args.plan,
      updatedAt: Date.now(),
    });
    
    return user._id;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("authUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return user;
  },
});

// Get user by Better Auth ID
export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("authUsers")
      .withIndex("by_id", (q) => q.eq("id", args.userId))
      .first();
    
    return user;
  },
});

// Get user by Convex document ID
export const getUserByDocId = query({
  args: { docId: v.id("authUsers") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.docId);
    return user;
  },
});

// Update user plan (for monetization)
export const updateUserPlan = mutation({
  args: {
    userId: v.string(), // Better Auth ID
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("authUsers")
      .withIndex("by_id", (q) => q.eq("id", args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(user._id, {
      plan: args.plan,
      updatedAt: Date.now(),
    });
  },
});

// Update user role
export const updateUserRole = mutation({
  args: {
    userId: v.string(), // Better Auth ID
    role: v.union(v.literal("customer"), v.literal("agent")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("authUsers")
      .withIndex("by_id", (q) => q.eq("id", args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(user._id, {
      role: args.role,
      updatedAt: Date.now(),
    });
  },
});

// Get all agents (for assignment)
export const getAgents = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db
      .query("authUsers")
      .withIndex("by_role", (q) => q.eq("role", "agent"))
      .collect();
    
    return agents;
  },
});
