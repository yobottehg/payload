import type { CollectionConfig } from 'payload'

import { RichTextBlock } from '../Blocks/RichTextBlock.js'

export const postsSlug = 'posts'

export const PostsCollection: CollectionConfig = {
  slug: postsSlug,
  fields: [
    {
      name: 'title',
      required: true,
      type: 'text',
    },
    {
      name: 'slug',
      required: true,
      type: 'text',
    },
    {
      name: 'content',
      label: 'Content',
      type: 'blocks',
      blocks: [RichTextBlock],
    },
  ],
  versions: {
    drafts: true,
  },
}
