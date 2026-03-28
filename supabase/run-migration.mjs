// Run: node supabase/run-migration.mjs
// Requires DB_URL env var:
//   DB_URL="postgresql://postgres.kangpgndizrvvdecfjjr:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"

import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

const dbUrl = process.env.DB_URL
if (!dbUrl) {
  console.error('❌  Set DB_URL environment variable first.')
  console.error('    Find it in: Supabase dashboard → Settings → Database → Connection string (URI)')
  process.exit(1)
}

const sql = readFileSync(join(__dirname, 'migration.sql'), 'utf8')
const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  console.log('✓ Connected to Supabase')
  await client.query(sql)
  console.log('✓ Migration applied successfully')
} catch (err) {
  console.error('❌  Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
