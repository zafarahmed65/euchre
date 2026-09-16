import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Articles } from './collections/Articles'
import { Hands } from './collections/Hands'
import { Votes } from './collections/Votes'
import { Homepage } from './globals/Homepage'
import { Navigation } from './globals/Navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseURI = process.env.DATABASE_URI || 'file:./midwest-euchre.db'
const isPostgres = databaseURI.startsWith('postgres')

/**
 * One switch for the whole data layer.
 *
 * Local development runs on SQLite so the project starts with `npm run dev` and
 * nothing else installed. Setting DATABASE_URI to a postgres:// string — a Neon
 * branch on Vercel — moves it to Postgres with no other change.
 */
const database = isPostgres
  ? postgresAdapter({
      pool: { connectionString: databaseURI },
      // Payload disables schema push outside development. This demo has no
      // migration history and a single environment, so push is enabled to let
      // the schema build itself on first boot. A production build should
      // generate migrations with `payload migrate:create` and drop this line.
      push: true,
    })
  : sqliteAdapter({ client: { url: databaseURI } })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: {
      titleSuffix: ' · Midwest Euchre Company',
    },
  },
  collections: [Articles, Hands, Votes, Categories, Media, Users],
  globals: [Homepage, Navigation],
  editor: lexicalEditor({}),
  db: database,
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp: (await import('sharp')).default,
  plugins: [
    seoPlugin({
      collections: ['articles', 'hands'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title} · Midwest Euchre Company`,
      generateDescription: ({ doc }) => doc?.excerpt || doc?.question || '',
    }),
    // Vercel has no persistent filesystem, so uploads must go to Blob storage in
    // production. Without the token set, uploads fall back to local disk for dev.
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
})
