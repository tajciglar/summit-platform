/**
 * Seed Script — Summit Platform CMS
 *
 * Populates the database with an initial set of demo records useful for
 * local development and smoke-testing the CMS. The script is idempotent:
 * it checks for existing records by unique fields before creating them,
 * so it is safe to run multiple times.
 *
 * Usage:
 *   npm run seed
 *   # or directly:
 *   tsx scripts/seed.ts
 *
 * Seeded records:
 *   - SummitSite  : "Test Summit"
 *   - Product     : "Summit All-Access Pass"
 *   - Speaker     : "Dr. Jane Smith"
 *   - Funnel      : "Main Launch Funnel"
 *   - FunnelSteps : landing → optin → checkout → upsell → thankyou
 */
import payload from 'payload'
import config from '../src/payload.config'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the first existing document matching `where`, or null. */
async function findFirst<T>(
  collection: string,
  where: Record<string, unknown>,
): Promise<(T & { id: string }) | null> {
  const result = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
  })
  return (result.docs[0] as (T & { id: string }) | undefined) ?? null
}

/** Creates a document only if none exists matching the given `where` clause. */
async function findOrCreate<T>(
  collection: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
  label: string,
): Promise<T & { id: string }> {
  const existing = await findFirst<T>(collection, where)
  if (existing) {
    console.log(`  ✓ ${label} already exists — skipping`)
    return existing
  }
  const created = await payload.create({ collection, data })
  console.log(`  + ${label} created (id: ${created.id})`)
  return created as T & { id: string }
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('\n🌱  Initialising Payload…')
  await payload.init({ config, local: true })
  console.log('   Payload ready.\n')

  // ── 1. Summit Site ──────────────────────────────────────────────────────────
  console.log('→ SummitSite')
  const site = await findOrCreate(
    'summit-sites',
    { slug: { equals: 'test-summit' } },
    {
      name: 'Test Summit',
      slug: 'test-summit',
      domain: 'test.localhost',
      brand: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        fontHeading: 'Inter',
        fontBody: 'Inter',
      },
      globalSEO: {
        defaultTitle: 'Test Summit — Your Transformation Starts Here',
        defaultDescription:
          'Join the Test Summit and learn directly from world-class experts.',
        globalNoindex: false,
      },
      menus: [
        { label: 'Home', url: '/', openInNewTab: false },
        { label: 'Speakers', url: '/#speakers', openInNewTab: false },
        { label: 'FAQ', url: '/#faq', openInNewTab: false },
      ],
    },
    'SummitSite "Test Summit"',
  )

  // ── 2. Product ──────────────────────────────────────────────────────────────
  console.log('\n→ Product')
  const product = await findOrCreate(
    'products',
    { slug: { equals: 'summit-all-access-pass' } },
    {
      name: 'Summit All-Access Pass',
      slug: 'summit-all-access-pass',
      summitSite: site.id,
      type: 'one_time',
      price: 97,
      currency: 'eur',
      acTag: 'summit-buyer',
      acProductTag: 'all-access-pass',
    },
    'Product "Summit All-Access Pass"',
  )

  // ── 3. Speaker ──────────────────────────────────────────────────────────────
  console.log('\n→ Speaker')
  await findOrCreate(
    'speakers',
    {
      and: [
        { name: { equals: 'Dr. Jane Smith' } },
        { summitSite: { equals: site.id } },
      ],
    },
    {
      name: 'Dr. Jane Smith',
      title: 'PhD, Child Psychologist',
      summitSite: site.id,
      order: 1,
    },
    'Speaker "Dr. Jane Smith"',
  )

  // ── 4. Funnel ───────────────────────────────────────────────────────────────
  console.log('\n→ Funnel')
  const funnel = await findOrCreate(
    'funnels',
    { slug: { equals: 'main-launch' } },
    {
      name: 'Main Launch Funnel',
      slug: 'main-launch',
      summitSite: site.id,
      status: 'active',
      steps: [],
    },
    'Funnel "Main Launch Funnel"',
  )

  // ── 5. Funnel Steps ─────────────────────────────────────────────────────────
  console.log('\n→ FunnelSteps')

  const stepDefs: Array<{
    title: string
    slug: string
    type: string
    order: number
    products?: string[]
    sections?: unknown[]
  }> = [
    {
      title: 'Landing Page',
      slug: 'landing-page',
      type: 'landing',
      order: 0,
      sections: [
        {
          blockType: 'hero',
          heading: 'Join the Test Summit — Free Access for a Limited Time',
          subheading:
            'Learn from 20+ world-class experts and transform your life in just 10 days.',
          ctaText: 'Register Now — It\'s Free!',
          ctaUrl: '#optin',
          layout: 'centered',
        },
        {
          blockType: 'speakers',
          heading: 'Meet Your Experts',
          subheading: 'Hand-picked specialists sharing life-changing insights.',
          displayAll: true,
        },
        {
          blockType: 'features',
          heading: 'What You\'ll Discover',
          items: [
            {
              icon: 'play-circle',
              title: '20+ Expert Interviews',
              description: 'In-depth conversations with practitioners at the top of their field.',
            },
            {
              icon: 'calendar',
              title: 'Live Q&A Sessions',
              description: 'Ask your burning questions directly to the speakers.',
            },
            {
              icon: 'gift',
              title: 'Free Bonus Resources',
              description: 'Downloadable guides, checklists, and worksheets — yours to keep.',
            },
          ],
        },
      ],
    },
    {
      title: 'Opt-In',
      slug: 'opt-in',
      type: 'optin',
      order: 1,
      sections: [
        {
          blockType: 'cta',
          heading: 'Enter Your Details to Secure Your Free Spot',
          subheading: 'Join 10,000+ attendees. Instant access. No credit card required.',
          buttonText: 'Yes! Reserve My Free Spot →',
          buttonUrl: '#',
          layout: 'centered',
        },
      ],
    },
    {
      title: 'Checkout',
      slug: 'checkout',
      type: 'checkout',
      order: 2,
      products: [product.id],
      sections: [
        {
          blockType: 'hero',
          heading: 'Upgrade to All-Access — Lifetime Replays + Bonuses',
          subheading: 'Never miss an interview. Watch on your schedule, forever.',
          ctaText: 'Get All-Access Now — Only €97',
          ctaUrl: '#order-form',
          layout: 'centered',
        },
        {
          blockType: 'features',
          heading: 'Everything Included in All-Access',
          items: [
            {
              icon: 'video',
              title: 'Lifetime Video Replays',
              description: 'Watch all 20+ sessions on-demand, forever.',
            },
            {
              icon: 'download',
              title: 'Downloadable Transcripts',
              description: 'PDF transcripts for every interview.',
            },
            {
              icon: 'star',
              title: '3 Exclusive Masterclasses',
              description: 'Not available in the free version.',
            },
          ],
        },
        {
          blockType: 'testimonials',
          heading: 'What Past All-Access Members Say',
          items: [
            {
              quote:
                'The All-Access Pass paid for itself in the first session alone. Incredible value.',
              author: 'Maria K.',
              role: 'Nutritionist, Vienna',
              rating: 5,
            },
            {
              quote: 'I\'ve watched several interviews 3–4 times. Worth every cent.',
              author: 'Thomas B.',
              role: 'Personal Trainer, Munich',
              rating: 5,
            },
          ],
        },
      ],
    },
    {
      title: 'Upsell — VIP Mastermind',
      slug: 'upsell-vip-mastermind',
      type: 'upsell',
      order: 3,
      sections: [
        {
          blockType: 'cta',
          heading: 'Wait! Add the VIP Mastermind for Just €197',
          subheading:
            'Get direct access to our private coaching community and monthly group calls.',
          buttonText: 'Yes, Add the Mastermind →',
          buttonUrl: '#upsell-order',
          layout: 'centered',
        },
      ],
    },
    {
      title: 'Thank You',
      slug: 'thank-you',
      type: 'thankyou',
      order: 4,
      sections: [
        {
          blockType: 'hero',
          heading: 'You\'re In! Check Your Email for Access Details.',
          subheading:
            'Your confirmation email is on its way. Make sure to whitelist hello@testsummit.com.',
          layout: 'centered',
        },
      ],
    },
  ]

  const stepIds: string[] = []

  for (const def of stepDefs) {
    const step = await findOrCreate(
      'funnel-steps',
      { slug: { equals: def.slug } },
      {
        title: def.title,
        slug: def.slug,
        type: def.type,
        order: def.order,
        funnel: funnel.id,
        products: def.products ?? [],
        sections: def.sections ?? [],
      },
      `FunnelStep "${def.title}"`,
    )
    stepIds.push(step.id)
  }

  // ── 6. Link steps back to the funnel ────────────────────────────────────────
  console.log('\n→ Linking steps to funnel…')
  await payload.update({
    collection: 'funnels',
    id: funnel.id,
    data: { steps: stepIds },
  })
  console.log(`  ✓ Funnel updated with ${stepIds.length} step(s)`)

  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n✅  Seed complete.\n')
  process.exit(0)
}

seed().catch((err: unknown) => {
  console.error('\n❌  Seed failed:', err)
  process.exit(1)
})
