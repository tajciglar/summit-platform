---
created: 2026-04-29T07:58:19
title: Integrate Microsoft Clarity for real-user CRO data
area: general
files:
  - next-app/src/app/layout.tsx
---

## Problem

We need real-user CRO signal (heatmaps, session recordings, rage-click detection) on generated funnel pages. LLM-as-judge can score pages pre-publish but can't tell us what actually converts. Microsoft Clarity is free, one script tag, and gives session recordings + rage-click + dead-click detection across the funnel (optin → sales → checkout).

## Solution

- Drop the Clarity script into the Next.js root layout (`next-app/src/app/layout.tsx`) gated by env var so it only fires in production.
- Decide scope: single global Clarity project vs per-Domain project ID. Likely start global, add per-Domain override later if operators want their own dashboards.
- Store project ID in env (`NEXT_PUBLIC_CLARITY_PROJECT_ID`) initially; if per-Domain, expose on the Domain model + pass through resolved-funnel API payload.
- Verify sessions stitch across funnel steps (optin → sales → WP checkout redirect) — Clarity tracks per-domain, so cross-domain hops to WP checkout will not be captured. Document this gap.
- Add a tiny doc note in CLAUDE.md / docs explaining how to read Clarity for a given funnel.
