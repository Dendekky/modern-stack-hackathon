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

### 2. AI Enhancements (OpenAI + Firecrawl)
- New ticket comes in → auto-tagged as "Urgent – Billing."
- Suggested AI reply is drafted.
- **Knowledge Base**: Pre-scraped Convex, Resend, and Firecrawl docs provide context.
- AI reply enriched with relevant snippets from official documentation.
- Agent sees AI-powered suggestions with "Upgrade to Pro" upsell.

### 3. Auth & Roles (Better-Auth)
- Judge logs in as **customer** → sees ticket history.
- Switches to **agent** → sees team dashboard and ticket assignments.

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

