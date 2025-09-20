import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Demo action to populate knowledge base with pre-scraped documentation
 * from Convex, Resend, and Firecrawl for demonstration purposes
 */
export const setupDemoKnowledgeBase = action({
  args: {},
  handler: async (ctx) => {
    const demoDocuments = [
      // Convex Documentation
      {
        title: "Convex - Real-time Database Functions",
        content: `# Convex Real-time Database

Convex is a real-time database and backend platform that makes it easy to build full-stack applications.

## Key Features

### Real-time Subscriptions
- Automatic UI updates when data changes
- Built-in optimistic updates for better UX
- WebSocket connections managed automatically

### Database Functions
- Write TypeScript functions that run on the server
- Queries for reading data with automatic caching
- Mutations for writing data with ACID transactions
- Actions for side effects like calling external APIs

### Authentication
- Built-in user management
- Role-based access control
- Integration with popular auth providers

## Getting Started

1. Install Convex: \`npm install convex\`
2. Initialize your project: \`npx convex dev\`
3. Define your schema in \`convex/schema.ts\`
4. Write functions in your \`convex/\` directory

## Common Issues

**Connection Problems**: Ensure your CONVEX_DEPLOYMENT environment variable is set correctly.

**Type Errors**: Run \`npx convex codegen\` to regenerate types after schema changes.

**Performance**: Use indexes for efficient queries on large datasets.`,
        url: "https://docs.convex.dev",
        tags: ["convex", "database", "real-time", "backend", "functions"]
      },
      
      // Resend Documentation
      {
        title: "Resend - Email Delivery Platform",
        content: `# Resend Email Platform

Resend is a modern email delivery platform built for developers.

## Core Features

### Email Sending
- Simple API for sending transactional emails
- HTML and plain text support
- Template management and variables
- Bulk email sending capabilities

### Delivery & Analytics
- High deliverability rates
- Real-time delivery tracking
- Bounce and complaint handling
- Detailed analytics and metrics

### Developer Experience
- RESTful API with comprehensive documentation
- SDKs for popular programming languages
- Webhook support for real-time events
- Testing tools and sandbox environment

## Quick Start

1. Get API key from Resend dashboard
2. Install SDK: \`npm install resend\`
3. Send your first email:

\`\`\`javascript
import { Resend } from 'resend';
const resend = new Resend('your-api-key');

await resend.emails.send({
  from: 'hello@example.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Welcome to our platform!</p>'
});
\`\`\`

## Troubleshooting

**Authentication Errors**: Verify your API key is correct and has proper permissions.

**Delivery Issues**: Check your domain verification and SPF/DKIM records.

**Rate Limits**: Implement proper retry logic and respect rate limits.`,
        url: "https://resend.com/docs",
        tags: ["resend", "email", "delivery", "transactional", "api"]
      },

      // Firecrawl Documentation  
      {
        title: "Firecrawl - Web Scraping & Data Extraction",
        content: `# Firecrawl Web Scraping Platform

Firecrawl is a powerful web scraping and data extraction platform that converts websites into clean, structured data.

## Key Capabilities

### Web Scraping
- Extract content from any website
- Handle JavaScript-heavy sites
- Respect robots.txt and rate limits
- Clean, formatted output (Markdown, HTML, JSON)

### Website Crawling
- Crawl entire websites or specific sections
- Configurable depth and page limits
- Smart filtering with include/exclude patterns
- Bulk data extraction

### Data Processing
- Convert HTML to clean Markdown
- Extract structured data with custom schemas
- Handle forms, tables, and complex layouts
- Remove ads, navigation, and clutter

## API Usage

### Single Page Scraping
\`\`\`javascript
import Firecrawl from '@mendable/firecrawl-js';
const app = new Firecrawl({ apiKey: 'your-api-key' });

const result = await app.scrape('https://example.com', {
  formats: ['markdown'],
  onlyMainContent: true
});
\`\`\`

### Website Crawling
\`\`\`javascript
const crawlResult = await app.crawl('https://docs.example.com', {
  limit: 50,
  scrapeOptions: { formats: ['markdown'] }
});
\`\`\`

## Common Use Cases

**Documentation Scraping**: Extract API docs and guides for knowledge bases
**Content Migration**: Move content between platforms
**Competitive Analysis**: Monitor competitor websites
**Data Collection**: Gather structured data for analysis

## Troubleshooting

**Rate Limiting**: Implement delays between requests to avoid being blocked
**JavaScript Issues**: Use the headless browser option for dynamic content
**Authentication**: Some sites require login - use session cookies when needed`,
        url: "https://docs.firecrawl.dev",
        tags: ["firecrawl", "scraping", "crawling", "data-extraction", "web"]
      },

      // Integration Examples
      {
        title: "Integration Guide - Convex + Resend + Firecrawl",
        content: `# Modern Stack Integration Guide

This guide shows how to integrate Convex, Resend, and Firecrawl for a powerful support ticketing system.

## Architecture Overview

### Convex Backend
- Real-time ticket storage and updates
- User management and authentication
- Background job processing
- WebSocket connections for live updates

### Resend Email Integration
- Automated ticket confirmation emails
- Status update notifications
- Agent assignment alerts
- Custom email templates

### Firecrawl Knowledge Base
- Scrape documentation and FAQs
- Build searchable knowledge base
- Enhance AI responses with context
- Automatic content updates

## Implementation Pattern

1. **Ticket Creation Flow**:
   - User submits ticket → Convex mutation
   - Trigger Resend email confirmation
   - AI analyzes ticket against Firecrawl knowledge base
   - Generate suggested responses

2. **Knowledge Base Updates**:
   - Firecrawl scrapes documentation sites
   - Store content in Convex database
   - Index for fast full-text search
   - Update AI context automatically

3. **Real-time Updates**:
   - Convex subscriptions update UI instantly
   - Email notifications via Resend
   - Agent dashboard shows live ticket status

## Best Practices

**Error Handling**: Implement proper retry logic for all external API calls
**Rate Limiting**: Respect API limits for Resend and Firecrawl
**Caching**: Cache frequently accessed knowledge base content
**Monitoring**: Track email delivery and scraping success rates`,
        url: "https://example.com/integration-guide",
        tags: ["integration", "convex", "resend", "firecrawl", "architecture", "best-practices"]
      }
    ];

    console.log("Setting up demo knowledge base with documentation...");

    const storedDocs: string[] = [];
    for (const doc of demoDocuments) {
      const docId = await ctx.runMutation(api.knowledgeBase.storeDocument, {
        title: doc.title,
        content: doc.content,
        url: doc.url,
        tags: doc.tags,
      });
      storedDocs.push(docId);
    }

    console.log(`Demo knowledge base setup complete! Stored ${storedDocs.length} documents.`);
    
    return {
      success: true,
      documentsAdded: storedDocs.length,
      documentIds: storedDocs,
      message: "Demo knowledge base populated with Convex, Resend, and Firecrawl documentation"
    };
  },
});
