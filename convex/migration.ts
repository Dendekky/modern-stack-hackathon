import { mutation } from "./_generated/server";

/**
 * Migration function to clean up tickets that reference non-existent users
 * from the old "users" table that no longer exists.
 */
export const cleanupInvalidTicketReferences = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting ticket cleanup migration...");
    
    // Get all tickets
    const tickets = await ctx.db.query("tickets").collect();
    let updatedCount = 0;
    let deletedCount = 0;
    
    for (const ticket of tickets) {
      let needsUpdate = false;
      const updates: any = {};
      
      // Check if customerId exists in authUsers
      if (ticket.customerId) {
        const customer = await ctx.db.get(ticket.customerId);
        if (!customer) {
          console.log(`Ticket ${ticket._id} has invalid customerId: ${ticket.customerId}`);
          // Delete tickets with invalid customer references as they're orphaned
          await ctx.db.delete(ticket._id);
          deletedCount++;
          continue;
        }
      }
      
      // Check if assignedAgentId exists in authUsers (if set)
      if (ticket.assignedAgentId) {
        const agent = await ctx.db.get(ticket.assignedAgentId);
        if (!agent) {
          console.log(`Ticket ${ticket._id} has invalid assignedAgentId: ${ticket.assignedAgentId}, removing assignment`);
          updates.assignedAgentId = undefined;
          needsUpdate = true;
        }
      }
      
      // Update ticket if needed
      if (needsUpdate) {
        updates.updatedAt = Date.now();
        await ctx.db.patch(ticket._id, updates);
        updatedCount++;
      }
    }
    
    console.log(`Migration complete: Updated ${updatedCount} tickets, deleted ${deletedCount} orphaned tickets`);
    
    return {
      success: true,
      updatedTickets: updatedCount,
      deletedTickets: deletedCount,
      message: `Migration complete: Updated ${updatedCount} tickets, deleted ${deletedCount} orphaned tickets`
    };
  },
});

/**
 * Helper function to check database integrity
 */
export const checkDatabaseIntegrity = mutation({
  args: {},
  handler: async (ctx) => {
    const tickets = await ctx.db.query("tickets").collect();
    const issues = [];
    
    for (const ticket of tickets) {
      // Check customer reference
      if (ticket.customerId) {
        const customer = await ctx.db.get(ticket.customerId);
        if (!customer) {
          issues.push({
            ticketId: ticket._id,
            issue: "Invalid customerId",
            value: ticket.customerId
          });
        }
      }
      
      // Check agent reference
      if (ticket.assignedAgentId) {
        const agent = await ctx.db.get(ticket.assignedAgentId);
        if (!agent) {
          issues.push({
            ticketId: ticket._id,
            issue: "Invalid assignedAgentId", 
            value: ticket.assignedAgentId
          });
        }
      }
    }
    
    return {
      totalTickets: tickets.length,
      issues: issues.length,
      details: issues
    };
  },
});
