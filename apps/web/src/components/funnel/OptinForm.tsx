import React, { useId, useState } from 'react'
import { trackFunnelEvent, hashEmail } from '~/lib/analytics'
import { getStoredUTMs } from '~/lib/utm'

export interface OptinFormProps {
  summitId: string
  nextStepUrl: string
  acTag?: string | null
  heading?: string
  subheading?: string
  buttonText?: string
}

const spinKeyframes = `
@keyframes of-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`

function Spinner() {
  return (
    <>
      <style>{spinKeyframes}</style>
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        style={{ animation: 'of-spin 0.75s linear infinite', flexShrink: 0 }}
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
        <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </>
  )
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function OptinForm({
  summitId,
  nextStepUrl,
  acTag,
  heading = 'Register for Free Access',
  subheading,
  buttonText = 'Get Instant Access →',
}: OptinFormProps) {
  const uid = useId()
  const nameId = `${uid}-name`
  const emailId = `${uid}-email`
  const nameErrorId = `${uid}-name-error`
  const emailErrorId = `${uid}-email-error`
  const formErrorId = `${uid}-form-error`

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validateEmail(value: string): string | null {
    if (!value.trim()) return 'Email address is required.'
    if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address.'
    return null
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const emailErr = validateEmail(email)
    setEmailError(emailErr)
    setNameError(null)
    setFormError(null)

    if (emailErr) return

    void submitOptin()
  }

  async function submitOptin() {
    setSubmitting(true)
    setFormError(null)

    try {
      const res = await fetch('/api/optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          summitId,
          acTag: acTag ?? undefined,
          utms: getStoredUTMs(),
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Server error ${res.status}`)
      }

      // Fire analytics — hash the email for privacy
      const hashedEmail = await hashEmail(email.trim())
      const utms = getStoredUTMs()

      trackFunnelEvent({
        event: 'optin_submit',
        email_hashed: hashedEmail,
        summit_id: summitId,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
      })

      window.location.href = nextStepUrl
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      )
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6875rem 0.875rem',
    fontSize: '1rem',
    fontFamily: 'var(--font-body, inherit)',
    border: '1.5px solid #d1d5db',
    borderRadius: '0.375rem',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#ffffff',
    transition: 'border-color 0.15s ease',
    color: 'inherit',
  }

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#dc2626',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-body, inherit)',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '0.375rem',
    color: 'inherit',
  }

  const fieldErrorStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: '#dc2626',
    marginTop: '0.3125rem',
    fontFamily: 'var(--font-body, inherit)',
    lineHeight: 1.4,
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
      }}
    >
      {/* Heading / subheading */}
      {(heading || subheading) && (
        <div style={{ textAlign: 'center' }}>
          {heading && (
            <h2
              style={{
                fontFamily: 'var(--font-heading, inherit)',
                fontSize: 'clamp(1.375rem, 3.5vw, 2rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 0.5rem',
                color: 'inherit',
              }}
            >
              {heading}
            </h2>
          )}
          {subheading && (
            <p
              style={{
                fontFamily: 'var(--font-body, inherit)',
                fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)',
                lineHeight: 1.6,
                margin: 0,
                opacity: 0.75,
                color: 'inherit',
              }}
            >
              {subheading}
            </p>
          )}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Registration form"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {/* Name (optional) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor={nameId} style={labelStyle}>
            First Name{' '}
            <span
              style={{ fontSize: '0.8125rem', fontWeight: 400, opacity: 0.55 }}
            >
              (optional)
            </span>
          </label>
          <input
            id={nameId}
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane"
            style={nameError ? inputErrorStyle : inputStyle}
            aria-describedby={nameError ? nameErrorId : undefined}
            aria-invalid={!!nameError}
          />
          {nameError && (
            <span
              id={nameErrorId}
              role="alert"
              style={fieldErrorStyle}
            >
              {nameError}
            </span>
          )}
        </div>

        {/* Email (required) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor={emailId} style={labelStyle}>
            Email Address{' '}
            <span aria-hidden="true" style={{ color: '#dc2626' }}>
              *
            </span>
          </label>
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError(validateEmail(e.target.value))
            }}
            onBlur={(e) => setEmailError(validateEmail(e.target.value))}
            required
            aria-required="true"
            placeholder="jane@example.com"
            style={emailError ? inputErrorStyle : inputStyle}
            aria-describedby={
              emailError ? emailErrorId : undefined
            }
            aria-invalid={!!emailError}
          />
          {emailError && (
            <span
              id={emailErrorId}
              role="alert"
              style={fieldErrorStyle}
            >
              {emailError}
            </span>
          )}
        </div>

        {/* Global form error */}
        {formError && (
          <div
            id={formErrorId}
            role="alert"
            aria-live="assertive"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              color: '#dc2626',
              fontFamily: 'var(--font-body, inherit)',
              lineHeight: 1.5,
            }}
          >
            {formError}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          aria-disabled={submitting}
          aria-busy={submitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            background: 'var(--color-primary, #7c3aed)',
            color: '#ffffff',
            fontFamily: 'var(--font-body, inherit)',
            fontSize: '1.0625rem',
            fontWeight: 700,
            lineHeight: 1,
            padding: '0.9375rem 2rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            transition: 'opacity 0.15s ease, transform 0.1s ease',
            marginTop: '0.25rem',
          }}
        >
          {submitting && <Spinner />}
          {submitting ? 'Submitting…' : buttonText}
        </button>
      </form>

      {/* Privacy note */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          opacity: 0.5,
          fontFamily: 'var(--font-body, inherit)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        🔒 Your information is safe. We never share your data.
      </p>
    </div>
  )
}

export default OptinForm
