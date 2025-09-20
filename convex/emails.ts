import { action } from "./_generated/server";
import { v } from "convex/values";

// Server-side email sending action
export const sendTicketCreatedEmail = action({
  args: {
    to: v.string(),
    customerName: v.string(),
    ticketId: v.string(),
    ticketTitle: v.string(),
    ticketDescription: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real implementation, you'd use the Resend API here
    // For now, we'll simulate the email sending
    console.log("Sending ticket created email:", {
      to: args.to,
      subject: `Ticket Created: ${args.ticketTitle}`,
      ticketId: args.ticketId,
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, we'll return success
    // In production, integrate with Resend API here
    return { success: true, emailId: `email_${Date.now()}` };
  },
});

export const sendTicketStatusEmail = action({
  args: {
    to: v.string(),
    customerName: v.string(),
    ticketId: v.string(),
    ticketTitle: v.string(),
    status: v.string(),
    agentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Sending ticket status email:", {
      to: args.to,
      subject: `Ticket Update: ${args.ticketTitle}`,
      status: args.status,
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, emailId: `email_${Date.now()}` };
  },
});
