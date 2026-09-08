# Shield of Athena — Donation Platform

A full donation funnel built for a nonprofit domestic-violence shelter (**Shield of Athena**), originally built at MS Hackathon. Landing page → donation flow → post-donation experience, with a generated PDF impact certificate, a personalized SVG "thank you" sticker, and a live-deployed, streamed AI thank-you message.

**This repo is a fork.** The original, [`MS-Hackathon`](https://github.com/williamhuang1261/MS-Hackathon), was built with a team at a Morgan Stanley internal hackathon. Everything up to and including the original README is that team's work. Everything described under "Vercel deployment" and "AI thank-you message" below was added solo, in this fork, so the team's original repo and commit history stay untouched.

## Live demo

**https://temporary-flying-carbon-bk0t1bs.vercel.app**

Deployed with `vercel deploy --temporary`, which does not require Vercel login. This means it is an anonymous deployment that expires a short time after creation unless claimed under a real Vercel account (`vercel login` + redeploy, or via Vercel's claim link). Treat the URL above as a point-in-time demo, not a permanent address.

## What it does

- **Landing page** — problem statement, survivor story carousel, solution overview, a live donor wall, and a progress bar toward a monthly goal
- **Donation flow** (`/donate`) — tiered one-time/monthly amounts with impact-framed upsells (e.g. "Add $15 — feed her tomorrow"), and a mock multi-method payment modal (card / Apple Pay / Google Pay / PayPal)
- **Post-donation experience** — a dynamically generated PDF impact certificate across 5 donor tiers (Supporter → Changemaker, each with its own gold/navy/cream/platinum design), a thank-you page with donor wall and share section, `/api/emoji` (a procedurally generated, seeded SVG "blossom" sticker), and a streamed, personalized AI thank-you message
- **10-language i18n** (en, fr, es, it, hy, ru, el, bn, fa, ar) via `next-intl` and locale-based routing

## AI thank-you message

`/api/thanks` uses the [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` + `@ai-sdk/google`) to generate a short, personalized thank-you message for each donor with Google's Gemini model, streamed token-by-token into the thank-you page.

If no `GOOGLE_GENERATIVE_AI_API_KEY` is configured (the default on a fresh clone, and on the live demo above), the route serves a deterministic fallback message instead of failing the request — the same route, the same response shape, the same UI, just without a live model call. Get a free key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and set it as an environment variable to activate real generation:

```bash
curl -s -X POST https://temporary-flying-carbon-bk0t1bs.vercel.app/api/thanks \
  -H "Content-Type: application/json" \
  -d '{"donorName":"Test Donor","amount":25}'
# => "Every dollar counts, and yours just counted for someone in crisis,
#     Test Donor. $25 well spent on courage." (fallback path, no key set)
```

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · `next-intl` · `framer-motion` · `recharts` · `pdf-lib` · `canvas-confetti` · `embla-carousel-react` · Vercel AI SDK (`ai`, `@ai-sdk/google`) · deployed on Vercel

## Notable implementation details

- Multi-tier PDF certificate generation with per-tier art, built with `pdf-lib`
- Seeded-PRNG SVG art generation for the personalized sticker API route
- Animated donor wall and live progress visualizations
- Donation psychology baked into the UX: impact-framed tiers, contextual upsells, real-time social proof
- `/api/thanks` streams its response over plain HTTP (`ReadableStream`) so the same client code reads a real model stream or the deterministic fallback identically

## Running locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Copy `.env.example` to `.env.local` and add a real `GOOGLE_GENERATIVE_AI_API_KEY` to see the live-model path instead of the fallback.

## Engineering notes

**The fallback isn't a demo crutch, it's the actual design.** `/api/thanks` never throws just because a model call fails or a key is missing — it degrades to a deterministic message with the identical response shape, so the UI never has to know which path it got. That's a smaller version of the fail-closed dispatch pattern used elsewhere in this candidate's portfolio (see `mortality-copilot`): prefer a visibly labeled fallback over a broken feature or a silent lie about what generated the text.

**Getting to a working deployment was its own debugging exercise.** The first `vercel deploy` attempt failed outright: Vercel's platform rejected `next@16.0.3` as a known-vulnerable version before even attempting a build. Upgrading to `16.3.4` fixed that, but exposed a second, unrelated failure: Vercel now refuses the Edge Runtime for new deployments entirely ("The Edge runtime is deprecated"), first for the new `/api/thanks` route, then again for `middleware.ts` after that was fixed. The middleware failure took an extra step to root-cause: Next.js 16 quietly renamed the `middleware.ts` convention to `proxy.ts`, which defaults to the Node.js runtime automatically — a rename, not a bug, and the real fix. Three separate platform-side failures, three separate root causes, found by reading the actual error each time rather than guessing.

## Scope note

This is a hackathon prototype focused on frontend/UX: payments are mocked client-side (no real payment gateway), and donor/donation data is not persisted (no database — demo data lives in `lib/fakeDonors.ts`). The AI thank-you message is English-only; the other 9 locales get the same English-language generated text (a stated gap, not a bug — full translation of dynamically generated text was out of scope for this addition).
