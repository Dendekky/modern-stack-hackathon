# Hackathon Project Plan

## 🎯 Goal
Build a modern customer support ticketing system with:
- **Core reliability** (ticket creation, dashboard, notifications).
- **AI-powered efficiency** (categorization, suggested replies, doc lookups).
- **Voice-first innovation** (voice ticketing as a premium unlock).
- **Monetization built-in** (Pro plan upgrade flow).

---

## 🛠️ Core Stack
- **Convex** → Ticket storage, real-time updates, agent dashboard.
- **Resend** → Customer email notifications.
- **OpenAI** → Ticket triage, summarization, and draft responses.
- **Firecrawl** → Pull answers from company docs/FAQ.
- **Better-Auth** → Authentication + roles (customers vs. agents).
- **Vapi** → Voice ticketing (Pro feature).
- **Autumn** → Monetization + plan upgrades.
- **Next.js + React** → App framework and frontend.
- **TailwindCSS + shadcn/ui** → Styling and UI components.

---

## ⚡ Demo Flow (Judge Walkthrough)

### 1. Core MVP (Convex + Resend)
- Judge submits a **text ticket** through form.
- Agent dashboard updates in real-time.
- Judge receives a “Ticket received” email.
 - Judge visits **My Tickets** and sees the new ticket with status/priority.

### 2. AI Enhancements (OpenAI + Firecrawl)
- New ticket comes in → auto-tagged as "Urgent – Billing."
- Suggested AI reply is drafted.
- **Knowledge Base**: Pre-scraped Convex, Resend, and Firecrawl docs provide context.
- AI reply enriched with relevant snippets from official documentation.
- Agent sees AI-powered suggestions with "Upgrade to Pro" upsell.
 - Once sent, AI responses appear in the conversation thread visible to both agents and customers.
 - Customer opens **Ticket Detail** to view live status and conversation timeline.

### 3. Auth & Roles (Better-Auth)
- Judge logs in as **customer** → sees ticket history.
- Switches to **agent** → sees team dashboard and ticket assignments.
 - Customer Portal includes:
   - **My Tickets** list with filters, status, priority, last updated.
   - **Ticket Detail** with conversation thread and AI summary.
   - **Real-time updates** via Convex subscriptions for status/messages.

### 4. Monetization Moment (Autumn + Vapi)
- Free plan: text-only ticket submission.
- Judge clicks **Upgrade to Pro** in-app → Autumn checkout flow.
- Upgrade succeeds → Vapi voice ticketing unlocks instantly.
- Judge speaks into mic: “I need help with my order.”
- Voice transcribed into a new ticket, email confirmation sent.

---

## 🎬 Big Demo Reveal
**“See how Autumn unlocks premium voice ticketing in one click? That’s the future of customer support.”**

---

## ✅ Why This Order Works
- Core works first → stable foundation.
- AI layered in → instant delight.
- Auth → real SaaS feel.
- Autumn unlock → cinematic finale.

---

## 🔧 Customer Portal Enhancements (Robustness)
- **My Tickets page**: List all customer tickets with status, priority, created/updated times.
- **Ticket Detail page**: Full conversation thread including customer messages, agent manual replies, and AI responses, plus AI summary.
- **Agent replies**: Agents can send manual replies independent of AI suggestions/drafts.
- **Real-time**: Live status and message updates using Convex subscriptions.
- **Access control**: Only ticket owners can view their tickets and conversations.
- **Email parity**: In-app views mirror email updates for consistency.

---

## 🧱 Development Order
1. Next.js + Convex backend + dashboard (+ Customer Portal: My Tickets + Ticket Detail).
2. Resend email triggers.
3. OpenAI categorization + draft replies.
4. Firecrawl knowledge base setup.
5. Better-Auth roles & login flows.
6. Autumn Pro plan integration.
7. Vapi voice ticketing unlock.
8. (Stretch) Analytics dashboard.

