interface Speaker {
  name: string
  title: string | null
  bio: string | null
  photo_url: string
}

interface Props {
  funnel: {
    name: string
    slug: string
  }
  step: {
    headline: string | null
    title: string
    slug: string
    type: string
    sort_order: number
  }
  speakers: Speaker[]
}

export default function Optin({ funnel, step, speakers }: Props) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="flex items-center justify-center py-16 px-6">
        <div className="max-w-xl w-full text-center">
          {step.headline && (
            <p className="text-sm font-medium text-indigo-600 uppercase tracking-widest mb-2">
              {step.headline}
            </p>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{step.title}</h1>
        </div>
      </div>

      {/* Speakers */}
      {speakers.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Speakers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <div key={speaker.name} className="text-center">
                {speaker.photo_url ? (
                  <img
                    src={speaker.photo_url}
                    alt={speaker.name}
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
                    {speaker.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-semibold text-gray-900">{speaker.name}</h3>
                {speaker.title && <p className="text-sm text-gray-500">{speaker.title}</p>}
                {speaker.bio && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{speaker.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
