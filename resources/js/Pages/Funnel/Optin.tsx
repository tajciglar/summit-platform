interface Props {
  funnel: {
    name: string
    slug: string
  }
  step: {
    headline: string
    title: string
    slug: string
    type: string
    sort_order: number
  }
}

export default function Optin({ funnel, step }: Props) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-xl w-full px-6 py-12 text-center">
        <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest mb-2">
          {step.headline}
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{step.title}</h1>
        <p className="text-gray-400 text-sm">
          Step type: <span className="font-mono">{step.type}</span> · slug:{' '}
          <span className="font-mono">{step.slug}</span>
        </p>
      </div>
    </div>
  )
}
