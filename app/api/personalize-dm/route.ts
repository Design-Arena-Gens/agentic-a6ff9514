import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
})

export async function POST(request: NextRequest) {
  try {
    const { username, template, niche } = await request.json()

    let message = ''

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional business development representative in the ${niche} industry. Personalize outreach messages to be warm, professional, and value-focused.`
          },
          {
            role: 'user',
            content: `Personalize this DM template for ${username}: "${template}". Make it feel genuine and tailored to them.`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })

      message = completion.choices[0].message.content || ''
    } else {
      // Demo mode
      message = `Hi ${username}! ${template.substring(0, 200)}`
    }

    return NextResponse.json({ message, username, success: true })
  } catch (error: any) {
    console.error('Error personalizing DM:', error)
    return NextResponse.json(
      { error: 'Failed to personalize DM', details: error.message },
      { status: 500 }
    )
  }
}
