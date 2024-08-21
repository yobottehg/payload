import type { CollectionConfig, CollectionSlug } from 'payload'

import { createBreadcrumbsField, createParentField } from '@payloadcms/plugin-nested-docs'

import { ImageBlock } from '../Blocks/ImageBlock.js'
import { mediaSlug } from '../Media/index.js'

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
      blocks: [ImageBlock],
    },
    createParentField('posts', {
      label: 'Parent Page',
    }),
    createBreadcrumbsField('posts', { index: true }),
  ],
  versions: {
    drafts: true,
  },
}
