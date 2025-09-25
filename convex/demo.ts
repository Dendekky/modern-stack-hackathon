import { mutation } from "./_generated/server";

// Create demo users for testing
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo data already exists
    const existingAgent = await ctx.db
      .query("authUsers")
      .filter((q) => q.eq(q.field("email"), "agent@demo.com"))
      .first();
    
    if (existingAgent) {
      return { message: "Demo data already exists" };
    }

    // Create demo agent users
    const agent1 = await ctx.db.insert("authUsers", {
      id: crypto.randomUUID(),
      email: "agent@demo.com",
      name: "Demo Agent",
      role: "agent",
      plan: "pro",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const agent2 = await ctx.db.insert("authUsers", {
      id: crypto.randomUUID(),
      email: "sarah.agent@demo.com",
      name: "Sarah Wilson",
      role: "agent",
      plan: "pro",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const agent3 = await ctx.db.insert("authUsers", {
      id: crypto.randomUUID(),
      email: "mike.agent@demo.com",
      name: "Mike Johnson",
      role: "agent",
      plan: "pro",
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
