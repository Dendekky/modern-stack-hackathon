import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
 * Query to search knowledge base documents by title or content
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
