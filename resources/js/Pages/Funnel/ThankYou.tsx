interface Props {
  funnel: { name: string; slug: string }
  step: {
    title: string
    slug: string
    type: string
    headline: string | null
  }
}

export default function ThankYou({ funnel, step }: Props) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full px-6 py-12 text-center">
        <div className="mb-6 text-5xl">&#10003;</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{step.title}</h1>
        {step.headline && <p className="text-gray-500">{step.headline}</p>}
        <p className="mt-4 text-sm text-gray-400">
          You will receive a confirmation email shortly.
        </p>
      </div>
    </div>
  )
}
