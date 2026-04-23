# Future MVPs — Brainstorm & Ranking

**Date:** 2026-04-23
**Purpose:** Catalog candidate MVPs for the next 3–12 months across AI, automation, products, analytics, and business model. Each idea includes a visual/UX sketch and a composite ranking.

---

## How ideas are ranked

Each idea is scored 1–5 on three axes, then combined.

| Axis | Meaning |
|---|---|
| **Impact** | Revenue, retention, or moat created if it works |
| **Effort** | Build cost — *inverted* in score (5 = cheap, 1 = huge) |
| **Fit** | Alignment with current AI-funnel-builder direction & existing infra |

**Composite = Impact + Effort + Fit (max 15).** Tier:
- **S (13–15)** Do next
- **A (10–12)** Strong candidates
- **B (7–9)** Worth doing eventually
- **C (≤6)** Park / revisit later

A short rationale follows each idea so the score is debatable, not authoritative.

---

# Tier S — Do Next

## 1. Per-section regenerate with prompt input

**Score: 5 + 4 + 5 = 14 (S)**

Operator opens any section, types "make this punchier and add urgency," gets 3 variants in-place. No full-page regenerate.

**Why this wins:** It's the highest-leverage UX upgrade for the AI funnel builder you've already shipped. Today regeneration is all-or-nothing — this turns AI from a one-shot generator into an editing partner. Memory already lists this as a queued idea.

```
┌─────────────────────────────────────────────────────┐
│  ▼ Section: Hero                       [⚡ Regenerate]│
├─────────────────────────────────────────────────────┤
│   "Join 5,000+ parents at the 2026 ADHD Summit"     │
│                                                      │
│   ┌────────────────────────────────────────────┐    │
│   │ 💬 Make headline more urgent, mention free │    │
│   │    bonus expires Friday                    │    │
│   └────────────────────────────────────────────┘    │
│                                    [Generate 3 ▶]   │
│                                                      │
│   ○ Variant A: "Friday only: Free ADHD…"            │
│   ● Variant B: "Last chance — 5,000 parents…"       │
│   ○ Variant C: "Don't miss it: ADHD strategies…"    │
│                                  [Apply selected]    │
└─────────────────────────────────────────────────────┘
```

---

## 2. AI A/B variant generator + auto-split

**Score: 5 + 3 + 5 = 13 (S)**

One click → AI produces 2–3 variants of a headline/CTA/hero image. Platform auto-splits traffic, tracks conversion, declares a winner after N visits.

**Why:** Operators don't run A/B tests because tooling is annoying. If the platform does it natively with AI generating the variants, every funnel improves passively. Combines well with #1.

```
┌──────────────────────────────────────────┐
│  Hero CTA  →  [Run A/B test ✨]           │
├──────────────────────────────────────────┤
│  A  "Save my seat"           48% — 312v  │
│  B  "Get instant access"     52% — 318v  │ ← winning
│  C  "Join free now"          —            │ paused
│                                           │
│  ▓▓▓▓▓▓▓▓▓░░░  73% confidence            │
│  Auto-promote winner at 95%? ✓            │
└──────────────────────────────────────────┘
```

---

## 3. AutomateWoo-style AC rules engine

**Score: 4 + 4 + 5 = 13 (S)**

Already in memory as queued. UI lets operators define: *"When optin on funnel X → tag 'lead-X' + add to list 42 + start campaign 'nurture-X' after 1h."* Visual rule builder, no code.

**Why:** Replaces manual AC config that breaks constantly. Every operator hits this. Builds on existing AC integration. Foundation for future automations (refunds, abandoned carts, replay unlocks).

```
WHEN  [Optin submitted ▼]   on  [Funnel: ADHD-2026 ▼]
─────────────────────────────────────────────────────
DO    [+] Add tag         "adhd-2026-lead"
      [+] Add to list     "ADHD Parents 2026"
      [+] Wait            1 hour
      [+] Start campaign  "Pre-summit nurture"
─────────────────────────────────────────────────────
                            [Test rule] [Save & enable]
```

---

# Tier A — Strong Candidates

## 4. Bump/upsell editor v2 (split-pane preview)

**Score: 4 + 3 + 5 = 12 (A)**

Already planned in memory. Edit bump copy/price on left, see live checkout preview on right with the bump in context.

**Why:** Bumps are where the money is on summits, and current editing is blind. High operator value, contained scope, blocked only on a few prerequisites you already noted.

