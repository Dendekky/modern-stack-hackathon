import { mutation } from "./_generated/server";

// Create demo users for testing
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo data already exists
    const existingAgent = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), "agent@demo.com"))
      .first();
    
    if (existingAgent) {
      return { message: "Demo data already exists" };
    }

    // Create demo agent users
    const agent1 = await ctx.db.insert("users", {
      email: "agent@demo.com",
      name: "Demo Agent",
      role: "agent",
      plan: "pro",
      createdAt: Date.now(),
    });

    const agent2 = await ctx.db.insert("users", {
      email: "sarah.agent@demo.com",
      name: "Sarah Wilson",
      role: "agent",
      plan: "pro",
      createdAt: Date.now(),
    });

    const agent3 = await ctx.db.insert("users", {
      email: "mike.agent@demo.com",
      name: "Mike Johnson",
      role: "agent",
      plan: "pro",
      createdAt: Date.now(),
    });

    // Create a demo team
    const team = await ctx.db.insert("teams", {
      name: "Support Team Alpha",
      description: "Primary customer support team",
      createdAt: Date.now(),
    });

    return {
      message: "Demo data created successfully",
      agents: [agent1, agent2, agent3],
      team,
    };
  },
});
