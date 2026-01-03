import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: 'v2-walletconnect',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
  })
}
