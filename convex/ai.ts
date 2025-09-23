"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import OpenAI from "openai";

interface KnowledgeBaseDoc {
  title?: string;
  content?: string;
  url?: string;
}

// Simulate OpenAI API calls for demo purposes
// In production, you would integrate with the actual OpenAI API

export const analyzeTicket = action({
  args: {
    ticketId: v.id("tickets"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Search knowledge base for relevant documents
    const relevantDocs: KnowledgeBaseDoc[] = await ctx.runQuery(api.knowledgeBase.searchDocuments, {
      searchTerm: `${args.title} ${args.description}`.substring(0, 100),
    });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Build a system prompt with lightweight classification guidance
    const systemPrompt = `You are an AI assistant for a customer support team. Classify tickets and draft helpful replies.
Return JSON with keys: category, priority, suggestedReply.
- category: one of [billing, authentication, technical, feature_request, urgent, general]
- priority: one of [low, medium, high, urgent]
Base decisions on the ticket and optional docs.`;

    const docsContext = relevantDocs
      .slice(0, 3)
      .map((doc: KnowledgeBaseDoc, index: number) => `Doc ${index + 1}: ${doc.title ?? "Untitled"}\n${(doc.content ?? "").slice(0, 800)}`)
      .join("\n\n");

    const userPrompt = `Ticket Title: ${args.title}\nTicket Description: ${args.description}\n\nRelevant Docs:\n${docsContext || "(none)"}\n\nRespond ONLY with JSON.`;

    let analysis: { category?: string; priority?: string; suggestedReply?: string; relevantDocs?: string[] };
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
      });
      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content as string) as {
        category?: string;
        priority?: string;
        suggestedReply?: string;
      };
      analysis = {
        category: parsed.category || "general",
        priority: parsed.priority || "medium",
        suggestedReply: parsed.suggestedReply || "",
        relevantDocs: relevantDocs.slice(0, 3).map((doc: KnowledgeBaseDoc) => doc.title || doc.url || "Relevant document"),
      };
    } catch (err) {
      // Fallback to local heuristic if OpenAI fails
      analysis = await simulateAIAnalysis(
        args.title,
        args.description,
        relevantDocs.slice(0, 3)
      );
    }

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
    // Search knowledge base for relevant documents
    const relevantDocs: KnowledgeBaseDoc[] = await ctx.runQuery(api.knowledgeBase.searchDocuments, {
      searchTerm: `${args.ticketTitle} ${args.ticketDescription}`.substring(0, 100),
    });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const docsContext = relevantDocs
      .slice(0, 2)
      .map((doc: KnowledgeBaseDoc, index: number) => `Doc ${index + 1}: ${doc.title ?? "Untitled"}\n${(doc.content ?? "").slice(0, 600)}`)
      .join("\n\n");
    const systemPrompt = `You write empathetic, concise support replies. Include steps and links only if present in docs.`;
    const userPrompt = `Category: ${args.category || "general"}\nTitle: ${args.ticketTitle}\nDescription: ${args.ticketDescription}\n\nRelevant Docs:\n${docsContext || "(none)"}`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4,
      });
      const suggestedReply = (response.choices[0]?.message?.content as string) || "";
      return { suggestedReply };
    } catch (err) {
      const suggestedReply = await simulateSuggestedReply(
        args.ticketTitle,
        args.ticketDescription,
        args.category,
        relevantDocs.slice(0, 2)
      );
      return { suggestedReply };
    }
  },
});

export const generateConversationSummary: ReturnType<typeof action> = action({
  args: {
    ticketId: v.id("tickets"),
  },
  handler: async (ctx, args): Promise<{ summary: string }> => {
    // Fetch latest ticket and messages via queries (actions cannot access db directly)
    type TicketForSummary = { title: string; description: string };
    const ticket = await ctx.runQuery(api.tickets.getTicketById, { ticketId: args.ticketId }) as TicketForSummary | null;
    if (!ticket) throw new Error("Ticket not found");

    type ConversationMessage = { content: string };
    const messages = await ctx.runQuery(api.tickets.getMessagesForTicket, { ticketId: args.ticketId }) as ConversationMessage[];

    const transcript: string = [
      `Title: ${ticket.title}`,
      `Description: ${ticket.description}`,
      ...messages.map((m: ConversationMessage) => `- ${m.content}`)
    ].join("\n");

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
      const response: OpenAI.Chat.Completions.ChatCompletion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Summarize the ticket conversation in 3-5 bullet points with current status and next steps." },
          { role: "user", content: transcript }
        ],
        temperature: 0.2,
      });
      const summary: string = (response.choices[0]?.message?.content as string) || "";

      // Store summary on ticket via mutation
      await ctx.runMutation(api.tickets.updateAISummary, { ticketId: args.ticketId, summary });
      return { summary };
    } catch (err) {
      return { summary: "" };
    }
  }
});

// Mock AI analysis function with knowledge base integration
async function simulateAIAnalysis(title: string, description: string, relevantDocs: KnowledgeBaseDoc[] = []) {
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

  // Enhance reply with knowledge base context
  if (relevantDocs.length > 0) {
    const docTitles = relevantDocs.map((doc) => doc.title ?? "Relevant document");
    suggestedReply += `\n\nI found some relevant documentation that might help: ${docTitles.join(", ")}. Let me provide you with the specific information from our knowledge base.`;
  }

  return {
    category,
    priority,
    suggestedReply,
    relevantDocs: relevantDocs.map((doc) => doc.title || doc.url || "Relevant document"),
  };
}

async function simulateSuggestedReply(title: string, description: string, category?: string, relevantDocs: KnowledgeBaseDoc[] = []) {
  // Generate contextual reply based on category and content
  const baseReplies = {
    billing: "I've reviewed your billing inquiry and found the following information about your account...",
    technical: "I've identified the technical issue you're experiencing. Here's what I found and the recommended solution...",
    authentication: "I can help resolve your login issue. I've checked your account status and here's what we can do...",
    feature_request: "Thank you for your feature suggestion! I've noted your request and here's what I can tell you about similar features...",
    urgent: "I understand the urgency of your request. I've immediately escalated this and here's what we're doing to resolve it...",
    general: "Thank you for reaching out. I've reviewed your inquiry and here's how I can help..."
  };

  let reply = baseReplies[category as keyof typeof baseReplies] || baseReplies.general;

  // Enhance reply with knowledge base context
  if (relevantDocs.length > 0) {
    reply += `\n\nBased on our knowledge base, I found these relevant resources:\n`;
    relevantDocs.forEach((doc, index) => {
      reply += `${index + 1}. ${doc.title ?? "Relevant document"}\n`;
      if (doc.content) {
        const snippet = doc.content.substring(0, 150);
        reply += `   "${snippet}${doc.content.length > 150 ? '...' : ''}"\n`;
      }
    });
  }

  return reply;
}
