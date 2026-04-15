import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { DESIGN_SYSTEM } from "./lib/design-system";

config({ path: resolve(__dirname, "../../.env") });

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview";
const OUT_DIR = resolve(__dirname, "../../docs/block-references");
const CONCURRENCY = 4;

type Block = { name: string; prompt: string };

const BLOCKS: Block[] = [
  {
    name: "01_StickyCountdownBar",
    prompt: `Fixed top bar, full width, 56px tall. Horizontal gradient from teal #0D9488 left to amber #F59E0B right. Left: white uppercase bold label "ADHD PARENTING SUMMIT 2026 STARTS IN". Center: four countdown blocks DAYS : HOURS : MINUTES : SECONDS — each a small white/10 rounded rect with big white Montserrat 800 tabular digits and tiny uppercase unit label beneath. Right: amber pill CTA "Claim Free Ticket →" with dark text. Subtle drop shadow under the bar. Ghost page content faintly visible below for context. Desktop viewport.`,
  },
  {
    name: "02_HeroWithCountdown",
    prompt: `Hero section, 1440×720, white background. Two columns. Left column: eyebrow teal pill "FREE VIRTUAL SUMMIT · MAR 3-7 2026", huge Montserrat 800 headline "Parenting a Child With ADHD Just Got Easier", body paragraph in Source Sans 3, dual CTAs (primary solid teal "GET INSTANT ACCESS", secondary outlined teal "Claim FREE ticket"), trust line "73,124 parents already registered". Right column: large card with massive countdown DAYS:HOURS:MINUTES:SECONDS in teal Montserrat 800 tabular digits, event dates below, amber "LIMITED SPOTS" chip. Warm, calm, supportive.`,
  },
  {
    name: "03_SocialProofBadge",
    prompt: `Single narrow band section, teal-50 #F0FDFA background, 1440×140. Centered horizontal group: circular stack of 5 overlapping parent avatar photos with white rings, then bold text "Loved by 73,124 committed parents" in dark charcoal Montserrat 700, then 5 amber stars. Generous padding, no borders.`,
  },
  {
    name: "04_LogoStripCarousel",
    prompt: `Full-width section, white background, 1440×220. Small uppercase eyebrow centered "AS FEATURED IN" in grey Montserrat 600 with tracking. Below: horizontal row of 12 greyscale wordmark logos evenly spaced (fictional publications like "Parenting Today", "Family Health Weekly", "Mindful Mag", "ADHD Digest" etc.), all rendered in medium grey, same visual weight, with subtle fade at left and right edges suggesting carousel.`,
  },
  {
    name: "05_StatsBar3Item",
    prompt: `Full-width section, white background, 1440×240, 3 equal columns divided by thin vertical teal lines. Each column centered: huge teal Montserrat 800 number on top, small uppercase label below in grey Source Sans. Column 1: "5" / "DAYS OF LIVE SESSIONS". Column 2: "40+" / "WORLD-CLASS SPEAKERS". Column 3: "50,000+" / "PARENTS ATTENDED". Generous vertical padding.`,
  },
  {
    name: "06_FeatureWithImage",
    prompt: `Two-column section, 1440×560, teal-50 #F0FDFA background. Left column (60%): eyebrow "WHAT IS THIS?", big Montserrat 800 headline "What is ADHD Parenting Summit 2026?", 3 short body paragraphs in Source Sans 3, teal CTA button "Reserve Your Free Seat". Right column (40%): warm photograph of a parent and child smiling during homework, rounded 12px corners with soft shadow. Vertical alignment centered.`,
  },
  {
    name: "07_SpeakerGridDay",
    prompt: `Section, 1440×700, white background. Top: small pill chip "DAY 1" in teal with white text, centered. Below: large Montserrat 800 headline "Understanding Your Child's Brain". Below: responsive grid of 8 circular speaker cards (2 rows × 4 cols). Each card: circular photo with 4px white ring and faint purple glow, speaker name in Montserrat 700 centered, specialty line in small Source Sans grey. Warm natural light in all portraits. Generous spacing.`,
  },
  {
    name: "08_LearningOutcomes",
    prompt: `Section, 1440×720, white background. Eyebrow "WHAT YOU'LL LEARN" centered, then big Montserrat 800 headline "Six Transformations By The End Of Day 5". Below: 3×2 grid of 6 cards. Each card 12px radius white with subtle shadow, containing: teal circular icon at top (target, users, book, lightning bolt, heart, message bubble — one per card), bold card title Montserrat 700, 2-line description in Source Sans grey. Consistent card heights.`,
  },
  {
    name: "09_BonusStack",
    prompt: `Section, 1440×640, teal-50 background. Centered eyebrow "PLUS FREE BONUSES" in amber. Headline "Three Bonuses Worth $291 — Yours Free". Below: 3 bonus cards side by side. Each card: white 12px radius with amber top-left chip showing "$97 VALUE" in amber pill, bold card title, bonus description, small teal checkmark bullets listing what's included. Below the 3 cards: centered solid teal CTA button "Claim All Bonuses Free".`,
  },
  {
    name: "10_FoundersSection",
    prompt: `Section, 1440×560, white background. Centered eyebrow "FROM THE FOUNDERS". Two-column layout. Left: two circular founder portraits side by side with white rings and subtle teal glow, names and titles below ("Dr. Maya Chen, Child Psychologist" and "James Rivera, Parent Educator"). Right: heartfelt founder letter body text in Source Sans 3, signed off with handwritten-style names, then teal CTA "Join Us Live".`,
  },
  {
    name: "11_VideoTestimonialSection",
    prompt: `Section, 1440×620, teal-50 background. Centered eyebrow "PARENTS SHARE THEIR STORIES" and headline "Real Families, Real Results". Below: 2 large video thumbnails side by side (16:9, rounded 12px). Each thumbnail shows a warm portrait of a parent with a soft teal play-button overlay centered and speaker name + child's age caption beneath.`,
  },
  {
    name: "12_TestimonialCarousel",
    prompt: `Section, 1440×520, white background. Eyebrow "WHAT PARENTS SAY" centered, headline "73,124 Parents. One Common Theme.". Below: 3 visible testimonial quote cards (of 6 total) side by side with large left and right chevron arrows at far edges. Each card: 12px radius, soft shadow, 5 amber stars at top, quote in Source Sans italic, small circular parent avatar with name and city beneath. Middle card slightly elevated/highlighted.`,
  },
  {
    name: "13_WhyThisMattersStats",
    prompt: `Section, 1440×640, teal-50 background. Eyebrow "WHY THIS MATTERS" centered, headline "The Reality of ADHD in Families Today". Below: 3×2 grid of 6 stat cells, no card chrome, just icons and numbers. Each cell: small teal line icon at top, huge teal Montserrat 800 percentage or number below (like "1 in 9", "74%", "3.2×"), short descriptive caption in grey beneath. Dividers: faint dotted lines between cells.`,
  },
  {
    name: "14_BenefitsGrid",
    prompt: `Section, 1440×520, white background. Eyebrow "WHY ATTEND", headline "Five Reasons This Summit Is Different". Below: 5-column row of benefit items, no card chrome. Each item centered: inline accent-colored icon (teal star, amber clock, teal globe, amber sparkles, teal check-circle), bold title Montserrat 700, 2-line description in Source Sans grey. Flows into the background.`,
  },
  {
    name: "15_BenefitsWithImages",
    prompt: `Section, 1440×900, teal-50 background. Two alternating image+text rows. Row 1: photo left (parent calmly helping a child with a task), text right (bold headline "Calm Your Morning Routine In 7 Days", body paragraph, 3 teal bullet points). Row 2: text left (headline "Turn Meltdowns Into Breakthroughs"), photo right (warm moment of a parent hugging a child). Rounded 12px photos with soft shadows, generous vertical spacing.`,
  },
  {
    name: "16_NumberedReasons",
    prompt: `Section, 1440×780, white background. Eyebrow "FIVE BIG SHIFTS", headline "What Changes By Day 5". Below: 5 vertically stacked rows. Each row: huge teal Montserrat 800 numeral ("01".."05") left-aligned taking ~25% width, then title Montserrat 700 and 2-line body Source Sans on the right. Faint horizontal divider between rows.`,
  },
  {
    name: "17_ClosingCTAWithList",
    prompt: `Section, 1440×620, gradient panel from teal #0D9488 to deeper teal #0F766E, rounded 24px, with white text. Centered big Montserrat 800 headline "Your Free Seat Is Waiting" in white. Below: 2-column list of 6 amber chip bullets (each chip is a small amber rounded pill with white check icon) each stating a benefit like "All 40+ sessions free", "Lifetime recordings", "3 free bonuses", etc. Below: massive amber CTA button "CLAIM MY FREE TICKET →" in Montserrat 800 uppercase.`,
  },
  {
    name: "18_FAQAccordion",
    prompt: `Section, 1440×720, white background. Eyebrow "QUESTIONS PARENTS ASK", headline "Frequently Asked Questions". Below: single-column stack of 10 FAQ rows, centered at ~760px wide. Each row: question text in Montserrat 700, right-aligned teal chevron icon pointing down, faint bottom divider. The first row is open, showing its answer in grey Source Sans paragraph below the question. Remaining 9 are closed.`,
  },
  {
    name: "19_OptinFormBlock",
    prompt: `Section, 1440×420, full-width solid teal #0D9488 panel with white text. Centered Montserrat 800 headline "Save Your Free Seat Now" in white. Below: inline form with 3 horizontal fields — "First Name" text input (white background, rounded 12px), "Email Address" text input, amber pill CTA "GET INSTANT ACCESS →". Tiny white-50% text below "We respect your privacy. Unsubscribe anytime."`,
  },
  {
    name: "20_Footer",
    prompt: `Footer section, 1440×280, dark teal #134E4A background with white-70% text. Left: logo mark and tagline "ADHD Parenting Summit — parenting you can rely on.". Right: 3 text links "Privacy", "Terms", "Contact". Below in small white-50% text: "March 3-7, 2026 · © 2026 Althea Academy · All rights reserved.". Thin white-10% top border separating footer from page.`,
  },
];

