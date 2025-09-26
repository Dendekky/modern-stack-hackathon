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
    // Search knowledge base for relevant documents using LLM semantic search
    const relevantDocs: KnowledgeBaseDoc[] = await ctx.runAction(api.knowledgeBase.semanticSearchDocuments, {
      ticketTitle: args.title,
      ticketDescription: args.description,
      maxResults: 3,
    });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Check if we have relevant knowledge base content
    const hasRelevantDocs = relevantDocs.length > 0 && 
      relevantDocs.some(doc => doc.content && doc.content.length > 100);

    let analysis: { category?: string; priority?: string; suggestedReply?: string; relevantDocs?: string[] };
    let quickResponse: { hasKnowledgeBaseMatch: boolean; response?: string; relevantDocs?: any[]; escalatedToHighPriority?: boolean };

    if (!hasRelevantDocs) {
      // No relevant knowledge base match - escalate to high priority
      analysis = {
        category: "general",
        priority: "high", // Auto-escalate when no KB match
        suggestedReply: "This ticket requires manual agent review as no relevant knowledge base information was found.",
        relevantDocs: [],
      };
      
      quickResponse = {
        hasKnowledgeBaseMatch: false,
        escalatedToHighPriority: true,
      };

      // Update ticket priority to high
      await ctx.runMutation(api.tickets.updateTicketPriority, {
        ticketId: args.ticketId,
        priority: "high",
      });
    } else {
      // We have relevant docs - generate customer-facing response
      const docsContext = relevantDocs
        .slice(0, 3)
        .map((doc: KnowledgeBaseDoc, index: number) => `Doc ${index + 1}: ${doc.title ?? "Untitled"}\n${(doc.content ?? "").slice(0, 800)}`)
        .join("\n\n");

      const customerSystemPrompt = `You are a helpful AI assistant providing solutions to customer support tickets based on knowledge base documentation. 
Create a clear, step-by-step response that directly addresses the customer's issue using the provided documentation.
Format your response with:
1. A brief acknowledgment of their issue
2. Clear numbered steps to resolve it
3. Any relevant links or references from the documentation
Keep it concise but comprehensive. Only provide solutions you're confident about based on the documentation.`;

      const agentSystemPrompt = `You are an AI assistant for a customer support team. Classify tickets and draft helpful replies for agents.
Return ONLY a valid JSON object with these exact keys: category, priority, suggestedReply.
- category: one of [billing, authentication, technical, feature_request, urgent, general]  
- priority: one of [low, medium, high, urgent]
- suggestedReply: a helpful reply for the agent to use
Base decisions on the ticket and provided docs. Do not include markdown formatting or code blocks in your response.`;

      const userPrompt = `Ticket Title: ${args.title}\nTicket Description: ${args.description}\n\nRelevant Documentation:\n${docsContext}`;

      try {
        // Generate customer-facing response
        const customerResponse = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: customerSystemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
        });

        // Generate agent analysis
        const agentResponse = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: agentSystemPrompt },
            { role: "user", content: userPrompt + "\n\nRespond with ONLY a valid JSON object. No markdown, no code blocks, no additional text." }
          ],
          temperature: 0.2,
        });

        const customerResponseText = customerResponse.choices[0]?.message?.content || "";
        const agentContent = agentResponse.choices[0]?.message?.content || "{}";
        
        // Clean up the JSON response - remove markdown code blocks if present
        const cleanedAgentContent = agentContent
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();
        
        let agentParsed: {
          category?: string;
          priority?: string;
          suggestedReply?: string;
        };
        
        try {
          agentParsed = JSON.parse(cleanedAgentContent);
        } catch (parseError) {
          console.error("Failed to parse agent JSON response:", parseError);
          console.error("Original content:", agentContent);
          console.error("Cleaned content:", cleanedAgentContent);
          
          // Fallback to default values if JSON parsing fails
          agentParsed = {
            category: "general",
            priority: "medium",
            suggestedReply: "AI analysis completed - please review manually.",
          };
        }

        analysis = {
          category: agentParsed.category || "general",
          priority: agentParsed.priority || "medium",
          suggestedReply: agentParsed.suggestedReply || "",
          relevantDocs: relevantDocs.slice(0, 3).map((doc: KnowledgeBaseDoc) => doc.title || doc.url || "Relevant document"),
        };

        quickResponse = {
          hasKnowledgeBaseMatch: true,
          response: customerResponseText,
          relevantDocs: relevantDocs.slice(0, 3).map(doc => ({
            title: doc.title || "Relevant Document",
            url: doc.url || "",
            snippet: (doc.content || "").slice(0, 200) + (doc.content && doc.content.length > 200 ? "..." : ""),
          })),
        };

      } catch (err) {
        console.error("Error analyzing ticket with OpenAI:", err);
        // Treat as OpenAI failure - escalate to high priority
        analysis = {
          category: "general", 
          priority: "high",
          suggestedReply: "OpenAI analysis failed. Manual agent review required.",
          relevantDocs: [],
        };
        
        quickResponse = {
          hasKnowledgeBaseMatch: false,
          escalatedToHighPriority: true,
        };

        await ctx.runMutation(api.tickets.updateTicketPriority, {
          ticketId: args.ticketId,
          priority: "high",
        });
      }
    }

    // Update the ticket with both AI suggestions (for agents) and quick response (for customers)
    await ctx.runMutation(api.tickets.addAISuggestions, {
      ticketId: args.ticketId,
      suggestions: analysis,
    });

    await ctx.runMutation(api.tickets.addAIQuickResponse, {
      ticketId: args.ticketId,
      quickResponse: quickResponse,
    });

    return { analysis, quickResponse };
  },
});

export const generateSuggestedReply = action({
  args: {
    ticketTitle: v.string(),
    ticketDescription: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Search knowledge base for relevant documents using LLM semantic search
    const relevantDocs: KnowledgeBaseDoc[] = await ctx.runAction(api.knowledgeBase.semanticSearchDocuments, {
      ticketTitle: args.ticketTitle,
      ticketDescription: args.ticketDescription,
      maxResults: 2,
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
      return { suggestedReply: "OpenAI analysis failed. Manual agent review required." };
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

