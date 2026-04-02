import React, { useEffect, useRef, useState } from 'react'

export interface CountdownTimerProps {
  /** ISO date string for a fixed deadline (e.g. "2026-04-10T23:59:59Z") */
  targetDate?: string
  /** Alternative: countdown from a duration in seconds */
  durationSeconds?: number
  /** Called when the timer reaches zero */
  onExpiry?: () => void
  /** Display label shown above the timer */
  label?: string
}

// Simple, deterministic hash of a number → short string key
function hashDuration(n: number): string {
  let h = 0
  const s = String(n)
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

function getExpiryTimestamp(
  targetDate?: string,
  durationSeconds?: number,
): number {
  if (targetDate) {
    return new Date(targetDate).getTime()
  }

  if (durationSeconds !== undefined) {
    const key = `summit_countdown_${hashDuration(durationSeconds)}`
    try {
      const stored = sessionStorage.getItem(key)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed > Date.now()) {
          return parsed
        }
      }
    } catch {
      // sessionStorage unavailable (private mode etc.) — fall through
    }

    const expiry = Date.now() + durationSeconds * 1000
    try {
      sessionStorage.setItem(key, String(expiry))
    } catch {
      // Silent failure
    }
    return expiry
  }

  // Nothing provided — expire immediately
  return Date.now()
}

function getRemainingMs(expiryTs: number): number {
  return Math.max(0, expiryTs - Date.now())
}

interface TimeParts {
  hours: number
  minutes: number
  seconds: number
}

function msToTimeParts(ms: number): TimeParts {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { hours, minutes, seconds }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

const digitBlockStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem',
  minWidth: '3.5rem',
}

const digitValueStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-primary, #7c3aed)',
  color: '#ffffff',
  fontFamily: 'var(--font-heading, monospace)',
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1,
  padding: '0.5rem 0.75rem',
  borderRadius: '0.375rem',
  minWidth: '3rem',
  letterSpacing: '0.05em',
}

const digitLabelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontFamily: 'var(--font-body, sans-serif)',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-primary, #7c3aed)',
  opacity: 0.75,
}

const separatorStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--color-primary, #7c3aed)',
  lineHeight: 1,
  paddingBottom: '1.25rem',
  userSelect: 'none',
}

export function CountdownTimer({
  targetDate,
  durationSeconds,
  onExpiry,
  label,
}: CountdownTimerProps) {
  const expiryRef = useRef<number>(
    getExpiryTimestamp(targetDate, durationSeconds),
  )
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    getRemainingMs(expiryRef.current),
  )
  const expiredFiredRef = useRef(false)

  useEffect(() => {
    // Re-compute in case of client/server hydration mismatch
    expiryRef.current = getExpiryTimestamp(targetDate, durationSeconds)
    setRemainingMs(getRemainingMs(expiryRef.current))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate, durationSeconds])

  useEffect(() => {
    if (remainingMs <= 0) {
      if (!expiredFiredRef.current) {
        expiredFiredRef.current = true
        onExpiry?.()
      }
      return
    }

    const id = setInterval(() => {
      const ms = getRemainingMs(expiryRef.current)
      setRemainingMs(ms)
      if (ms <= 0) {
        clearInterval(id)
        if (!expiredFiredRef.current) {
          expiredFiredRef.current = true
          onExpiry?.()
        }
      }
    }, 1000)

    return () => clearInterval(id)
  }, [remainingMs, onExpiry])

  const { hours, minutes, seconds } = msToTimeParts(remainingMs)
  const showHours = remainingMs >= 3600 * 1000

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
      }}
      aria-label={label ?? 'Countdown timer'}
      role="timer"
    >
      {label && (
        <p
          style={{
            fontFamily: 'var(--font-body, sans-serif)',
            fontSize: '0.9375rem',
            fontWeight: 600,
            margin: 0,
            color: 'inherit',
            textAlign: 'center',
          }}
        >
          {label}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.25rem',
        }}
        aria-live="off"
        aria-atomic="true"
        aria-label={
          showHours
            ? `${pad(hours)} hours, ${pad(minutes)} minutes, ${pad(seconds)} seconds`
            : `${pad(minutes)} minutes, ${pad(seconds)} seconds`
        }
      >
        {showHours && (
          <>
            <div style={digitBlockStyle}>
              <span style={digitValueStyle}>{pad(hours)}</span>
              <span style={digitLabelStyle} aria-hidden="true">
                Hours
              </span>
            </div>
            <span style={separatorStyle} aria-hidden="true">
              :
            </span>
          </>
        )}

        <div style={digitBlockStyle}>
          <span style={digitValueStyle}>{pad(minutes)}</span>
          <span style={digitLabelStyle} aria-hidden="true">
            Minutes
          </span>
        </div>

        <span style={separatorStyle} aria-hidden="true">
          :
        </span>

        <div style={digitBlockStyle}>
          <span style={digitValueStyle}>{pad(seconds)}</span>
          <span style={digitLabelStyle} aria-hidden="true">
            Seconds
          </span>
        </div>
      </div>

      {/* Screen-reader live region for updates every minute */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {seconds === 0
          ? showHours
            ? `${pad(hours)} hours and ${pad(minutes)} minutes remaining`
            : `${pad(minutes)} minutes remaining`
          : ''}
      </span>
    </div>
  )
}

export default CountdownTimer
