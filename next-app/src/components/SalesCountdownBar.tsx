'use client';

import { useEffect, useState } from 'react';

const DURATION_SECONDS = 15 * 60;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SalesCountdownBar({ checkoutHref }: { checkoutHref?: string }) {
  const [remaining, setRemaining] = useState(DURATION_SECONDS);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1_000);
    return () => clearInterval(id);
  }, []);

  const expired = remaining === 0;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        color: '#f8fafc',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '0.9rem',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      <span style={{ opacity: 0.85 }}>
        {expired ? 'Time is up!' : 'Special pricing expires in'}
      </span>

      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          fontSize: '1.15rem',
          letterSpacing: '0.05em',
          color: expired ? '#f87171' : '#fbbf24',
          minWidth: '4ch',
          textAlign: 'center',
        }}
      >
        {formatTime(remaining)}
      </span>

      {checkoutHref && (
        <a
          href={checkoutHref}
          style={{
            marginLeft: '4px',
            background: '#dc2626',
            color: '#fff',
            padding: '6px 18px',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '0.8rem',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            transition: 'background 150ms',
          }}
        >
          Claim offer
        </a>
      )}
    </div>
  );
}
