/**
 * Test endpoint to verify OpenAI integration works in production
 */
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        error: 'OPENAI_API_KEY not found',
        env: process.env.NODE_ENV
      }, { status: 500 })
    }

    console.log('[Test] Creating OpenAI client...')
    const openai = new OpenAI({ apiKey, timeout: 10000 })

    console.log('[Test] Sending test request...')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Say "OK" if you can hear me.' }
      ],
      max_tokens: 10,
    })

    const response = completion.choices[0]?.message?.content || 'No response'

    return NextResponse.json({
      status: 'success',
      response,
      model: completion.model,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[Test] Error:', error)
    return NextResponse.json({
      status: 'error',
      message: error.message,
      type: error.constructor.name,
      stack: error.stack
    }, { status: 500 })
  }
}
