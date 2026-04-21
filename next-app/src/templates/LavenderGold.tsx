import type { Speaker } from './types';
import type { LavenderGoldContent } from './lavender-gold.schema';

type Props = {
  content: LavenderGoldContent;
  speakers?: Record<string, Speaker>;
  funnelId?: string;
  ctaUrl?: string;
};

const LAV50 = '#F4F0FB';
const LAV100 = '#ECE6F7';
const LAV200 = '#DDD2F0';
const LAV300 = '#C5B5E4';
const LAV400 = '#A891D1';
const LAV500 = '#8C72BF';
const LAV700 = '#5A4589';
const SUN400 = '#FFD93D';
const SUN300 = '#FFE066';
const INK900 = '#1B132C';
const INK800 = '#2A1F3F';
const INK700 = '#3C2E54';

const iconLabels: Record<string, string> = {
  'infinity': 'Unlimited Access',
  'clipboard': 'Action Blueprints',
  'headphones': 'Audio Edition',
  'captions': 'Subtitles',
  'file-text': 'Transcripts',
  'book': 'Workbook',
};

function BonusIcon({ icon }: { icon: string }) {
  const label = iconLabels[icon] ?? icon;
  const color = LAV700;
  if (icon === 'infinity') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/>
      </svg>
    );
  }
  if (icon === 'clipboard') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      </svg>
    );
  }
  if (icon === 'headphones') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>
    );
  }
  if (icon === 'captions') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
        <path d="M7 15h4"/><path d="M15 15h2"/><path d="M7 11h2"/><path d="M13 11h4"/>
      </svg>
    );
  }
  if (icon === 'file-text') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    );
  }
  if (icon === 'book') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    );
  }
  return null;
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function ShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}

function GiftIcon({ size = 20, color = '#8a6b00' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  );
}

const btnCta: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 2rem',
  background: SUN400,
  color: INK900,
  fontWeight: 700,
  fontSize: '1.05rem',
  borderRadius: '9999px',
  boxShadow: '0 6px 18px -4px rgba(233,182,12,.55), inset 0 -3px 0 rgba(0,0,0,.06)',
  letterSpacing: '.02em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

const btnCtaLg: React.CSSProperties = { ...btnCta, padding: '1.15rem 2.4rem', fontSize: '1.15rem' };

