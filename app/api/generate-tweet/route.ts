import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
})

export async function POST(request: NextRequest) {
  try {
    const { topic, niche, tone } = await request.json()

    const toneInstructions: { [key: string]: string } = {
      professional: 'Write in a professional, authoritative tone',
      casual: 'Write in a casual, friendly conversational tone',
      humorous: 'Write with humor and wit',
      inspirational: 'Write in an inspirational, motivating tone',
      educational: 'Write in an educational, informative tone'
    }

    let tweet = ''

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a Twitter content creator specializing in ${niche}. ${toneInstructions[tone]}. Create engaging tweets that are concise, impactful, and relevant.`
          },
          {
            role: 'user',
            content: `Create a tweet about: ${topic}. Keep it under 280 characters. Make it engaging and include relevant hashtags.`
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })

      tweet = completion.choices[0].message.content || ''
    } else {
      // Demo mode - generate sample tweet
      tweet = `🚀 Exciting insights on ${topic} in the ${niche} space! ${tone === 'humorous' ? '😄' : tone === 'inspirational' ? '✨' : ''} #${niche.replace(/\s+/g, '')} #${topic.replace(/\s+/g, '')}`
    }

    return NextResponse.json({ tweet, success: true })
  } catch (error: any) {
    console.error('Error generating tweet:', error)
    return NextResponse.json(
      { error: 'Failed to generate tweet', details: error.message },
      { status: 500 }
    )
  }
}
