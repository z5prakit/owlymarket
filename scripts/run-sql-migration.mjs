/**
 * Run SQL migration via Supabase REST API
 */

const SUPABASE_URL = 'https://usqshixzparnmykghtzn.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcXNoaXh6cGFybm15a2dodHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk3OTA4NywiZXhwIjoyMDgyNTU1MDg3fQ.pjIQ0EAR9-yzPow1DPdujJ38CKrujvdFvLD-aY78Il4'

// SQL to execute
const sql = `
ALTER TABLE analyses
ADD COLUMN IF NOT EXISTS progress_step TEXT,
ADD COLUMN IF NOT EXISTS progress_message TEXT;
`.trim()

async function runMigration() {
  try {
    console.log('Executing SQL migration...')
    console.log('SQL:', sql)

    // Use Supabase's PostgREST API to execute raw SQL
    // Note: This requires a custom RPC function to be created in Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Migration failed:', error)
      console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
      console.log('https://supabase.com/dashboard/project/usqshixzparnmykghtzn/sql/new')
      console.log('\n' + sql)
      process.exit(1)
    }

    const result = await response.json()
    console.log('Migration completed successfully!')
    console.log('Result:', result)
  } catch (error) {
    console.error('Error:', error.message)
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/usqshixzparnmykghtzn/sql/new')
    console.log('\n' + sql)
    process.exit(1)
  }
}

runMigration()
