import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    variables: envCheck,
    missingCritical: [
      !process.env.OPENAI_API_KEY && 'OPENAI_API_KEY',
      !process.env.NEXT_PUBLIC_SUPABASE_URL && 'NEXT_PUBLIC_SUPABASE_URL',
      !process.env.SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
    ].filter(Boolean),
  })
}
