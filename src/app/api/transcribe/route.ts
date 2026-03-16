/**
 * app/api/transcribe/route.ts  ← place at:  src/app/api/transcribe/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/transcribe
 *
 * REQUEST   { audioBase64: string, mimeType?: string }
 * RESPONSE  { text: string }
 *
 * Transcribes audio to text using Gemini multimodal input.
 * The resulting text is typically piped to POST /api/symbolize.
 *
 * No vocabulary or symbolic encoding happens here — this route is
 * intentionally kept as a thin audio → text converter.
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
    try {
        const { audioBase64, mimeType } = await req.json()

        if (!audioBase64) {
            return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' })

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType ?? 'audio/webm',
                    data: audioBase64,
                },
            },
            'Transcribe this audio exactly as spoken. Return only the spoken text, nothing else.',
        ])

        const text = result.response.text().trim()
        return NextResponse.json({ text })
    } catch (err) {
        console.error('[transcribe]', err)
        return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
    }
}
