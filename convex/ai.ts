import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Simulate OpenAI API calls for demo purposes
// In production, you would integrate with the actual OpenAI API

export const analyzeTicket = action({
  args: {
    ticketId: v.id("tickets"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock AI analysis based on ticket content
    const analysis = await simulateAIAnalysis(args.title, args.description);

    // Update the ticket with AI suggestions
    await ctx.runMutation(api.tickets.addAISuggestions, {
      ticketId: args.ticketId,
      suggestions: analysis,
    });

    return analysis;
  },
});

export const generateSuggestedReply = action({
  args: {
    ticketTitle: v.string(),
    ticketDescription: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const suggestedReply = await simulateSuggestedReply(
      args.ticketTitle,
      args.ticketDescription,
      args.category
    );

    return { suggestedReply };
  },
});

// Mock AI analysis function
async function simulateAIAnalysis(title: string, description: string) {
  const titleLower = title.toLowerCase();
  const descriptionLower = description.toLowerCase();

  // Simple keyword-based categorization for demo
  let category = "general";
  let priority = "medium";
  let suggestedReply = "";

  // Categorization logic
  if (titleLower.includes("billing") || descriptionLower.includes("payment") || descriptionLower.includes("invoice")) {
    category = "billing";
    priority = "high";
    suggestedReply = "Thank you for contacting us about your billing inquiry. I'll review your account details and get back to you within 24 hours with a resolution.";
  } else if (titleLower.includes("urgent") || descriptionLower.includes("urgent") || descriptionLower.includes("emergency")) {
    category = "urgent";
    priority = "urgent";
    suggestedReply = "I understand this is urgent. I'm prioritizing your ticket and will provide an immediate response. Let me investigate this issue right away.";
  } else if (titleLower.includes("login") || titleLower.includes("password") || descriptionLower.includes("access")) {
    category = "authentication";
    priority = "high";
    suggestedReply = "I can help you with your login issue. Please check your email for a password reset link, or let me know if you need additional assistance accessing your account.";
  } else if (titleLower.includes("bug") || titleLower.includes("error") || descriptionLower.includes("not working")) {
    category = "technical";
    priority = "high";
    suggestedReply = "Thank you for reporting this technical issue. I've escalated this to our development team and will keep you updated on the progress. In the meantime, here are some potential workarounds...";
  } else if (titleLower.includes("feature") || titleLower.includes("request") || descriptionLower.includes("suggestion")) {
    category = "feature_request";
    priority = "low";
    suggestedReply = "Thank you for your feature suggestion! I'll forward this to our product team for consideration. We appreciate your feedback in helping us improve our service.";
  }

  return {
    category,
    priority,
    suggestedReply,
    relevantDocs: [
      `Knowledge Base: ${category} FAQ`,
      `Documentation: ${category} troubleshooting guide`
    ],
  };
}

async function simulateSuggestedReply(title: string, description: string, category?: string) {
  // Generate contextual reply based on category and content
  const baseReplies = {
    billing: "I've reviewed your billing inquiry and found the following information about your account...",
    technical: "I've identified the technical issue you're experiencing. Here's what I found and the recommended solution...",
    authentication: "I can help resolve your login issue. I've checked your account status and here's what we can do...",
    feature_request: "Thank you for your feature suggestion! I've noted your request and here's what I can tell you about similar features...",
    urgent: "I understand the urgency of your request. I've immediately escalated this and here's what we're doing to resolve it...",
    general: "Thank you for reaching out. I've reviewed your inquiry and here's how I can help..."
  };

  return baseReplies[category as keyof typeof baseReplies] || baseReplies.general;
}
