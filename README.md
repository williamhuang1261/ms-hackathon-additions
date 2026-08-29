# Shield of Athena — Donation Platform

A full donation funnel built for a nonprofit domestic-violence shelter (**Shield of Athena**), built at MS Hackathon. Landing page → donation flow → post-donation experience, with a generated PDF impact certificate and a personalized SVG "thank you" sticker.

## What it does

- **Landing page** — problem statement, survivor story carousel, solution overview, a live donor wall, and a progress bar toward a monthly goal
- **Donation flow** (`/donate`) — tiered one-time/monthly amounts with impact-framed upsells (e.g. "Add $15 — feed her tomorrow"), and a mock multi-method payment modal (card / Apple Pay / Google Pay / PayPal)
- **Post-donation experience** — a dynamically generated PDF impact certificate across 5 donor tiers (Supporter → Changemaker, each with its own gold/navy/cream/platinum design), a thank-you page with donor wall and share section, and `/api/emoji`: a procedurally generated, seeded SVG "blossom" sticker as a personalized thank-you gift
- **10-language i18n** (en, fr, es, it, hy, ru, el, bn, fa, ar) via `next-intl` and locale-based routing

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · `next-intl` · `framer-motion` · `recharts` · `pdf-lib` · `canvas-confetti` · `embla-carousel-react`

## Notable implementation details

- Multi-tier PDF certificate generation with per-tier art, built with `pdf-lib`
- Seeded-PRNG SVG art generation for the personalized sticker API route
- Animated donor wall and live progress visualizations
- Donation psychology baked into the UX: impact-framed tiers, contextual upsells, real-time social proof

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Scope note

This is a hackathon prototype focused on frontend/UX: payments are mocked client-side (no real payment gateway), and donor/donation data is not persisted (no database — demo data lives in `lib/fakeDonors.ts`).
