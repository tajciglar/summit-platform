import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../../.env") });

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview";
const OUT_PATH = resolve(__dirname, "../../docs/block-references/00_FullPageComposite.png");

const PROMPT = `
Render a high-fidelity full-page desktop landing page mockup for "ADHD Parenting Summit 2026" — a free virtual summit for parents of children with ADHD, running March 3-7, 2026. Single tall image, 1440px wide, composed top-to-bottom as one continuous scrolling page. Warm, trustworthy, supportive mood — exhausted parent audience, calm not salesy.

DESIGN SYSTEM (must be honored throughout):
- Primary teal #0D9488 (CTAs, headlines, key accents). Amber #F59E0B (countdown digits, urgency chips, bonus value tags). Purple #7C3AED (speaker photo ring glow).
- Alternating section backgrounds: white #FFFFFF and teal-50 #F0FDFA for visual rhythm.
- Headlines: Montserrat 700/800 tight tracking. Body: Source Sans 3 400/600 generous line height. Numbers: Montserrat 800 tabular-nums.
- Cards 12px radius, soft shadow, 1px #E5E7EB border. Buttons: solid teal primary or amber pill CTA. Section padding generous (96px vertical).

STACK THESE SECTIONS IN ORDER, each visually distinct, cohesive as one page:

1. Sticky top countdown bar (56px): gradient teal→amber, white label "ADHD PARENTING SUMMIT 2026 STARTS IN", 4 countdown digit blocks D:H:M:S, amber pill CTA "Claim Free Ticket →" on right.

2. Hero (white bg): Left — eyebrow teal pill "FREE VIRTUAL SUMMIT · MAR 3-7 2026", huge headline "Parenting a Child With ADHD Just Got Easier", paragraph, dual CTAs (solid teal "GET INSTANT ACCESS" + outlined teal "Claim FREE ticket"), trust line "73,124 parents registered". Right — large countdown card with massive teal digits, event dates, amber "LIMITED SPOTS" chip.

3. Social proof badge (teal-50 bg, narrow band): overlapping circular parent avatars, bold text "Loved by 73,124 committed parents", 5 amber stars.

4. Logo strip (white): small "AS FEATURED IN" eyebrow, 12 greyscale fictional publication wordmarks in a row with soft edge fade.

5. 3-stat bar (white): 3 columns divided by thin teal verticals — "5 / DAYS OF LIVE SESSIONS", "40+ / WORLD-CLASS SPEAKERS", "50,000+ / PARENTS ATTENDED".

6. Feature-with-image (teal-50): Left 60% eyebrow "WHAT IS THIS?", headline "What is ADHD Parenting Summit 2026?", 3 paragraphs, teal CTA "Reserve Your Free Seat". Right 40% warm photo of parent and child doing homework, rounded 12px.

7. Speaker grid Day 1 (white): teal "DAY 1" chip, headline "Understanding Your Child's Brain", 2×4 grid of 8 circular speaker portraits with 4px white rings + faint purple glow, names and specialties beneath.

8. Learning outcomes (white): eyebrow "WHAT YOU'LL LEARN", headline "Six Transformations By The End Of Day 5", 3×2 grid of 6 cards each with a teal circular icon (target, users, book, bolt, heart, message), title, 2-line body.

9. Bonus stack (teal-50): amber eyebrow "PLUS FREE BONUSES", headline "Three Bonuses Worth $291 — Yours Free", 3 bonus cards each with amber "$97 VALUE" chip, title, teal checkmark bullets. Centered teal CTA below "Claim All Bonuses Free".

10. Founders section (white): two circular founder portraits with teal glow, names and titles, heartfelt letter body, signed off, teal CTA "Join Us Live".

11. Video testimonials (teal-50): eyebrow "PARENTS SHARE THEIR STORIES", headline "Real Families, Real Results", 2 large 16:9 video thumbnails side by side with teal play-button overlays.

12. Testimonial carousel (white): eyebrow "WHAT PARENTS SAY", headline "73,124 Parents. One Common Theme.", 3 visible quote cards (middle elevated), each with 5 amber stars, italic quote, avatar + name + city. Left/right chevron arrows at edges.

13. Why this matters stats (teal-50): eyebrow "WHY THIS MATTERS", headline "The Reality of ADHD in Families Today", 3×2 grid of 6 stat cells (icon + huge teal numeral like "1 in 9", "74%", "3.2×" + caption).

14. Benefits grid (white): eyebrow "WHY ATTEND", headline "Five Reasons This Summit Is Different", 5-column row of inline icon benefit items (no card chrome).

15. Benefits with images (teal-50): 2 alternating image+text rows — row 1 photo-left headline-right ("Calm Your Morning Routine In 7 Days"), row 2 headline-left photo-right ("Turn Meltdowns Into Breakthroughs"), 3 teal bullets each.

16. Numbered reasons (white): eyebrow "FIVE BIG SHIFTS", headline "What Changes By Day 5", 5 stacked rows each with huge teal numeral 01–05 on left and title+body on right, faint dividers.

17. Closing CTA with list (teal gradient panel, white text): huge headline "Your Free Seat Is Waiting", 2-column list of 6 amber chip bullets with white checks, massive amber CTA button "CLAIM MY FREE TICKET →".

18. FAQ accordion (white): eyebrow "QUESTIONS PARENTS ASK", headline "Frequently Asked Questions", 10 FAQ rows (first expanded showing answer, rest collapsed with teal chevrons).

19. Optin form (solid teal panel, white text): headline "Save Your Free Seat Now", inline form with First Name + Email inputs + amber CTA pill "GET INSTANT ACCESS →", tiny privacy line.

20. Footer (dark teal #134E4A, white-70 text): logo + tagline "ADHD Parenting Summit — parenting you can rely on.", 3 links Privacy/Terms/Contact, copyright line "March 3-7, 2026 · © 2026 Althea Academy".

Produce a single tall cohesive mockup image showing all of the above sections stacked, desktop 1440px wide reference. No real brand logos. No copyrighted imagery. Warm photography with natural light.
`.trim();

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY missing from .env");
    process.exit(1);
  }
  mkdirSync(resolve(OUT_PATH, ".."), { recursive: true });
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const started = Date.now();
  console.log(`Model: ${MODEL}`);
  console.log(`Generating full-page composite → ${OUT_PATH}`);

  const res = await ai.models.generateContent({ model: MODEL, contents: PROMPT });
  const parts = res.candidates?.[0]?.content?.parts ?? [];
  const imgPart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
  if (!imgPart?.inlineData?.data) {
    const text = parts.find((p) => p.text)?.text ?? "no image, no text";
    console.error(`No image returned. Model said: ${text.slice(0, 500)}`);
    process.exit(2);
  }
  const buf = Buffer.from(imgPart.inlineData.data, "base64");
  writeFileSync(OUT_PATH, buf);
  console.log(`✓ ${Math.round(buf.byteLength / 1024)}KB in ${Math.round((Date.now() - started) / 1000)}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
