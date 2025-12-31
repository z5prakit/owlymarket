import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://usqshixzparnmykghtzn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcXNoaXh6cGFybm15a2dodHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk3OTA4NywiZXhwIjoyMDgyNTU1MDg3fQ.pjIQ0EAR9-yzPow1DPdujJ38CKrujvdFvLD-aY78Il4'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('Starting migration: Change user_id from UUID to TEXT...\n')

  const steps = [
    {
      name: 'Drop foreign key constraint on analyses table',
      sql: 'ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_user_id_fkey'
    },
    {
      name: 'Drop foreign key constraint on user_analyses table',
      sql: 'ALTER TABLE user_analyses DROP CONSTRAINT IF EXISTS user_analyses_user_id_fkey'
    },
    {
      name: 'Change user_id type in analyses table to TEXT',
      sql: 'ALTER TABLE analyses ALTER COLUMN user_id TYPE TEXT'
    },
    {
      name: 'Change user_id type in user_analyses table to TEXT',
      sql: 'ALTER TABLE user_analyses ALTER COLUMN user_id TYPE TEXT'
    },
    {
      name: 'Change id type in users table to TEXT',
      sql: 'ALTER TABLE users ALTER COLUMN id TYPE TEXT'
    },
    {
      name: 'Re-add foreign key constraint on analyses table',
      sql: 'ALTER TABLE analyses ADD CONSTRAINT analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
    },
    {
      name: 'Re-add foreign key constraint on user_analyses table',
      sql: 'ALTER TABLE user_analyses ADD CONSTRAINT user_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
    }
  ]

  for (const step of steps) {
    try {
      console.log(`➜ ${step.name}...`)
      const { data, error } = await supabase.rpc('exec_sql', { query: step.sql })

      if (error) {
        console.error(`  ✗ Error: ${error.message}`)
        console.error(`  Details: ${error.details || 'N/A'}`)
        console.error(`  Hint: ${error.hint || 'N/A'}`)
      } else {
        console.log(`  ✓ Success`)
      }
    } catch (err) {
      console.error(`  ✗ Exception: ${err.message}`)
    }
  }

  console.log('\n✅ Migration completed!')
}

runMigration().catch(console.error)
