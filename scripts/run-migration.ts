/**
 * Run database migration to add progress columns
 */

import { Client } from 'pg'
import * as fs from 'fs'
import * as path from 'path'

// Supabase connection string format:
// postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
const connectionString = 'postgresql://postgres.usqshixzparnmykghtzn:KSebqy60Wq4Gv5QV@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'

async function runMigration() {
  console.log('Connecting to Supabase PostgreSQL...')
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected!')

    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251231_add_progress_columns.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('Running migration:', migrationPath)
    console.log('SQL:', sql)

    // Execute the migration
    const result = await client.query(sql)

    console.log('Migration completed successfully!')
    console.log('Result:', result)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration().catch(console.error)