```
┌─────────────────┬──────────────────────────────┐
│ EDITOR          │  LIVE PREVIEW                │
├─────────────────┼──────────────────────────────┤
│ Headline        │   ┌─ Order Summary ────────┐ │
│ [VIP Pass +$27] │   │  Free Pass        $0   │ │
│                 │   │  ☑ VIP Pass     +$27   │ │
│ Subhead         │   │  ─────────────────     │ │
│ [Lifetime acc…] │   │  Total           $27   │ │
│                 │   └────────────────────────┘ │
│ Price [27]      │                              │
│ Color [orange▼] │   [Complete order →]         │
└─────────────────┴──────────────────────────────┘
```

---

## 5. Replay portal (gated post-summit library)

**Score: 5 + 2 + 4 = 11 (A)**

After the live event, attendees access videos in a branded portal. Free tier sees N days; VIP buyers get lifetime + downloads + bonuses. Comments + completion tracking.

**Why:** Massive retention + upsell driver — replay access is the #1 thing summits sell post-event. Big build (auth, video infra, comments) but unlocks a recurring revenue surface. The infra investment also enables idea #6.

```
┌──────────────────────────────────────────────────┐
│  ADHD Summit 2026 — Replays                      │
│  Welcome back, Sarah ·  3/12 watched             │
├──────────────────────────────────────────────────┤
│  ┌────────┐ Day 1 — Dr. Russell Barkley          │
│  │ ▶ 42m  │ "Executive function in adults" ✓     │
│  └────────┘                          ⬇ Slides    │
│                                                   │
│  ┌────────┐ Day 1 — Dr. Edward Hallowell  🔒 VIP │
│  │ ▶ 38m  │ "ADHD as a strength"                 │
│  └────────┘                  [Unlock with VIP]   │
└──────────────────────────────────────────────────┘
```

---

## 6. Speaker portal (self-serve)

**Score: 4 + 3 + 4 = 11 (A)**

Speakers log in, upload bio + headshot + slides + promo swipe copy, get unique tracking links and a commission dashboard.

**Why:** Removes the #1 operator chore (chasing speakers for assets). Speakers love seeing their own conversion stats. Foundation for affiliate marketplace (#10).

```
┌─────────────────────────────────────────┐
│  Hi Dr. Barkley — ADHD Summit 2026     │
├─────────────────────────────────────────┤
│  ✅ Bio submitted                       │
│  ✅ Headshot                            │
│  ⚠️ Slides — due Apr 28 (5 days)       │
│  ⚠️ Promo email swipe — not started    │
│                                          │
│  Your tracking link                      │
│  althea.com/adhd-2026?s=barkley  📋     │
│                                          │
│  Performance                             │
│  Clicks  1,247   Optins  312  $ $1,890 │
└─────────────────────────────────────────┘
```

---

## 7. AI insights ("your optin rate dropped 12%")

**Score: 4 + 3 + 4 = 11 (A)**

Daily/weekly digest where Claude analyzes funnel metrics and writes plain-language observations + suggested actions.

**Why:** Turns dashboard data into action. Cheap to add on top of existing analytics. High perceived intelligence per dollar of API spend. Differentiator vs. generic funnel builders.

```
┌─────────────────────────────────────────────────┐
│  📊 Weekly insight — Apr 17–23                  │
├─────────────────────────────────────────────────┤
│  ⚠️ Optin rate on adhd-2026 dropped 12% Tue.    │
│     Likely cause: Facebook ad set #4 sent       │
│     mismatched-audience traffic (CTR up,        │
│     conversion down).                            │
│                                                  │
│     Suggested:                                   │
│     • Pause ad set #4                            │
│     • Try variant B headline (+8% in test)      │
│                                                  │
│  ✅ VIP upsell take-rate hit 18% (+3% wow)      │
│     "Lifetime" framing in bump v3 working.      │
└─────────────────────────────────────────────────┘
```

---

## 8. Buyer/attendee dashboard (cross-summit)

**Score: 4 + 3 + 3 = 10 (A)**

Buyer logs in once, sees every summit they've joined across operators on the platform. Downloads, bonuses, replay access centralized.

**Why:** Network effect — buyers come back to *the platform*, not just one summit. Long-term moat. Mid effort, but unlocks a real B2C surface.

---

## 9. AI voice match (operator tone calibration)

**Score: 4 + 4 + 4 = 12 (A)**

