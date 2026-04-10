import { Head, router } from '@inertiajs/react'
import { useCallback, useMemo, useState } from 'react'
import type { FlowPageProps, FlowStep } from '@/types/builder'

const STEP_TYPE_COLORS: Record<string, string> = {
  optin: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
  checkout: 'border-green-500 bg-green-50 dark:bg-green-950',
  upsell: 'border-amber-500 bg-amber-50 dark:bg-amber-950',
  downsell: 'border-orange-500 bg-orange-50 dark:bg-orange-950',
  thank_you: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
  sales_page: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950',
}

const STEP_TYPE_ICONS: Record<string, string> = {
  optin: '📋',
  checkout: '💳',
  upsell: '⬆️',
  downsell: '⬇️',
  thank_you: '🎉',
  sales_page: '📄',
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 120
const NODE_GAP_Y = 80
const BRANCH_GAP_X = 280

interface NodePosition {
  step: FlowStep
  x: number
  y: number
}

function computeLayout(steps: FlowStep[]): { nodes: NodePosition[]; arrows: Arrow[] } {
  const nodes: NodePosition[] = []
  const arrows: Arrow[] = []

  const sorted = [...steps].sort((a, b) => a.sort_order - b.sort_order)
  let y = 40

  for (let i = 0; i < sorted.length; i++) {
    const step = sorted[i]!
    const isUpsell = step.step_type === 'upsell' || step.step_type === 'downsell'

    nodes.push({ step, x: 400, y })

    // Arrow from previous node
    if (i > 0) {
      arrows.push({
        fromX: 400 + NODE_WIDTH / 2,
        fromY: y - NODE_GAP_Y + NODE_HEIGHT,
        toX: 400 + NODE_WIDTH / 2,
        toY: y,
        label: undefined,
        color: '#9CA3AF',
      })
    }

    // If upsell, show branching arrows
    if (isUpsell && i + 1 < sorted.length) {
      // "Yes" arrow goes down (next step)
      // "No" arrow branches right to a "Thank You" or skip
      arrows.push({
        fromX: 400 + NODE_WIDTH + 10,
        fromY: y + NODE_HEIGHT / 2,
        toX: 400 + NODE_WIDTH + BRANCH_GAP_X - NODE_WIDTH,
        toY: y + NODE_HEIGHT / 2,
        label: 'decline',
        color: '#EF4444',
      })
    }

    y += NODE_HEIGHT + NODE_GAP_Y
  }

  return { nodes, arrows }
}

interface Arrow {
  fromX: number
  fromY: number
  toX: number
  toY: number
  label?: string
  color: string
}

export default function Flow({ funnel, summit, steps }: FlowPageProps) {
  const [saving, setSaving] = useState(false)

  const { nodes, arrows } = useMemo(() => computeLayout(steps), [steps])

  const canvasHeight = Math.max(600, nodes.length * (NODE_HEIGHT + NODE_GAP_Y) + 100)

  const handleSaveOrder = useCallback(async () => {
    setSaving(true)
    const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
    await fetch(`/admin/api/flow/${funnel.id}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
      body: JSON.stringify({
        steps: steps.map((s, i) => ({ id: s.id, sort_order: i })),
      }),
    })
    setSaving(false)
  }, [funnel.id, steps])

  return (
    <>
      <Head title={`Flow — ${funnel.name}`} />
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        {/* Toolbar */}
        <div className="flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">
              ← Back to Admin
            </a>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Funnel Flow: {funnel.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{steps.length} steps</span>
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Order'}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <svg width="100%" height={canvasHeight} className="min-w-[900px]">
            {/* Arrows */}
            {arrows.map((arrow, i) => (
              <g key={i}>
                <line
                  x1={arrow.fromX}
                  y1={arrow.fromY}
                  x2={arrow.toX}
                  y2={arrow.toY}
                  stroke={arrow.color}
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                />
                {arrow.label && (
                  <text
                    x={(arrow.fromX + arrow.toX) / 2}
                    y={(arrow.fromY + arrow.toY) / 2 - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-400"
                  >
                    {arrow.label}
                  </text>
                )}
              </g>
            ))}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
              </marker>
            </defs>

            {/* Nodes */}
            {nodes.map(({ step, x, y }) => (
              <foreignObject key={step.id} x={x} y={y} width={NODE_WIDTH} height={NODE_HEIGHT}>
                <div
                  onClick={() => router.visit(`/admin/builder/${step.id}`)}
                  className={`h-full rounded-xl border-2 p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow ${STEP_TYPE_COLORS[step.step_type] ?? 'border-gray-300 bg-white dark:bg-gray-800'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{STEP_TYPE_ICONS[step.step_type] ?? '📄'}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {step.step_type.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {step.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    {step.product_name && (
                      <span className="text-[10px] text-gray-500 truncate">{step.product_name}</span>
                    )}
                    <span
                      className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${step.is_published ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {step.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {step.has_blocks && (
                    <span className="text-[9px] text-blue-500 mt-1 block">Has blocks</span>
                  )}
                </div>
              </foreignObject>
            ))}
          </svg>
        </div>
      </div>
    </>
  )
}
