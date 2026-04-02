/**
 * VideoBlock
 *
 * Embeds a video (YouTube, Vimeo, or direct URL) with an optional
 * poster image shown before playback, an optional heading, and an
 * optional caption beneath the player.
 *
 * Slug: `video`
 */
import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'video',
  labels: {
    singular: 'Video Section',
    plural: 'Video Sections',
  },
  admin: {
    description: 'Embeds a video with optional heading, poster image, and caption.',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading',
      admin: {
        description: 'Optional heading displayed above the video player.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      required: true,
      label: 'Video URL',
      admin: {
        description:
          'YouTube, Vimeo, or direct video file URL (e.g. "https://www.youtube.com/watch?v=…").',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: 'Poster Image',
      admin: {
        description:
          'Thumbnail image displayed before the video starts playing. Recommended: 1280×720 px (16:9).',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Caption',
      admin: {
        description: 'Short text displayed below the video player (e.g. credit or context).',
      },
    },
  ],
}
