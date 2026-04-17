'use client';

import { useCallback, useEffect, useState } from 'react';

interface OptinModalProps {
  funnelId: string;
  ctaLabel?: string;
  headline?: string;
  subheadline?: string;
}

export function OptinModal({
  funnelId,
  ctaLabel = 'Save my free seat',
  headline = 'Save your free seat',
  subheadline = "We'll email the summit schedule and your access links.",
}: OptinModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    if (window.location.hash === '#optin') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === '#optin');
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);
    try {
      const url = new URL(window.location.href);
      const res = await fetch('/api/optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnel_id: funnelId,
          email,
          first_name: firstName,
          utm_source: url.searchParams.get('utm_source'),
          utm_medium: url.searchParams.get('utm_medium'),
          utm_campaign: url.searchParams.get('utm_campaign'),
          referrer: document.referrer || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body.message || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMessage('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="optin-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 8, maxWidth: 480, width: '100%',
          padding: 32, boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)',
        }}
      >
        {status === 'success' ? (
          <div>
            <h2 id="optin-modal-title" style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
              You&apos;re in!
            </h2>
            <p style={{ marginBottom: 24 }}>
              Check {email} for confirmation and your access links.
            </p>
            <button
              onClick={close}
              style={{ padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <h2 id="optin-modal-title" style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              {headline}
            </h2>
            <p style={{ color: '#555', marginBottom: 24 }}>{subheadline}</p>

            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>First name (optional)</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={120}
                autoComplete="given-name"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 16 }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 20 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                autoComplete="email"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 16 }}
              />
            </label>

            {errorMessage && (
              <p style={{ color: '#c00', fontSize: 14, marginBottom: 16 }}>{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                width: '100%', padding: '12px 20px',
                background: status === 'submitting' ? '#777' : '#111',
                color: '#fff', border: 'none', borderRadius: 4,
                fontSize: 16, fontWeight: 600,
                cursor: status === 'submitting' ? 'wait' : 'pointer',
              }}
            >
              {status === 'submitting' ? 'Saving...' : ctaLabel}
            </button>

            <button
              type="button"
              onClick={close}
              style={{
                width: '100%', marginTop: 12, padding: '8px',
                background: 'transparent', color: '#666', border: 'none',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Maybe later
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
