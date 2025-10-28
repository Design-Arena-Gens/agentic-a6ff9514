import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
})

export async function POST(request: NextRequest) {
  try {
    const { tweet, tone } = await request.json()

    let comment = ''

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful Twitter user who engages authentically. Generate ${tone} comments that add value to conversations.`
          },
          {
            role: 'user',
            content: `Generate a thoughtful, engaging comment (max 280 chars) in response to this tweet: "${tweet}"`
          }
        ],
        max_tokens: 80,
        temperature: 0.8
      })

      comment = completion.choices[0].message.content || ''
    } else {
      // Demo mode
      comment = `Great insights! Thanks for sharing this perspective. 💡`
    }

    return NextResponse.json({ comment, success: true })
  } catch (error: any) {
    console.error('Error generating comment:', error)
    return NextResponse.json(
      { error: 'Failed to generate comment', details: error.message },
      { status: 500 }
    )
  }
}
