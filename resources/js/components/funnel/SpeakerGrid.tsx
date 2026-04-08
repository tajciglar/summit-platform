import type { Speaker } from '@/types/funnel'

export default function SpeakerGrid({ speakers }: { speakers: Speaker[] }) {
  if (speakers.length === 0) return null

  return (
    <div className="max-w-5xl mx-auto px-6 pb-16">
      <h2
        className="text-2xl font-bold text-center mb-8"
        style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
      >
        Featured Speakers
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {speakers.map((speaker) => (
          <div key={speaker.name} className="text-center">
            {speaker.photo_url ? (
              <img
                src={speaker.photo_url}
                alt={speaker.name}
                className="w-24 h-24 rounded-full mx-auto mb-3 object-cover shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
                {speaker.name.charAt(0)}
              </div>
            )}
            <h3 className="font-semibold" style={{ color: 'var(--theme-text)' }}>
              {speaker.name}
            </h3>
            {speaker.title && <p className="text-sm text-gray-500">{speaker.title}</p>}
            {speaker.masterclass_title && (
              <p className="text-xs mt-1" style={{ color: 'var(--theme-primary)' }}>
                {speaker.masterclass_title}
              </p>
            )}
            {speaker.bio && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{speaker.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
