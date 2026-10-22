import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { Users, Categories, Materials, Media, Products, Customers, Quotes, Orders, ProductionJobs } from './src/collections'
export default buildConfig({
  admin: { user: Users.slug, meta: { titleSuffix: ' | MakeMy3D' } },
  collections: [Users, Categories, Materials, Media, Products, Customers, Quotes, Orders, ProductionJobs],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL || '' } }),
  sharp,
  typescript: { outputFile: './src/payload-types.ts' },
})
