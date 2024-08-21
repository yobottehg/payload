import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fileURLToPath } from 'node:url'
import path from 'path'

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { devUser } from '../credentials.js'
import { PostsCollection, postsSlug } from './collections/Posts/index.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfigWithDefaults({
  collections: [PostsCollection],
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

    // Create a parent page
    await payload.create({
      collection: postsSlug,
      data: {
        title: 'page 1',
        slug: 'page 1',
        _status: 'published',
      },
    })

    // Go to page, create a rich text block with a internal link (reference) to the "same page" and try to publish it.
    // CMS is caught in an endless loop
    // After some time the request is abandoned but the page is never published
    // Same works with pages linking each other.
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
})
