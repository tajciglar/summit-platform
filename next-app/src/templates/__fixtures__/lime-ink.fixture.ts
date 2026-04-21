import type { LimeInkContent } from '../lime-ink.schema';

export const limeInkFixture: LimeInkContent = {
  summit: {
    name: 'ADHD Parenting Summit 2026',
    tagline: 'A neurosciency intensive for parents',
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    timezone: 'America/New_York',
  },
  topBar: {
    codeTag: '[ADHD-SUMMIT]',
    name: 'ADHD Parenting Summit 2026',
    statusPill: 'FREE · FEB 2026',
    ctaLabel: 'Register →',
  },
  hero: {
    sectionLabel: '01 → HERO',
    dateRangeLabel: 'Feb 10–14 · 2026',
    eyebrow: 'A 5-day intensive · for parents · science-backed',
    heroLine1: "Your kid isn't broken.",
    headlineLead: 'The',
    headlineAccent: 'system',
    headlineTrail: 'around them is.',
    subheadline:
      "Five days. Forty clinicians, neuroscientists, and educators. Zero fluff. The ADHD Parenting Summit 2026 gives you the scripts, frameworks, and research to rebuild the system around your child — and reclaim your own nervous system in the process.",
    primaryCtaLabel: 'Register free',
    secondaryCtaLabel: "See what's inside",
    readerCount: '73,124',
    readerCountSuffix: 'parents registered',
    ratingLabel: '4.9/5',
    featuredLabel: 'FEATURED / DAY ONE',
    moreLabel: '+36 MORE THIS WEEK →',
    heroSpeakerIds: [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
      '44444444-4444-4444-8444-444444444444',
    ],
  },
  press: {
    eyebrow: 'OUR SPEAKERS HAVE APPEARED IN',
    outlets: [
      'The New York Times',
      'Scientific American',
      'The Atlantic',
      'Psychology Today',
      'TIME',
      'TEDx',
      'Forbes',
      'BBC',
      'The Washington Post',
      'CNN',
    ],
  },
  stats: {
    sectionLabel: '02 → BY THE NUMBERS',
    items: [
      {
        label: 'DURATION',
        value: '5',
        description: 'days of live intensive sessions',
      },
      {
        label: 'EXPERTS',
        value: '40',
        suffix: '+',
        description: 'neuropsychologists, therapists, educators',
      },
      {
        label: 'ATTENDED',
        value: '50',
        suffix: 'K',
        description: 'parents before you, last five years',
      },
    ],
  },
  overview: {
    sectionLabel: '03 → OVERVIEW',
    headlineLead: "It's a five-day ADHD ",
    headlineAccent: 'operating system',
    headlineTrail: ' update for your family.',
    bodyParagraphs: [
      "Forty of the field's sharpest clinicians and educators, four plenaries a day, one unified framework — delivered free, in your living room, with optional permanent access.",
      "Watch live. Catch replays. Bring your partner. The sessions are short, dense, and engineered for parents who don't have time for fluff.",
    ],
    ctaLabel: 'Claim your free seat',
    systemCardLabel: 'SYSTEM COMPONENTS',
    components: [
      {
        title: 'Live Plenaries',
        description: 'Evening sessions, recorded. 5 days × 4 talks = 20 core hours.',
      },
      {
        title: 'Printable Collection',
        description: 'Scripts, templates, checklists. Yours to keep.',
      },
      {
        title: 'Peer Community',
        description: 'Optional group for late-night questions.',
      },
    ],
  },
  speakersDay: {
    sectionLabel: '04 → SPEAKERS · DAY 01',
    headline: "Understanding Your Child's Brain",
    countLabel: '8 OF 40 →',
    speakerIds: [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
      '44444444-4444-4444-8444-444444444444',
      '55555555-5555-4555-8555-555555555555',
      '66666666-6666-4666-8666-666666666666',
      '77777777-7777-4777-8777-777777777777',
      '88888888-8888-4888-8888-888888888888',
    ],
    ctaLabel: 'See all 40 speakers — register free →',
  },
  outcomes: {
    sectionLabel: '05 → OUTCOMES',
    headlineLead: 'Six shifts by Day Five. ',
    headlineTrail: 'Measured, not aspirational.',
    itemBadge: 'OUTCOME',
    items: [
      { title: 'Understand Why They Act Out', description: 'See the neuroscience behind the behavior. Response changes when framing changes.' },
      { title: 'End the Yelling Cycle', description: 'Calm responses that actually work. Scripts, not willpower.' },
      { title: 'Fix Morning Chaos', description: 'Routines that reduce daily friction. Built for real kitchens.' },
      { title: 'Build Emotional Resilience', description: 'Help your child regulate big emotions, not suppress them.' },
      { title: 'Navigate School Systems', description: 'IEPs, 504s, and teacher communication that gets results.' },
      { title: 'Connect With Other Parents', description: 'Peer group for late-night questions. You are not alone.' },
    ],
  },
  freeGift: {
    codeEyebrow: 'INCLUDED.WITH.REGISTRATION',
    headline: 'The Parenting Mastery Collection.',
    body: 'A curated bundle of scripts, templates, and checklists — engineered by our expert speakers. Sent the moment you register.',
    bullets: [
      'Morning routine visual schedules',
      'De-escalation scripts for meltdowns',
      'IEP/504 accommodation templates',
      'Printable calm-down card set',
    ],
    ctaLabel: 'Register — get the Collection',
    cardFilename: 'COLLECTION.ZIP',
    cardTitle: 'ADHD Parenting Mastery',
    cardFiles: [
      '├── morning-schedules.pdf',
      '├── deescalation-scripts.pdf',
      '├── iep-504-templates.pdf',
      '└── calm-down-cards.pdf',
    ],
    cardCommand: '$ download --free',
    cardBadge: '$127 VALUE · FREE',
  },
  bonuses: {
    sectionLabel: '06 → BONUSES',
    headlineLead: 'Three bonuses, ',
    headlineAccent: '$291 value',
    headlineTrail: ', zero cost.',
    subhead: 'Bundled free with every seat.',
    ctaLabel: 'Claim seat + all 3 bonuses',
    items: [
      {
        filename: 'BONUS_01.md',
        valueLabel: '$97 VALUE',
        title: 'The ADHD Morning Playbook',
        description: 'A 7-day system for transforming chaotic mornings into calm, connected starts.',
        bullets: ['Visual schedule templates', 'Transition scripts that work', 'Calm-down toolkit'],
      },
      {
        filename: 'BONUS_02.md',
        valueLabel: '$97 VALUE',
        title: 'Meltdown → Breakthrough',
        description: 'A 5-step de-escalation framework that turns outbursts into growth moments.',
        bullets: ['5-step method', 'Emotional coaching scripts', 'Printable calm-down cards'],
      },
      {
        filename: 'BONUS_03.md',
        valueLabel: '$97 VALUE',
        title: 'School Advocacy Toolkit',
        description: 'Everything you need to get your child the support they deserve at school.',
        bullets: ['IEP/504 request templates', 'Teacher communication scripts', 'Accommodation checklists'],
      },
    ],
  },
  founders: {
    sectionLabel: '07 → TEAM',
    headline: 'From the founders',
    items: [
      {
        name: 'Roman Wiltman',
        role: 'CO-FOUNDER',
        quote:
          'Our journey started when our son was diagnosed at six. We felt lost, overwhelmed, alone. This summit exists so that no parent has to.',
        initials: 'RW',
      },
      {
        name: 'Anisah Semen',
        role: 'CO-FOUNDER',
        quote:
          'Every child with ADHD has incredible strengths waiting to be unlocked. Our mission is to help parents see those strengths — and nurture them.',
        initials: 'AS',
      },
    ],
  },
  testimonials: {
    sectionLabel: '08 → REVIEWS',
    headlineLead: '73,124 parents. ',
    headlineTrail: '4.9 / 5.',
    subhead: 'One recurring theme: the relief is audible.',
    items: [
      {
        quote:
          'This summit was life-changing. The expert sessions gave me tools I use every single day. My relationship with my son has completely transformed.',
        name: 'Rachel Berman',
        location: 'OHIO, USA',
        initials: 'RB',
      },
      {
        quote:
          "Finally someone who understands. The strategies are practical, not theoretical. My daughter's mornings are so much calmer now.",
        name: 'Kamila Bosco',
        location: 'LONDON, UK',
        initials: 'KB',
      },
      {
        quote:
          "My husband and I watched together. For the first time we're on the same page about how to support our ADHD child. That alone was worth it.",
        name: 'Jennifer Mitchell',
        location: 'TORONTO, CA',
        initials: 'JM',
      },
    ],
  },
  pullQuote: {
    eyebrow: '// PULL QUOTE',
    quote:
      'The earlier you learn how to support your child with ADHD, the better your chances of managing their condition and minimizing long-term challenges.',
    attribution: 'DR. SARAH JENSEN · NEUROPSYCHOLOGIST',
  },
  figures: {
    sectionLabel: '09 → WHY THIS MATTERS',
    headline: 'The reality of ADHD in families today.',
    items: [
      { label: 'FIG 01 / DIAGNOSIS', value: '1 in 9', description: 'Children diagnosed with ADHD in the US', trend: 'rising' },
      { label: 'FIG 02 / ISOLATION', value: '74%', description: 'Of parents feel isolated and unsupported', trend: 'rising' },
      { label: 'FIG 03 / STRESS', value: '3.2×', description: 'Higher reported stress in ADHD families', trend: 'rising' },
      { label: 'FIG 04 / RESEARCH', value: '15+', description: 'Years of clinical research represented', trend: 'rising' },
      { label: 'FIG 05 / SCHOOL', value: '28%', description: 'Of school-age children struggle academically', trend: 'rising' },
      { label: 'FIG 06 / RECOMMEND', value: '93%', description: 'Of past attendees recommend this summit', trend: 'plateau' },
    ],
  },
  shifts: {
    sectionLabel: '10 → SHIFTS',
    headline: 'What changes by Day Five',
    items: [
      {
        title: 'Punishment → Partnership',
        description:
          'Move beyond punishment-based parenting to an evidence-backed approach that builds cooperation naturally. No bribes. No threats. No exhausting architecture of either.',
      },
      {
        title: 'Reacting → Anticipating',
        description:
          'See meltdowns coming 20 minutes out. Redirect the nervous system before the room is on fire.',
      },
      {
        title: 'Isolated → Supported',
        description:
          'A cohort of parents who have been where you are. 2 a.m. texts stop being a solo act.',
      },
      {
        title: 'Overwhelmed → Equipped',
        description:
          'Vague anxiety, out. Specific language and tools, in. You will know, concretely, what to say on Monday at 7:42 a.m.',
      },
      {
        title: 'Shame → Sovereignty',
        description:
          "Your child's neurology is not a verdict on your parenting. This becomes a lived fact, not a mantra you have to repeat.",
      },
    ],
  },
  faqSection: {
    sectionLabel: '11 → FAQ',
    headline: 'Frequently asked',
  },
  faqs: [
    {
      question: 'Is it really free?',
      answer:
        'Entirely. All 40 sessions, the Collection, and the 3 bonuses. Optional upgrade offers come later — they never gate the free content.',
    },
    {
      question: 'What if I miss a live session?',
      answer:
        'Each session is recorded and available 48 hours after it airs. Registered readers with the All-Access Pass keep permanent access.',
    },
    {
      question: "Is this suitable if my child isn't formally diagnosed?",
      answer:
        'Absolutely. Many attendees are observing ADHD traits and deciding whether to pursue assessment. Content is relevant regardless.',
    },
    {
      question: 'My partner wants to attend — separate seat?',
      answer:
        'One registration covers your household. Bring your partner, grandparents, co-parent, or an older child if appropriate.',
    },
    {
      question: 'Is medical advice offered?',
      answer:
        "Contributors are qualified clinicians, but the summit is educational, not clinical. We'll point you to where to go for personalized medical guidance.",
    },
    {
      question: 'How do I register?',
      answer:
        'Hit any "Register" button on this page — name + email, under 30 seconds.',
    },
  ],
  closing: {
    eyebrow: '// REGISTRATION.CLOSES → FEB 09 2026',
    headline: 'Update the operating system of your family.',
    subheadline:
      "5 days. 40 experts. Free. The next five evenings could be the reset you've been waiting for.",
    ctaLabel: 'Register free',
    fineprint: 'FREE · NO CREDIT CARD · UNSUBSCRIBE ANYTIME',
  },
  footer: {
    codeTag: '[ADHD-SUMMIT]',
    brandName: 'ADHD Parenting Summit',
    tagline: 'The annual 5-day intensive for parents who want science, not fluff.',
    summitLinksLabel: 'SUMMIT',
    summitLinks: [
      { label: 'Schedule', href: '#schedule' },
      { label: 'Speakers', href: '#speakers' },
      { label: 'Bonuses', href: '#bonuses' },
    ],
    legalLinksLabel: 'LEGAL',
    legalLinks: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
    ],
    contactLabel: 'CONTACT',
    contactEmail: 'support@indigo-gold.com',
    copyright: '© 2026 Althea Academy',
  },
};
