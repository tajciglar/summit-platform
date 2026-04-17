import type { OpusV3Content } from '../opus-v3.schema';

export const opusV3Fixture: OpusV3Content = {
  summit: {
    name: 'ADHD Parenting Summit 2026',
    tagline: 'A softer way to parent a bright, busy mind',
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    timezone: 'America/New_York',
  },
  topBar: {
    brandName: 'ADHD Parenting Summit',
    dateRangeLabel: 'Feb 10–14, 2026 · Free',
    ctaLabel: 'Reserve seat',
  },
  hero: {
    badgeLabel: 'Gentle 5-Day Summit',
    dateRangeLabel: 'Feb 10–14, 2026 · Free & Online',
    headlineLead: 'Your bright, ',
    headlineAccent: 'busy-minded',
    headlineTrail: ' child is not a problem to be solved.',
    subheadline:
      "Five days with 40 of the field's most thoughtful neuropsychologists, therapists, and educators — a soft place to land, and the practical guidance to keep going.",
    primaryCtaLabel: 'Reserve your free seat',
    secondaryCtaLabel: 'Learn more',
    readerCount: '73,124',
    readerCountSuffix: 'parents',
    readerLeadIn: 'Loved by',
    ratingLabel: '★ ★ ★ ★ ★',
    heroSpeakerIds: [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
      '44444444-4444-4444-8444-444444444444',
      '55555555-5555-4555-8555-555555555555',
      '66666666-6666-4666-8666-666666666666',
    ],
  },
  press: {
    eyebrow: 'As Featured In',
    outlets: [
      'The New York Times',
      'Psychology Today',
      'The Atlantic',
      'The Guardian',
      'TIME',
      'TEDx',
      'Scientific American',
      'Forbes',
      'BBC',
      'Washington Post',
    ],
  },
  stats: {
    eyebrow: 'By the Numbers',
    items: [
      { value: '5', label: 'days of unhurried conversation' },
      { value: '40', suffix: '+', label: 'experts, writers, therapists' },
      { value: '50', suffix: 'K', label: 'parents before you, welcomed softly' },
    ],
  },
  overview: {
    eyebrow: 'What is This?',
    headlineLead: 'An ',
    headlineAccent: 'unhurried',
    headlineTrail: ' answer to an overwhelming question.',
    bodyParagraphs: [
      'We built this summit because we could not find it: a generous, evidence-based conversation that treats ADHD parenting as something other than a problem to be fixed. Across five gentle evenings, forty thoughtful voices offer practical guidance and — just as importantly — the reassurance that you are not alone.',
      'Watch live or catch the replays at your pace. Bring your partner. The sessions are free. The strategies are real. The relief, we hope, is audible.',
    ],
    ctaLabel: 'Reserve your seat',
    imageCaption: 'Live talks · a printed Collection · a quiet community',
  },
  speakersDay: {
    eyebrow: 'Day One · Opening Circle',
    headlineLead: 'Understanding ',
    headlineAccent: "your child's",
    headlineTrail: ' brain.',
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
    ctaLabel: 'See the full forty — register free →',
  },
  outcomes: {
    eyebrow: 'Six Shifts by Day Five',
    headlineLead: 'What the end of the week ',
    headlineAccent: 'may sound like',
    items: [
      {
        title: 'Understand Why They Act Out',
        description:
          '"Bad child" becomes "dysregulated nervous system" — and your response changes.',
      },
      {
        title: 'End the Yelling Cycle',
        description:
          'Calm responses that actually work — because you found a different script, not more willpower.',
      },
      {
        title: 'Fix Morning Chaos',
        description:
          'Gentle routines that reduce daily friction. No gold-star charts. Things that hold up in real kitchens.',
      },
      {
        title: 'Build Emotional Resilience',
        description:
          'Help your child regulate big emotions — not suppress them. The difference, over time, changes everything.',
      },
      {
        title: 'Navigate School Systems',
        description: 'IEPs, 504s, and teacher communication — firm, warm, and hard to refuse.',
      },
      {
        title: 'Connect With Other Parents',
        description:
          'A side-channel for those late-night questions. You are not alone in this.',
      },
    ],
  },
  freeGift: {
    eyebrow: 'Enclosed with Registration',
    headlineLead: 'A ',
    headlineAccent: 'gentle collection',
    headlineTrail: ', enclosed.',
    body:
      "A bound selection of scripts, templates, and quiet checklists — drawn from our contributors' clinical practice and printed for the kitchen drawer. Your copy arrives the moment you register.",
    bullets: [
      'Morning-routine visual schedules, tested in real homes',
      'De-escalation scripts for meltdowns — the first sentence matters most',
      'IEP & 504 request templates — firm, warm, hard to refuse',
      'Printable calm-down card set for the refrigerator door',
    ],
    ctaLabel: 'Claim seat + Collection',
    cardEyebrow: 'A Gentle Collection',
    cardTitle: 'The ADHD Parenting Mastery Collection',
    cardEnclosure: 'Enclosed with your seat',
    cardVolume: 'Vol. VII · 2026',
    cardBadge: 'FREE GIFT',
  },
  bonuses: {
    eyebrow: 'Three Gentle Bonuses',
    headlineLead: 'Three gifts, ',
    headlineAccent: 'worth $291',
    headlineTrail: ', yours free.',
    ctaLabel: 'Claim seat + all three bonuses',
    items: [
      {
        valueLabel: '$97 VALUE',
        title: 'The ADHD Morning Playbook',
        description: 'A 7-day system for transforming chaotic mornings into calm, connected starts.',
        bullets: ['Visual schedule templates', 'Transition scripts that work', 'Calm-down toolkit'],
      },
      {
        valueLabel: '$97 VALUE',
        title: 'Meltdown to Breakthrough',
        description: 'A 5-step de-escalation framework that turns outbursts into growth moments.',
        bullets: [
          '5-step de-escalation method',
          'Emotional coaching scripts',
          'Printable calm-down cards',
        ],
      },
      {
        valueLabel: '$97 VALUE',
        title: 'School Advocacy Toolkit',
        description: 'Everything you need to get your child the support they deserve at school.',
        bullets: [
          'IEP/504 request templates',
          'Teacher communication scripts',
          'Accommodation checklists',
        ],
      },
    ],
  },
  founders: {
    headline: 'From the founders',
    items: [
      {
        name: 'Roman Wiltman',
        role: 'Co-Founder',
        quote:
          'Our journey started when our son was diagnosed at six. We felt lost, overwhelmed, and alone. This summit exists so that no other parent has to.',
        initials: 'RW',
      },
      {
        name: 'Anisah Semen',
        role: 'Co-Founder',
        quote:
          'Every child with ADHD has incredible strengths waiting to be unlocked. Our mission is to help parents see those strengths — and, gently, to nurture them.',
        initials: 'AS',
      },
    ],
  },
  testimonials: {
    eyebrow: 'What Parents Say',
    headlineLead: '73,124 parents. ',
    headlineAccent: 'One common theme.',
    items: [
      {
        quote:
          'This summit was life-changing. The expert sessions gave me tools I use every single day. My relationship with my son has completely transformed.',
        name: 'Rachel Berman',
        location: 'Ohio, USA',
        initials: 'RB',
      },
      {
        quote:
          "Finally someone who understands. The strategies are practical, not theoretical. My daughter's mornings are so much calmer now.",
        name: 'Kamila Bosco',
        location: 'London, UK',
        initials: 'KB',
      },
      {
        quote:
          "My husband and I watched together. For the first time we're on the same page about how to support our ADHD child. That alone was worth it.",
        name: 'Jennifer Mitchell',
        location: 'Toronto, CA',
        initials: 'JM',
      },
    ],
  },
  pullQuote: {
    quote:
      'The earlier you learn how to support your child with ADHD, the better your chances of managing their condition and minimizing long-term challenges.',
    attribution: '— Dr. Sarah Jensen · Pediatric Neuropsychologist',
  },
  figures: {
    eyebrow: 'Why This Matters',
    headline: 'The reality of ADHD in families today.',
    items: [
      { value: '1 in 9', description: 'Children diagnosed with ADHD in the US' },
      { value: '74%', description: 'Of parents feel isolated and unsupported' },
      { value: '3.2×', description: 'Higher reported stress in ADHD families' },
      { value: '15+', description: 'Years of clinical research represented' },
      { value: '28%', description: 'Of school-age children struggle academically' },
      { value: '93%', description: 'Of past attendees recommend this summit' },
    ],
  },
  shifts: {
    eyebrow: 'Five Gentle Shifts',
    headlineLead: 'What changes by ',
    headlineAccent: 'Day Five',
    items: [
      {
        title: 'From Punishment to Partnership',
        description:
          'An evidence-backed approach that builds cooperation naturally — without bribes, threats, or the exhausting architecture of either.',
      },
      {
        title: 'From Reacting to Anticipating',
        description:
          'See the meltdown coming 20 minutes out. Redirect the nervous system before the room is on fire.',
      },
      {
        title: 'From Isolated to Supported',
        description:
          'A cohort of parents who have been where you are. The 2 a.m. texts stop being a solo act.',
      },
      {
        title: 'From Overwhelmed to Equipped',
        description:
          "Trade vague anxiety for specific language and tools. You'll know what to say on Monday at 7:42 a.m.",
      },
      {
        title: 'From Shame to Sovereignty',
        description:
          "Your child's neurology is not a verdict on your parenting. A lived fact, not a mantra to repeat.",
      },
    ],
  },
  faqSection: {
    eyebrow: 'Common Questions',
    headline: 'Gentle answers',
  },
  faqs: [
    {
      question: 'Is it really free?',
      answer:
        'Yes, entirely. All 40 sessions, the Collection, and the 3 bonus guides. Optional upgrade offers come later — they never gate the free content.',
    },
    {
      question: 'What if I miss a live session?',
      answer:
        'Each session is recorded and available for 48 hours after it airs. Readers with the All-Access Pass keep permanent access.',
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
        "Contributors are qualified clinicians, but the summit is educational, not clinical. We'll point you toward where to go for personalized guidance.",
    },
    {
      question: 'How do I register?',
      answer:
        'Hit any "Reserve seat" button — name + email, under 30 seconds.',
    },
  ],
  closing: {
    badgeLabel: 'Registration closes Feb 9, 2026',
    headlineLead: 'Take a deep ',
    headlineAccent: 'breath',
    headlineTrail: '. Then reserve your seat.',
    subheadline:
      "Five days with forty of the field's most thoughtful minds — yours, free, delivered to your inbox.",
    ctaLabel: 'Reserve your free seat',
    fineprint: 'Free · No credit card · Unsubscribe anytime',
  },
  footer: {
    brandName: 'ADHD Parenting Summit',
    tagline: 'A softer way to parent a bright, busy mind.',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Contact', href: '/contact' },
    ],
    copyright: '© 2026 Althea Academy. Made with care.',
  },
};
