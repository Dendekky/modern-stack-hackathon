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
      console.error("Error analyzing ticket:", err);
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
      console.error("Error generating suggested reply:", err);
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
    suggestedReply = "Thank you for contacting us about your billing inquiry. I understand how important it is to resolve payment-related issues quickly.\n\nI've reviewed your account and will need to investigate this further. Here's what I can do for you:\n\n1. Review your recent billing history\n2. Check for any processing errors\n3. Verify your payment method is up to date\n\nI'll get back to you within 24 hours with a complete resolution. In the meantime, if you have any urgent concerns, please don't hesitate to reach out.\n\nBest regards,\nCustomer Support Team";
  } else if (titleLower.includes("urgent") || descriptionLower.includes("urgent") || descriptionLower.includes("emergency")) {
    category = "urgent";
    priority = "urgent";
    suggestedReply = "I understand this is an urgent matter and I'm treating it with the highest priority.\n\nI've immediately escalated your ticket to our senior support team and will personally ensure this gets resolved as quickly as possible. Here's what's happening next:\n\n1. Senior technician assigned within 15 minutes\n2. Direct phone contact if needed\n3. Real-time updates every 30 minutes until resolved\n\nYou should expect an initial response within the next 15 minutes. Thank you for your patience as we work to resolve this urgently.\n\nBest regards,\nPriority Support Team";
  } else if (titleLower.includes("login") || titleLower.includes("password") || descriptionLower.includes("access")) {
    category = "authentication";
    priority = "high";
    suggestedReply = "I'm here to help you regain access to your account quickly and securely.\n\nFor immediate assistance, please try these steps:\n\n1. Check your email for a password reset link (including spam folder)\n2. Clear your browser cache and cookies\n3. Try accessing from an incognito/private browser window\n\nIf these steps don't resolve the issue, I can:\n- Send a new password reset email\n- Verify your account security settings\n- Provide alternative access methods\n\nPlease let me know which step you'd like to try first, and I'll guide you through the process.\n\nBest regards,\nSecurity Support Team";
  } else if (titleLower.includes("bug") || titleLower.includes("error") || descriptionLower.includes("not working")) {
    category = "technical";
    priority = "high";
    suggestedReply = "Thank you for reporting this technical issue. I take bug reports seriously as they help us improve our service for everyone.\n\nI've documented the following details from your report:\n- Issue description: " + description.substring(0, 100) + "...\n- Priority level: High\n- Assigned to: Development Team\n\nImmediate next steps:\n1. Our QA team will reproduce the issue\n2. Development team will create a fix\n3. You'll receive updates every 24 hours\n\nAs a temporary workaround, you might try:\n- Refreshing the page\n- Using a different browser\n- Clearing your cache\n\nI'll keep you updated on our progress. Thank you for helping us improve!\n\nBest regards,\nTechnical Support Team";
  } else if (titleLower.includes("feature") || titleLower.includes("request") || descriptionLower.includes("suggestion")) {
    category = "feature_request";
    priority = "low";
    suggestedReply = "Thank you for taking the time to share your feature suggestion! Customer feedback like yours is invaluable in shaping our product roadmap.\n\nI've forwarded your request to our Product Team with the following details:\n- Feature request: " + title + "\n- Business case: " + description.substring(0, 100) + "...\n- Priority: Added to backlog for evaluation\n\nOur product team reviews all feature requests during our monthly planning sessions. While I can't guarantee implementation, your suggestion will be seriously considered alongside user demand and technical feasibility.\n\nYou'll receive an email update if this feature is scheduled for development. Thank you for helping us build a better product!\n\nBest regards,\nProduct Support Team";
  } else {
    // Default general response
    suggestedReply = "Thank you for reaching out to our support team. I've received your inquiry and want to ensure you get the help you need.\n\nBased on your message about \"" + title + "\", I understand you're looking for assistance with this matter. Here's how I can help:\n\n1. I'll review your account and any relevant information\n2. Research the best solution for your specific situation\n3. Provide you with clear, actionable next steps\n\nI aim to respond with a complete solution within 24 hours. If your issue is time-sensitive, please let me know and I can prioritize accordingly.\n\nIs there any additional context or specific details that might help me assist you better?\n\nBest regards,\nCustomer Support Team";
  }

  // Enhance reply with knowledge base context
  if (relevantDocs.length > 0) {
    const docTitles = relevantDocs.map((doc) => doc.title ?? "Relevant document");
    suggestedReply += `\n\n📚 I found some relevant documentation that might help: ${docTitles.join(", ")}. Let me provide you with the specific information from our knowledge base that relates to your inquiry.`;
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