function PriceCard({ content, ctaUrl }: { content: LavenderGoldContent['priceCard']; ctaUrl: string }) {
  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${LAV400}`,
      borderRadius: 24,
      boxShadow: '0 24px 44px -24px rgba(90,69,137,.35)',
      padding: '1.75rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: 480,
      width: '100%',
      margin: '0 auto',
    }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: `linear-gradient(90deg,${LAV500},${LAV300},${LAV500})` }} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dc2626', color: '#fff', padding: '.35rem .85rem', borderRadius: 9999, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        {content.badge}
      </div>

      <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: INK900, marginBottom: '0.5rem', lineHeight: 1.3 }}>{content.headline}</h3>
      <p style={{ fontSize: '0.88rem', color: INK700, marginBottom: '0.5rem' }}>{content.note}</p>

      <ul style={{ padding: 0, listStyle: 'none', margin: '1rem 0 1.25rem' }}>
        {content.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.35rem 0', fontSize: '0.95rem', color: INK800, lineHeight: 1.45 }}>
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div style={{ background: '#FFF8E6', border: '1px solid #F0E1A8', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: INK700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <GiftIcon size={16} /> {content.giftsBoxTitle}
        </p>
        {content.giftItems.map((g, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem', padding: '0.3rem 0', color: INK700 }}>
            <CheckIcon />
            <span>{g}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', borderTop: `1px solid ${LAV100}`, paddingTop: '1.25rem' }}>
        <p style={{ color: LAV700, textDecoration: 'line-through', fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
          Total value: {content.totalValue} — Regular price: {content.regularPrice}
        </p>
        <p style={{ fontSize: '2.6rem', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.02em', lineHeight: 1 }}>{content.currentPrice}</p>
        <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, marginBottom: '1rem' }}>{content.savings}</p>
        <a href={ctaUrl} style={btnCtaLg}>
          {content.ctaLabel} <ArrowRight size={20} />
        </a>
        <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: LAV700 }}>{content.guarantee}</p>
      </div>
    </div>
  );
}

export function LavenderGold({ content, speakers = {}, funnelId: _funnelId, ctaUrl = '#purchase' }: Props) {
  const sortedSpeakers = Object.values(speakers).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div style={{ fontFamily: 'Poppins,system-ui,sans-serif', background: '#fff', color: INK900 }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700;800&display=swap');
        .lavender-gold-btn-cta:hover { transform: translateY(-2px); }
        @keyframes pulseCTA {
          0%,100% { transform:scale(1); }
          50% { transform:scale(1.03); }
        }
        .lavender-gold-pulse { animation: pulseCTA 2.4s infinite; }
        @media (prefers-reduced-motion: reduce) { .lavender-gold-pulse { animation: none !important; } }
        details.aps-spk summary::-webkit-details-marker { display:none; }
        details.aps-spk summary::after { content:'View More'; display:inline-flex; align-items:center; gap:0.4rem; margin-top:0.3rem; font-size:0.7rem; font-weight:700; color:#5A4589; letter-spacing:.08em; text-transform:uppercase; padding-top:0.5rem; border-top:1px solid #ECE6F7; width:100%; justify-content:center; }
        details.aps-spk[open] summary::after { content:'View Less'; }
        @media (max-width:767px) { .lavender-gold-stick { display:flex !important; } body { padding-bottom:5rem; } }
      `}</style>

      {/* TOP BAR */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: '#fff', borderBottom: `1px solid ${LAV100}` }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg,${LAV500},${LAV700})`, display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,.15)', flexShrink: 0 }}>
              <ShieldIcon size={18} />
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '0.95rem', color: LAV700, margin: 0 }}>{content.topBar.name}</p>
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', fontWeight: 600, color: INK700, textTransform: 'uppercase', margin: 0 }}>VIP Pass</p>
            </div>
          </div>
          <a href={ctaUrl} className="lavender-gold-btn-cta" style={{ ...btnCta, padding: '.65rem 1.1rem', fontSize: '.85rem' }}>
            {content.topBar.ctaLabel} <ArrowRight size={14} />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section style={{ padding: '2.5rem 1.25rem 4rem', background: 'linear-gradient(180deg,#F4EFFA 0%,#FFFFFF 60%)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.18em', color: '#fff', background: '#dc2626', borderRadius: 9999, padding: '0.5rem 1rem', marginBottom: '1.5rem', textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(220,38,38,.3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            {content.hero.badge}
          </span>

          <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: INK900, marginBottom: '1rem' }}>
            {content.hero.headline.split('40+').map((part, i, arr) =>
              i < arr.length - 1
                ? <span key={i}>{part}<span style={{ background: SUN300, padding: '0 0.3rem', borderRadius: 6 }}>40+</span></span>
                : <span key={i}>{part}</span>
            )}
          </h1>

          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: LAV700, maxWidth: 680, margin: '0 auto 2rem' }}>
            {content.hero.subheadline}
          </p>

          {/* Product mockup */}
          <div style={{ maxWidth: 560, margin: '0 auto 2rem', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 48px rgba(90,69,137,.3)', aspectRatio: '16/9', background: `linear-gradient(135deg,${LAV700},${LAV500})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: `radial-gradient(circle at 20% 50%,${LAV300},transparent 50%),radial-gradient(circle at 80% 50%,${SUN300},transparent 40%)` }} />
            <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.5rem' }}>Full Access</p>
              <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: 'clamp(2rem,5vw,4rem)', fontStyle: 'italic', margin: 0 }}>{content.hero.productLabel}</p>
              <p style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{content.topBar.name}</p>
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: INK700, marginBottom: '0.5rem' }}>
            Total value: <span style={{ fontWeight: 700, color: LAV700, textDecoration: 'line-through' }}>{content.hero.totalValue}</span>
          </p>
          <a href={ctaUrl} id="purchase" className="lavender-gold-pulse lavender-gold-btn-cta" style={btnCtaLg}>
            {content.hero.ctaLabel} <ArrowRight size={20} />
          </a>
          <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: LAV700 }}>
            <strong>{content.hero.ctaNote}</strong>
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.5rem' }}>{content.intro.eyebrow}</p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}>{content.intro.headline}</h2>
          {content.intro.paragraphs.map((p, i) => (
            <p key={i} style={{ color: INK800, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1rem' }}>{p}</p>
          ))}
        </div>
      </section>

      {/* VIP BONUSES */}
      <section style={{ padding: '3.5rem 1.25rem', background: LAV50 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{content.vipBonuses.eyebrow}</p>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: INK900, lineHeight: 1.15 }}>{content.vipBonuses.headline}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
            {content.vipBonuses.items.map((item, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${LAV200}`, borderRadius: 20, boxShadow: '0 10px 24px -14px rgba(90,69,137,.3)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ background: `linear-gradient(135deg,${LAV50},${LAV200})`, aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: LAV700, fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <BonusIcon icon={item.icon} />
                    <span>{iconLabels[item.icon]}</span>
                  </div>
                </div>
                <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: INK900, marginBottom: '0.4rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{item.description}</p>
                  <span style={{ display: 'inline-block', background: '#fff', border: `1px solid ${LAV300}`, color: LAV700, fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{item.valueLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE GIFTS */}
      <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{content.freeGifts.eyebrow}</p>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: INK900, lineHeight: 1.15 }}>{content.freeGifts.headline}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
            {content.freeGifts.items.map((gift, i) => (
              <div key={i} style={{ background: '#FFF8E6', border: '1px solid #F0E1A8', borderRadius: 20, boxShadow: '0 10px 24px -14px rgba(233,182,12,.3)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#FFF6D6,#FFE07A)', aspectRatio: '16/10', display: 'grid', placeItems: 'center', color: '#8a6b00', fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.2rem', textAlign: 'center', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <GiftIcon size={40} color="#8a6b00" />
                    <span>Free Gift #{gift.giftNumber}</span>
                  </div>
                </div>
                <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '.15em', color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Free Gift #{gift.giftNumber}</p>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: INK900, marginBottom: '0.4rem' }}>{gift.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: INK700, lineHeight: 1.6, marginBottom: '0.75rem' }}>{gift.description}</p>
                  <span style={{ display: 'inline-block', background: '#fff', border: '1px solid #F0DD8A', color: '#8a6b00', fontWeight: 700, fontSize: '.7rem', letterSpacing: '.1em', padding: '.3rem .7rem', borderRadius: 9999 }}>{gift.valueLabel}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: INK700 }}>{content.freeGifts.deliveryNote}</p>
        </div>
      </section>

      {/* PRICE CARD #1 */}
      <section style={{ padding: '3.5rem 1.25rem', background: LAV50 }} id="purchase">
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{content.upgradeSection.eyebrow}</p>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}>{content.upgradeSection.headline}</h2>
            {content.upgradeSection.paragraphs.map((p, i) => (
              <p key={i} style={{ color: INK800, fontSize: '1rem', lineHeight: 1.7, marginBottom: '0.75rem', maxWidth: 680, margin: '0 auto 0.75rem' }}>{p}</p>
            ))}
          </div>
          <PriceCard content={content.priceCard} ctaUrl={ctaUrl} />
        </div>
      </section>

      {/* SPEAKERS */}
      {sortedSpeakers.length > 0 && (
        <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
          <div style={{ maxWidth: 1152, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{content.speakersSection.eyebrow}</p>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: INK900, lineHeight: 1.15 }}>{content.speakersSection.headline}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
              {sortedSpeakers.map((spk) => (
                <details key={spk.id} className="aps-spk" style={{ background: '#fff', border: `1px solid ${LAV200}`, borderRadius: 16, boxShadow: '0 6px 18px -10px rgba(90,69,137,.25)', marginBottom: 0, overflow: 'hidden' }}>
                  <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                    {spk.photoUrl
                      ? <img src={spk.photoUrl} alt={`${spk.firstName} ${spk.lastName}`} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${LAV300}`, boxShadow: `0 0 0 4px #fff, 0 6px 14px -4px rgba(90,69,137,.35)` }} />
                      : <div style={{ width: 84, height: 84, borderRadius: '50%', background: `linear-gradient(135deg,${LAV200},${LAV400})`, border: `3px solid ${LAV300}`, display: 'grid', placeItems: 'center', color: LAV700, fontFamily: '"Cormorant Garamond",Georgia,serif', fontSize: '1.8rem', fontStyle: 'italic' }}>
                          {spk.firstName[0]}{spk.lastName[0]}
                        </div>
                    }
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: INK900, margin: 0 }}>{spk.firstName} {spk.lastName}</p>
                      <p style={{ fontSize: '0.78rem', color: LAV700, margin: 0 }}>{spk.title}</p>
                      <p style={{ fontSize: '0.78rem', color: INK700, margin: 0, fontStyle: 'italic' }}>{spk.masterclassTitle}</p>
                    </div>
                  </summary>
                  {spk.shortBio && (
                    <p style={{ padding: '0 1.5rem 1.5rem', color: INK700, fontSize: '0.88rem', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>{spk.shortBio}</p>
                  )}
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPARISON TABLE */}
      <section style={{ padding: '3.5rem 1.25rem', background: LAV50 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}>{content.comparisonTable.eyebrow}</p>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: INK900, lineHeight: 1.15 }}>{content.comparisonTable.headline}</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${LAV200}`, background: '#fff' }}>
              <thead>
                <tr>
                  <th style={{ background: LAV100, color: LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'left' }}>Feature</th>
                  <th style={{ background: LAV200, color: LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>Free Pass</th>
                  <th style={{ background: LAV200, color: LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>VIP Pass</th>
                </tr>
              </thead>
              <tbody>
                {content.comparisonTable.rows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '1rem', borderTop: `1px solid ${LAV100}`, fontWeight: 600, color: INK900, fontSize: '0.95rem', lineHeight: 1.4 }}>{row.label}</td>
                    <td style={{ padding: '1rem', borderTop: `1px solid ${LAV100}`, textAlign: 'center' }}>
                      {row.freePass
                        ? <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}><CheckIcon /></span>
                        : <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><XIcon /></span>
                      }
                    </td>
                    <td style={{ padding: '1rem', borderTop: `1px solid ${LAV100}`, textAlign: 'center' }}>
                      {row.vipPass
                        ? <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}><CheckIcon /></span>
                        : <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><XIcon /></span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRICE CARD #2 */}
      <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
        <PriceCard content={content.priceCard} ctaUrl={ctaUrl} />
      </section>

      {/* GUARANTEE */}
      <section style={{ padding: '3.5rem 1.25rem', background: LAV50 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ background: '#FFF8E6', border: '2px dashed #F0DD8A', borderRadius: 20, padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem', flexShrink: 0 }}>🛡️</div>
            <div>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: INK900, marginBottom: '0.5rem' }}>{content.guarantee.heading}</h3>
              <p style={{ fontSize: '0.95rem', color: INK700, lineHeight: 1.65, margin: 0 }}>{content.guarantee.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: INK900, lineHeight: 1.15, marginBottom: '0.5rem' }}>{content.whySection.headline}</h2>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.35rem', color: LAV700, marginBottom: '1.5rem' }}>{content.whySection.subheadline}</p>
          {content.whySection.paragraphs.map((p, i) => (
            <p key={i} style={{ color: INK800, fontSize: '1rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
          ))}
        </div>
      </section>

      {/* PRICE CARD #3 */}
      <section style={{ padding: '3.5rem 1.25rem 5rem', background: LAV50 }}>
        <PriceCard content={content.priceCard} ctaUrl={ctaUrl} />
      </section>

      {/* FOOTER */}
      <footer style={{ background: INK900, color: '#fff', padding: '2rem 1.25rem', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.1rem', color: LAV300, marginBottom: '1rem' }}>{content.footer.brandName}</p>
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {content.footer.links.map((link, i) => (
            <a key={i} href={link.href} style={{ fontSize: '0.82rem', color: LAV300, textDecoration: 'none', opacity: 0.8 }}>{link.label}</a>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', opacity: 0.5, margin: 0 }}>{content.footer.copyright}</p>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className="lavender-gold-stick" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, padding: '0.65rem 1rem', background: 'rgba(27,19,44,.96)', display: 'none', justifyContent: 'center' }}>
        <a href={ctaUrl} style={{ ...btnCta, fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}>
          {content.priceCard.ctaLabel} <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
