import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fileURLToPath } from 'node:url'
import path from 'path'

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { devUser } from '../credentials.js'
import { MediaCollection, mediaSlug } from './collections/Media/index.js'
import { PostsCollection, postsSlug } from './collections/Posts/index.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
import type { CollectionSlug } from 'payload'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'

export default buildConfigWithDefaults({
  collections: [PostsCollection, MediaCollection],
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  editor: lexicalEditor(),
  cors: ['http://localhost:3000', 'http://localhost:3001'],
  onInit: async (payload) => {
    await payload.create({
      collection: 'users',
      data: {
        email: devUser.email,
        password: devUser.password,
      },
    })

    // Create some reference which will later on be deleted
    const media = await payload.create({
      collection: mediaSlug as CollectionSlug,
      filePath: path.resolve('test/_community/collections/Media', 'image1.jpeg'),
      data: {
        alt: 'Image 1',
      },
    })

    // Create a parent page
    const parent = await payload.create({
      collection: postsSlug,
      data: {
        title: 'parent',
        slug: 'parent',
        _status: 'published',
      },
    })

    // Create a child page with a block which contains this reference
    await payload.create({
      collection: postsSlug,
      data: {
        title: 'child',
        slug: 'child',
        _status: 'published',
        parent: parent.id,
        content: [
          {
            blockName: 'Image',
            blockType: 'image',
            image: media.id,
          },
        ],
      },
    })

    // delete the image that is references in the child page
    await payload.delete({
      collection: mediaSlug,
      id: media.id,
    })

    // update the parent
    await payload.update({
      collection: postsSlug,
      id: parent.id,
      data: {
        title: 'parent updated',
      },
    })
  },
  db: postgresAdapter({
    pool: {
      connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
    },
    migrationDir: 'migrations',
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    nestedDocsPlugin({
      collections: ['posts'],
      generateLabel: (_, doc) => doc['title'] as string,
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc['slug'] as string}`, ''),
      // needs to be set to allow moving the fields into tabs
      parentFieldSlug: 'parent',
      breadcrumbsFieldSlug: 'breadcrumbs',
    }),
  ],
})
