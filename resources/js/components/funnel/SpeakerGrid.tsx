import type { Speaker } from '@/types/funnel'

export default function SpeakerGrid({ speakers }: { speakers: Speaker[] }) {
  if (speakers.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-6">
      <h2
        className="text-2xl md:text-3xl font-bold text-center mb-2"
        style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
      >
        Meet Your Speakers
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
        Learn from world-class experts sharing their knowledge and experience
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {speakers.map((speaker) => (
          <div
            key={speaker.name}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 text-center border border-gray-100"
          >
            {speaker.photo_url ? (
              <img
                src={speaker.photo_url}
                alt={speaker.name}
                className="w-28 h-28 rounded-full mx-auto mb-4 object-cover ring-4 ring-gray-50 transition-all"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {speaker.name.charAt(0)}
              </div>
            )}
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--theme-secondary)' }}>
              {speaker.name}
            </h3>
            {speaker.title && <p className="text-sm text-gray-500 mb-2">{speaker.title}</p>}
            {speaker.masterclass_title && (
              <p
                className="text-xs font-semibold uppercase tracking-wide mt-2 px-3 py-1 rounded-full inline-block text-white"
                style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.9 }}
              >
                {speaker.masterclass_title}
              </p>
            )}
            {speaker.bio && <p className="text-sm text-gray-400 mt-3 line-clamp-2">{speaker.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