type GenResult = { name: string; ok: boolean; bytes?: number; error?: string };

async function generateOne(ai: GoogleGenAI, block: Block): Promise<GenResult> {
  const outPath = resolve(OUT_DIR, `${block.name}.png`);
  if (existsSync(outPath)) {
    return { name: block.name, ok: true, bytes: 0, error: "skipped (exists)" };
  }
  const fullPrompt = `${DESIGN_SYSTEM}\n\n${block.prompt}\n\nRender as a high-fidelity desktop UI mockup, no real brand logos, no copyrighted imagery.`;
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: fullPrompt,
    });
    const parts = res.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
    if (!imgPart?.inlineData?.data) {
      const text = parts.find((p) => p.text)?.text ?? "no image and no text returned";
      return { name: block.name, ok: false, error: `no image part. response: ${text.slice(0, 200)}` };
    }
    const buf = Buffer.from(imgPart.inlineData.data, "base64");
    writeFileSync(outPath, buf);
    return { name: block.name, ok: true, bytes: buf.byteLength };
  } catch (err) {
    return { name: block.name, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function runPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY missing from .env");
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
  const target = only ? BLOCKS.filter((b) => b.name.includes(only)) : BLOCKS;
  if (target.length === 0) {
    console.error(`No blocks match --only=${only}`);
    process.exit(1);
  }

  console.log(`Model: ${MODEL}`);
  console.log(`Blocks: ${target.length}, concurrency: ${CONCURRENCY}`);
  console.log(`Output: ${OUT_DIR}\n`);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const started = Date.now();
  const results = await runPool(target, CONCURRENCY, (b) => {
    console.log(`→ ${b.name}`);
    return generateOne(ai, b).then((r) => {
      const status = r.ok ? (r.bytes ? `✓ ${Math.round(r.bytes / 1024)}KB` : "↷ skipped") : `✗ ${r.error}`;
      console.log(`   ${r.name}: ${status}`);
      return r;
    });
  });

  const ok = results.filter((r) => r.ok && r.bytes).length;
  const skipped = results.filter((r) => r.ok && !r.bytes).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\nDone in ${Math.round((Date.now() - started) / 1000)}s — ${ok} generated, ${skipped} skipped, ${failed.length} failed.`);
  if (failed.length > 0) {
    console.log("\nFailures:");
    for (const f of failed) console.log(`  ${f.name}: ${f.error}`);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
