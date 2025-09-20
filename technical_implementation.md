# Technical Implementation

## 1. Framework & Libraries

- **Framework**: Next.js 14 (App Router) with React 18
- **Package Manager**: Bun
- **Styling**: TailwindCSS + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide-react
- **State/Data**: Convex client SDK (real-time), optional React Query
- **Auth**: Better-Auth SDK
- **AI**: OpenAI Node SDK
- **Docs Enrichment**: Firecrawl SDK, Vector DB (Convex / Pinecone)
- **Email**: Resend SDK + @convex-dev/resend component
- **Voice**: Vapi SDK
- **Payments**: Autumn SDK
- **Analytics**: Recharts
- **Developer Experience**: TypeScript, ESLint, Prettier
- **Hosting**: Vercel

---

## 2. Core MVP (Convex + Resend)
- **Convex**
  - Collections: `tickets`, `users`, `teams`.
  - Real-time subscriptions: `tickets` stream → agent dashboard.
  - Dashboard: Next.js frontend with live ticket list + assignment view.
- **Resend Integration**
  - **@convex-dev/resend component**: Official Convex-Resend integration with:
    - **Queuing**: Send unlimited emails with guaranteed delivery
    - **Batching**: Automatic batching for efficient API usage
    - **Durable execution**: Retry logic with Convex workpools
    - **Idempotency**: Prevents duplicate emails with managed keys
    - **Rate limiting**: Respects Resend API limits
  - **Email triggers**: 
    - Ticket creation → "Ticket received" confirmation
    - Status updates → "Ticket resolved/updated" notifications
  - **Webhook integration**: Real-time email delivery status tracking

---

## 3. AI Enhancements (OpenAI + Firecrawl)
- **OpenAI**
  - On ticket creation:
    - Categorize: {priority, type}.
    - Draft suggested reply.
    - Generate conversation summary.
- **Firecrawl**
  - Scrape docs/FAQ/changelog.
  - Store embeddings in vector DB (Convex or Pinecone).
  - On ticket creation: query embeddings → retrieve relevant docs.
  - AI reply enriched with doc snippets.

---

## 4. Auth & Roles (Better-Auth)
- Role-based access:
  - **Customer**: create tickets, view ticket history.
  - **Agent**: view team dashboard, assign/reply to tickets.
- Support for organizations/teams:
  - Agents belong to support teams.
  - Tickets assigned by team.

---

## 5. Monetization (Autumn)
- Free plan: core features + text-only tickets.
- Pro plan: unlocks Vapi voice ticketing.
- Autumn checkout:
  - Simple integration for upgrade flow.
  - Store plan state in Convex user profile.

---

## 6. Voice Ticketing (Vapi)
- **Flow**
  - User calls or speaks into mic.
  - Vapi transcribes → creates new `ticket` in Convex.
  - Trigger Resend → confirmation email.
- Optional: AI-generated voice reply (status updates).

---

## 7. Stretch Goals
- Analytics dashboard for agents:
  - Ticket volume, categories, response time.
- Multi-language support (OpenAI translation).
- SLA reminders (email or dashboard alerts).

---

## 8. Development Order
1. Next.js + Convex backend + dashboard.
2. Resend email triggers.
3. OpenAI categorization + draft replies.
4. Firecrawl doc scraping + enrichment.
5. Better-Auth roles & login flows.
6. Autumn Pro plan integration.
7. Vapi voice ticketing unlock.
8. (Stretch) Analytics dashboard.

