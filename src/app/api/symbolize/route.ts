/**
 * app/api/symbolize/route.ts
 *
 * POST /api/symbolize
 * { text } → { symbolic, symbolicFull, tokens, pattern, explanation, newWords, expandedText }
 *
 * PIPELINE:
 *  1. Expand abbreviations
 *  2. Gemini identifies words + POS + grammar symbol for THIS sentence
 *  3. Look up / register each token in vocabulary (stores word+pos+symbol)
 *  4. Compress symbols for high-confidence known words
 *  5. Return both full (◯@2 ╱@100 ▬@3) and compressed (@2 @100 @3) forms
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
    lookupWord, registerWord, lookupId,
    POS, defaultSymbolForPOS,
} from '@/lib/vocabulary'
import { expandAbbreviations } from '@/lib/abbreviations'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `You are a linguistic analyser for a minimal symbolic grammar language.

GRAMMAR SYMBOLS:
  ◯ = ENTITY     — nouns: people, objects, places, concepts
  ╱ = ACTION     — verbs: processes, activities
  → = CAUSE      — causation, leads to, results in
  ✶ = IMPORTANT  — adjectives: critical, significant qualities
  △ = SYSTEM     — systems, mechanisms, structures
  ▬ = RESOURCE   — materials, data, media
  ⊂ = CATEGORY   — possession, belongs-to, type-of
  ≡ = DEFINITION — equals, is defined as
  ↑ = PRIORITY   — urgency, high importance
  # = QUANTITY   — numbers, counts

PATTERN RULES:
  Possession    "my/his/her/their X"  → ◯(X) ⊂(owner pronoun)
  Action+Object "X does Y on/with Z" → ◯(X) ╱(Y) ▬(Z)
  Causation     "X leads to Y"       → ◯(X) →(Y)
  Definition    "X is Y"             → ◯(X) ≡(Y)
  Category      "X is type of Y"     → ◯(X) ⊂(Y)

PRONOUNS: my/me/I→"me"  his/him→"him"  her/she→"her"  their/them→"them"  our/us→"us"  you/your→"you"  it/its→"it"
SKIP stop-words: this, that, is, are, was, a, an, the, of, in, on, at, as, by, to, for

USE MINIMUM SYMBOLS — only include a symbol when it adds information not already clear from word meaning.

Return ONLY raw JSON, no markdown:
{
  "tokens": [
    { "word": "pen", "pos": "noun", "symbol": "◯" },
    { "word": "me",  "pos": "noun", "symbol": "⊂" }
  ],
  "pattern": "◯ ⊂",
  "explanation": "pen is the entity, me is the owner — possession pattern"
}`

interface GeminiToken { word: string; pos: string; symbol: string }
interface GeminiResponse { tokens: GeminiToken[]; pattern: string; explanation: string }

export interface EnrichedToken {
    word: string
    pos: POS
    symbol: string
    id: number
    ref: string
    isNew: boolean
    symbolOmitted: boolean
}

function normaliseWord(w: string): string {
    return w.toLowerCase().replace(/-/g, '').trim()
}

function extractJSON(raw: string): string {
    let c = raw.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
    const s = c.indexOf('{'), e = c.lastIndexOf('}')
    if (s !== -1 && e > s) c = c.slice(s, e + 1)
    return c
}

// Compression: omit symbol if word has been seen 5+ times with same symbol
const _symbolConfidence: Record<string, { sym: string; count: number }> = {}

function canOmitSymbol(word: string, symbol: string): boolean {
    const entry = _symbolConfidence[word]
    if (!entry) return false
    return entry.sym === symbol && entry.count >= 5
}

function recordSymbolUse(word: string, symbol: string): void {
    if (!_symbolConfidence[word]) {
        _symbolConfidence[word] = { sym: symbol, count: 1 }
        return
    }
    const e = _symbolConfidence[word]
    if (e.sym === symbol) e.count++
    else { e.sym = symbol; e.count = 1 }
}

export async function POST(req: NextRequest) {
    try {
        const { text, sessionId } = await req.json()
        if (!text?.trim()) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 })
        }

        // Step 1: Expand abbreviations
        const expandedText = expandAbbreviations(text.trim())
        if (expandedText !== text.trim()) {
            console.log(`[symbolize] Expanded: "${text}" → "${expandedText}"`)
        }

        // Step 2: Gemini identifies tokens + assigns grammar symbols
        const model = genAI.getGenerativeModel({
            model: 'models/gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
        })

        const result = await model.generateContent([
            SYSTEM_PROMPT,
            `Encode with minimum symbols: "${expandedText}"`,
        ])

        const raw = result.response.text().trim()
        const clean = extractJSON(raw)

        let parsed: GeminiResponse
        try {
            parsed = JSON.parse(clean)
        } catch {
            console.error('[symbolize] JSON parse failed:', raw)
            return NextResponse.json(
                { error: 'Model returned invalid JSON. Try rephrasing.' },
                { status: 422 }
            )
        }

        if (!Array.isArray(parsed.tokens) || parsed.tokens.length === 0) {
            return NextResponse.json(
                { error: 'No tokens extracted. Try a different sentence.' },
                { status: 422 }
            )
        }

        // Step 3: Register each token in vocabulary
        const newWords: string[] = []
        const tokens: EnrichedToken[] = []

        for (const token of parsed.tokens) {
            const word = normaliseWord(token.word)
            if (!word) continue

            const pos: POS = (
                ['noun', 'verb', 'adjective', 'adverb', 'other'].includes(token.pos)
                    ? token.pos : 'other'
            ) as POS

            const isNew = lookupWord(word) === undefined
            const id = registerWord(word, pos)
            const entry = lookupId(id)

            // Use Gemini's context-aware symbol for THIS sentence
            // Fall back to stored symbol or POS default
            const symbol = token.symbol || entry?.symbol || defaultSymbolForPOS(pos)

            if (isNew) newWords.push(word)
            recordSymbolUse(word, symbol)

            // Compression: omit symbol if high confidence for this word
            const symbolOmitted = canOmitSymbol(word, symbol)

            tokens.push({ word, pos, symbol, id, ref: `@${id}`, isNew, symbolOmitted })
        }

        // Step 4: Build full and compressed symbolic sentences
        const symbolicFull = tokens.map(t => `${t.symbol}@${t.id}`).join(' ')
        const symbolic = tokens.map(t => t.symbolOmitted ? `@${t.id}` : `${t.symbol}@${t.id}`).join(' ')
        const symbolSeq = tokens.map(t => t.symbol).join(' ')

        console.log(`[symbolize] "${text}"`)
        console.log(`[symbolize] full:       ${symbolicFull}`)
        console.log(`[symbolize] compressed: ${symbolic}`)

        return NextResponse.json({
            symbolic,
            symbolicFull,
            tokens,
            pattern: symbolSeq,
            explanation: parsed.explanation ?? '',
            newWords,
            expandedText,
        })
    } catch (err) {
        console.error('[symbolize]', err)
        return NextResponse.json({ error: 'Symbolization failed' }, { status: 500 })
    }
}