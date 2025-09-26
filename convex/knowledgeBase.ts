import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

/**
 * Mutation to store a scraped document in the knowledge base
 */
export const storeDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    url: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("knowledgeBase", {
      title: args.title,
      content: args.content,
      url: args.url,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Query to get all knowledge base documents
 */
export const getAllDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("knowledgeBase")
      .order("desc")
      .collect();
  },
});

/**
 * Query to search knowledge base documents by title or content (simple string matching)
 * Kept for backward compatibility and basic searches
 */
export const searchDocuments = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db.query("knowledgeBase").collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    return allDocs.filter(doc => 
      doc.title.toLowerCase().includes(searchLower) ||
      doc.content.toLowerCase().includes(searchLower) ||
      (doc.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ?? false)
    );
  },
});

/**
 * Query to get documents by tags
 */
export const getDocumentsByTags = query({
  args: {
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db.query("knowledgeBase").collect();
    
    return allDocs.filter(doc =>
      args.tags.some(tag => 
        doc.tags?.some(docTag => 
          docTag.toLowerCase().includes(tag.toLowerCase())
        ) ?? false
      )
    );
  },
});

/**
 * Mutation to delete a document from knowledge base
 */
export const deleteDocument = mutation({
  args: {
    id: v.id("knowledgeBase"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

interface KnowledgeBaseDoc {
  _id: string;
  title: string;
  content: string;
  url?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * LLM-based semantic search for knowledge base documents
 * Uses OpenAI to intelligently match ticket content with relevant documentation
 */
export const semanticSearchDocuments = action({
  args: {
    ticketTitle: v.string(),
    ticketDescription: v.string(),
    maxResults: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<KnowledgeBaseDoc[]> => {
    try {
      // Get all documents from knowledge base
      const allDocs: KnowledgeBaseDoc[] = await ctx.runQuery(api.knowledgeBase.getAllDocuments, {});
      
      if (allDocs.length === 0) {
        return [];
      }

      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Create a summary of available documents for the LLM
      const docSummaries = allDocs.map((doc: KnowledgeBaseDoc, index: number) => 
        `${index + 1}. "${doc.title}" - ${(doc.content || "").substring(0, 200)}... [Tags: ${(doc.tags || []).join(", ")}]`
      ).join("\n\n");

      const systemPrompt = `You are an expert at matching customer support tickets with relevant documentation. 
Analyze the ticket and identify the most relevant documents that could help resolve the customer's issue.

Consider:
- Semantic similarity (not just keyword matching)
- Intent and context of the customer's problem
- Technical concepts and synonyms
- Related topics that might be helpful

Return a JSON array of document indices (1-based) in order of relevance. Only include documents that are genuinely relevant to solving the customer's problem.
If no documents are relevant, return an empty array.

Format: {"relevantDocuments": [1, 3, 5]}`;

      const userPrompt = `Ticket Title: "${args.ticketTitle}"
Ticket Description: "${args.ticketDescription}"

Available Documentation:
${docSummaries}

Which documents are most relevant to help resolve this customer's issue?`;

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1, // Low temperature for consistent, focused results
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content) as { relevantDocuments?: number[] };
      
      const relevantIndices = parsed.relevantDocuments || [];
      const maxResults = args.maxResults || 5;
      
      // Convert 1-based indices to 0-based and get the documents
      const relevantDocs: KnowledgeBaseDoc[] = relevantIndices
        .slice(0, maxResults) // Limit results
        .map(index => allDocs[index - 1]) // Convert to 0-based indexing
        .filter((doc): doc is KnowledgeBaseDoc => doc !== undefined); // Filter out invalid indices

      console.log(`Semantic search found ${relevantDocs.length} relevant documents for ticket: "${args.ticketTitle}"`);
      
      return relevantDocs;

    } catch (error) {
      console.error("Error in semantic search:", error);
      // Fallback to simple search if LLM fails
      const fallbackSearchTerm = `${args.ticketTitle} ${args.ticketDescription}`.substring(0, 100);
      return await ctx.runQuery(api.knowledgeBase.searchDocuments, { searchTerm: fallbackSearchTerm });
    }
  },
});
