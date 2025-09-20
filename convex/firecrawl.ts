"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Firecrawl integration for knowledge base document scraping
// Requires FIRECRAWL_API_KEY environment variable to be set
import Firecrawl from "@mendable/firecrawl-js";

/**
 * Action to scrape a website and store documents in knowledge base
 */
export const scrapeWebsite = action({
  args: {
    url: v.string(),
    options: v.optional(v.object({
      crawlerOptions: v.optional(v.object({
        includes: v.optional(v.array(v.string())),
        excludes: v.optional(v.array(v.string())),
        maxDepth: v.optional(v.number()),
        limit: v.optional(v.number()),
      })),
      pageOptions: v.optional(v.object({
        onlyMainContent: v.optional(v.boolean()),
        includeHtml: v.optional(v.boolean()),
        screenshot: v.optional(v.boolean()),
      })),
    })),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    documentsStored: number;
    documentIds?: string[];
    error?: string;
  }> => {
    try {
      console.log(`Starting Firecrawl crawl for: ${args.url}`);
      
      if (!process.env.FIRECRAWL_API_KEY) {
        throw new Error("FIRECRAWL_API_KEY environment variable is not set");
      }

      // Initialize Firecrawl client inside the action handler
      const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

      // Use actual Firecrawl API to crawl the website
      const crawlResponse = await firecrawl.crawl(args.url, {
        limit: args.options?.crawlerOptions?.limit || 10,
        includePaths: args.options?.crawlerOptions?.includes || [],
        excludePaths: args.options?.crawlerOptions?.excludes || [],
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: args.options?.pageOptions?.onlyMainContent ?? true,
        },
      });

      if (!crawlResponse || !crawlResponse.data) {
        throw new Error(`Firecrawl crawl failed: No data returned`);
      }

      const documents = crawlResponse.data || [];
      console.log(`Firecrawl crawled ${documents.length} documents`);

      // Store each document in the knowledge base
      const storedDocs: string[] = [];
      for (const doc of documents) {
        if (doc.markdown && doc.metadata?.title) {
          const docId = await ctx.runMutation(api.knowledgeBase.storeDocument, {
            title: doc.metadata.title,
            content: doc.markdown,
            url: (doc.metadata.sourceURL as string) || (doc.metadata.url as string) || args.url,
            tags: Array.isArray(doc.metadata.keywords) ? doc.metadata.keywords : 
                  typeof doc.metadata.keywords === 'string' ? [doc.metadata.keywords] : 
                  doc.metadata.keywords ? [String(doc.metadata.keywords)] : [],
          });
          storedDocs.push(docId);
        }
      }

      console.log(`Stored ${storedDocs.length} documents from Firecrawl in knowledge base`);
      return {
        success: true,
        documentsStored: storedDocs.length,
        documentIds: storedDocs,
      };

    } catch (error) {
      console.error("Firecrawl crawling failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        documentsStored: 0,
      };
    }
  },
});

/**
 * Action to scrape a single page
 */
export const scrapePage = action({
  args: {
    url: v.string(),
    options: v.optional(v.object({
      onlyMainContent: v.optional(v.boolean()),
      includeHtml: v.optional(v.boolean()),
      screenshot: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    documentId?: string;
    title?: string;
    contentLength?: number;
    error?: string;
  }> => {
    try {
      console.log(`Firecrawl scraping single page: ${args.url}`);
      
      if (!process.env.FIRECRAWL_API_KEY) {
        throw new Error("FIRECRAWL_API_KEY environment variable is not set");
      }

      // Initialize Firecrawl client inside the action handler
      const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

      // Use actual Firecrawl API to scrape the single page
      const doc = await firecrawl.scrape(args.url, {
        formats: ['markdown'],
        onlyMainContent: args.options?.onlyMainContent ?? true,
      });

      if (!doc || !doc.markdown || !doc.metadata?.title) {
        throw new Error("No valid content found in scraped page");
      }

      // Store the document in knowledge base
      const docId = await ctx.runMutation(api.knowledgeBase.storeDocument, {
        title: doc.metadata.title,
        content: doc.markdown,
        url: (doc.metadata.sourceURL as string) || (doc.metadata.url as string) || args.url,
        tags: Array.isArray(doc.metadata.keywords) ? doc.metadata.keywords : 
              typeof doc.metadata.keywords === 'string' ? [doc.metadata.keywords] : 
              doc.metadata.keywords ? [String(doc.metadata.keywords)] : [],
      });

      console.log(`Stored Firecrawl document with ID: ${docId}`);
      return {
        success: true,
        documentId: docId,
        title: doc.metadata.title,
        contentLength: doc.markdown.length,
      };

    } catch (error) {
      console.error("Firecrawl page scraping failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

