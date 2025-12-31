import pg from 'pg'
import fs from 'fs'

const { Client } = pg

// Supabase connection string using transaction pooler
// Format: postgresql://postgres.[PROJECT_REF]:[SERVICE_ROLE_KEY]@aws-0-[REGION].pooler.supabase.com:6543/postgres
const projectRef = 'usqshixzparnmykghtzn'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcXNoaXh6cGFybm15a2dodHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk3OTA4NywiZXhwIjoyMDgyNTU1MDg3fQ.pjIQ0EAR9-yzPow1DPdujJ38CKrujvdFvLD-aY78Il4'

// Try connection pooler first
const connectionString = `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function runMigration() {
  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...')
    await client.connect()
    console.log('✓ Connected successfully\n')

    const migrations = [
      {
        name: 'Drop foreign key constraint on analyses table',
        sql: 'ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey;'
      },
      {
        name: 'Drop foreign key constraint on user_analyses table',
        sql: 'ALTER TABLE user_analyses DROP CONSTRAINT IF EXISTS user_analyses_user_id_fkey;'
      },
      {
        name: 'Change user_id type in analyses table to TEXT',
        sql: 'ALTER TABLE analyses ALTER COLUMN user_id TYPE TEXT;'
      },
      {
        name: 'Change user_id type in user_analyses table to TEXT',
        sql: 'ALTER TABLE user_analyses ALTER COLUMN user_id TYPE TEXT;'
      },
      {
        name: 'Change id type in users table to TEXT',
        sql: 'ALTER TABLE users ALTER COLUMN id TYPE TEXT;'
      },
      {
        name: 'Re-add foreign key constraint on analyses table',
        sql: 'ALTER TABLE analyses ADD CONSTRAINT analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;'
      },
      {
        name: 'Re-add foreign key constraint on user_analyses table',
        sql: 'ALTER TABLE user_analyses ADD CONSTRAINT user_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;'
      }
    ]

    console.log('📝 Executing migration: Change user_id from UUID to TEXT\n')

    for (const migration of migrations) {
      try {
        console.log(`  ➜ ${migration.name}...`)
        await client.query(migration.sql)
        console.log(`    ✓ Success`)
      } catch (error) {
        console.error(`    ✗ Error: ${error.message}`)
        // Continue with other migrations
      }
    }

    console.log('\n✅ Migration completed!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Verify your Supabase project is accessible')
    console.error('2. Check if the service role key is correct')
    console.error('3. Try running the SQL manually in Supabase Dashboard SQL Editor')
    console.error('\nSQL file location: supabase/migrations/20251230_change_user_id_to_text.sql')
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
