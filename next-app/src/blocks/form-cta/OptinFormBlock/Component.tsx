'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'
import { useFunnel } from '@/lib/funnel-context'
import type { Props } from './schema'

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000'

export function OptinFormBlock(props: Props) {
  const router = useRouter()
  const { funnelId } = useFunnel()
  const [state, setState] = useState({ name: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const params = new URLSearchParams(window.location.search)
    const utmFields: Record<string, string> = {}
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const val = params.get(key)
      if (val) utmFields[key] = val
    }

    try {
      const res = await fetch(`${API_BASE}/api/optins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          first_name: state.name,
          email: state.email,
          funnel_id: funnelId,
          ...utmFields,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const message = body?.message || `Request failed (${res.status})`
        throw new Error(message)
      }

      const body = await res.json().catch(() => ({}))
      if (!body?.redirect) throw new Error('Invalid response from server')
      router.push(body.redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const bg = {
    light: 'bg-gray-50 text-gray-900',
    dark: 'bg-gray-900 text-white',
    primary: 'bg-[rgb(var(--color-primary))] text-white',
  }[props.backgroundStyle]

  const onDark = props.backgroundStyle !== 'light'

  return (
    <section className={cn('py-20', bg)}>
      <div className="mx-auto max-w-[520px] px-6">
        {props.headline && (
          <h2 className="text-center text-3xl font-bold md:text-4xl">{props.headline}</h2>
        )}
        {props.subheadline && (
          <p className={cn('mt-4 text-center', onDark ? 'text-white/90' : 'text-gray-600')}>
            {props.subheadline}
          </p>
        )}
        <form onSubmit={submit} className="mt-8 space-y-4">
          {props.fields.name && (
            <div>
              <Label htmlFor="optin-name" className={onDark ? 'text-white' : ''}>
                Name
              </Label>
              <Input
                id="optin-name"
                required
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                className={onDark ? 'bg-white/10 text-white placeholder:text-white/50 border-white/30' : ''}
                placeholder="Your name"
              />
            </div>
          )}
          {props.fields.email && (
            <div>
              <Label htmlFor="optin-email" className={onDark ? 'text-white' : ''}>
                Email
              </Label>
              <Input
                id="optin-email"
                type="email"
                required
                value={state.email}
                onChange={(e) => setState({ ...state, email: e.target.value })}
                className={onDark ? 'bg-white/10 text-white placeholder:text-white/50 border-white/30' : ''}
                placeholder="you@example.com"
              />
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full bg-[rgb(var(--color-accent))] text-white hover:bg-[rgb(var(--color-accent))]/90"
          >
            {submitting ? 'Submitting…' : props.submitLabel}
          </Button>
          {props.secondaryText && (
            <p className={cn('text-center text-sm', onDark ? 'text-white/80' : 'text-gray-600')}>
              {props.secondaryText}
            </p>
          )}
          {error && (
            <p className="text-center text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
          {props.privacyText && (
            <p className={cn('text-center text-xs', onDark ? 'text-white/60' : 'text-gray-500')}>
              {props.privacyText}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
