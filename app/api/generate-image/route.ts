import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    let imageUrl = ''

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: `Create a professional, eye-catching image for this tweet: ${prompt}. Style: modern, clean, suitable for social media.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })

      imageUrl = response.data?.[0]?.url || ''
    } else {
      // Demo mode - return placeholder
      imageUrl = 'https://via.placeholder.com/1024x1024/4F46E5/FFFFFF?text=AI+Generated+Image'
    }

    return NextResponse.json({ imageUrl, success: true })
  } catch (error: any) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    )
  }
}