Operator pastes 2–3 of their past emails or social posts. AI extracts a tone profile (vocabulary, sentence rhythm, emoji use, formality). All future generated copy matches.

**Why:** Cheapest differentiator vs. "generic AI funnel builder." Eliminates the #1 complaint about AI copy ("doesn't sound like me"). Tiny build on top of existing prompt pipeline.

```
┌─────────────────────────────────────────┐
│  Train your voice                        │
├─────────────────────────────────────────┤
│  Paste 2–3 past emails or posts:         │
│  ┌─────────────────────────────────┐    │
│  │ Hey friend, real talk — I almost │    │
│  │ canceled this summit last week…  │    │
│  └─────────────────────────────────┘    │
│  [+ Add another sample]                  │
│                                          │
│  Detected tone                           │
│  • Warm, conversational                  │
│  • Frequent rhetorical questions         │
│  • Light emoji (✨ 🙌)                   │
│  • Mid-length sentences                  │
│                                          │
│  ☑ Apply to all future generations       │
└─────────────────────────────────────────┘
```

---

# Tier B — Worth doing eventually

## 10. Affiliate marketplace
**Score: 4 + 2 + 3 = 9 (B)** — Connect operators with proven affiliates. Big network play. Requires #6 first. Two-sided market is hard to bootstrap.

## 11. Template marketplace
**Score: 3 + 3 + 3 = 9 (B)** — Operators sell proven templates to each other. Catalog architecture already supports it. Revenue split UX + curation overhead.

## 12. Native email broadcast tool
**Score: 3 + 2 + 3 = 8 (B)** — Replace Brevo UI dependency. Significant infra (deliverability, suppression, compliance). Probably not worth it until scale forces it.

## 13. Heatmaps + session replay
**Score: 3 + 5 + 1 = 9 (B)** — Just integrate Microsoft Clarity (free, 1 day). Low strategic fit but trivial value-add.

## 14. Refund + chargeback automation
**Score: 3 + 4 + 2 = 9 (B)** — Already on remaining-work list. More plumbing than product, but unblocks scale.

## 15. White-label / agency tier
**Score: 4 + 2 + 3 = 9 (B)** — Agencies running summits for clients. Pricing power is huge but requires multi-tenant theming, sub-account roles, billing. Wait until 50+ paying operators.

## 16. AI-generated email sequences
**Score: 4 + 3 + 2 = 9 (B)** — Generate full pre-summit + post-purchase sequences. Cool but requires deep AC/Brevo integration to be useful end-to-end. Better after #3 lands.

---

# Tier C — Park / revisit later

## 17. Done-for-you AI agency mode
**Score: 5 + 1 + 2 = 8 (C)** — *"Type a topic, get a complete summit."* Highest ceiling, biggest build. Needs everything else mature first. Roadmap aspiration, not next MVP.

## 18. Block marketplace (third-party devs)
**Score: 3 + 1 + 2 = 6 (C)** — Premature. Need 100+ operators before a developer ecosystem makes sense.

## 19. Multi-touch attribution model
**Score: 3 + 2 + 2 = 7 (C)** — Real value but operators barely use UTM today. Premature sophistication.

## 20. Free tier with platform branding
**Score: 3 + 4 + 2 = 9 (B)** *(borderline)* — Lead-gen mechanism. Requires confidence in the activation funnel first; otherwise it just floods support with low-intent users.

---

# Recommended sequencing

If you want a 3-ish month plan:

1. **#9 Voice match** — 1 week, immediate quality jump
2. **#1 Per-section regenerate** — 2 weeks, finishes the AI editing story
3. **#3 AC rules engine** — 3 weeks, eliminates a recurring operator chore
4. **#2 A/B variant generator** — 2 weeks, depends on #1 being in place
5. **#7 AI insights** — 1 week, sits on top of analytics you already have

That sequence is mostly additive on existing infra, ships visible value every 1–2 weeks, and sets up the bigger swings (#5 replay portal, #6 speaker portal) for the following quarter.

---

## Open questions for you

- **Time horizon** — does the 3-month sequence above match your runway, or are you optimizing for one big bet (e.g., replay portal) instead?
- **Audience** — these are ranked assuming the buyer is the *operator*. If you want to bias toward the *attendee/buyer* surface (#5, #8), the rankings shift.
- **Monetization** — are any of these gated tiers (Pro/Agency) or all included?
