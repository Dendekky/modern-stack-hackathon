# Modern Stack Hackathon - Support Ticketing System

A modern customer support ticketing system built with Next.js, Convex, Better-Auth, and Resend.

## Conversation Model

- Agents can send manual replies to tickets at any time, independent of AI suggestions.
- AI-generated replies, when accepted/sent, appear in the same conversation thread.
- Both agents and customers see AI responses inline alongside user and agent messages.

## Environment Variables

Make sure to set up the following environment variables in your `.env.local` file:

```
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
BETTER_AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=your_resend_api_key_here
```

### Email Configuration

- **RESEND_API_KEY**: Get your API key from [Resend Dashboard](https://resend.com/api-keys)
- The system sends emails for:
  - Welcome emails on user signup
  - Sign-in notifications  
  - Ticket creation confirmations
  - Ticket status updates

## Getting Started

1. Install dependencies: `bun install`
2. Set up environment variables
3. Start Convex: `bun run convex dev`
4. Start Next.js: `bun run dev` 
