# GiGi Energy Drink

[![Live site](https://img.shields.io/badge/live-gigiflavours.vercel.app-brightgreen)](https://gigiflavours.vercel.app)
![Next.js](https://img.shields.io/badge/next.js-14-black)
![Tailwind CSS](https://img.shields.io/badge/tailwind-v4-blue)
![Framer Motion](https://img.shields.io/badge/motion-framer--motion-purple)

A bold, premium energy-drink landing page built for a Gen Z audience.
Dark theme, electric-lime accents, buttery smooth scrolling, and
micro-animations throughout.

**Live:** [gigiflavours.vercel.app](https://gigiflavours.vercel.app)

---

## Highlights

- **Smooth scrolling** — Lenis-powered glide with tuned easing
- **Motion design** — spring parallax, staggered reveals, 3D tilt cards, magnetic hovers
- **Flavor carousel** — product showcase with per-flavor background transitions
- **Bento grid** — formula & benefits cards with mouse-tracking shine
- **Glassmorphism nav** — sticky header with blur that transforms on scroll
- **Mobile-first** — fully responsive on every screen size

---

## Sections

1. Hero with parallax product imagery and animated badges
2. Interactive flavor carousel
3. Formula & benefits bento grid
4. Brand activation cards
5. Social feed
6. Newsletter signup + footer

---

## Tech stack

| Layer | Choice |
|-------|--------|
| App | Next.js 14 (App Router) + React + TypeScript |
| Styling | Tailwind CSS v4 |
| Motion | Framer Motion + Lenis smooth scroll |

---

## Local development

```bash
git clone https://github.com/myk02/drink.git
cd drink
npm install
npm run dev
```

Other commands:

```bash
npm run build   # production build
npm run lint    # eslint
npm start       # serve production build
```

## Deployment notes (Vercel + Convex)

`NEXT_PUBLIC_CONVEX_URL` is baked into the client bundle at build time, so the
Vercel project's env var must point at a **live** Convex deployment. If the
shop shows an endless spinner with `0` product counts, the deployed site is
talking to a deleted/stale deployment.

**2026-10-01 incident:** the Vercel env var pointed at a deleted deployment
(`happy-otter-123`), so the live shop showed 0 products forever. Fix: in
Vercel → gigi → Settings → Environment Variables, set
`NEXT_PUBLIC_CONVEX_URL=https://judicious-meadowlark-323.convex.cloud` (and
`NEXT_PUBLIC_CONVEX_SITE_URL=https://judicious-meadowlark-323.convex.site`),
then redeploy. Verify a deployment's functions/URL with
`npx convex function-spec` or by curling `<url>/api/query`.

---

Built by [Mike Waitindi](https://mikeships.vercel.app).
