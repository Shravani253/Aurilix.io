/**
 * app/api/speak/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { lookupId } from '@/lib/vocabulary'
import { expandAbbreviations } from '@/lib/abbreviations'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ── Symbol metadata ───────────────────────────────────────────────────────────

const SYMBOL_NAMES: Record<string, string> = {
    '◯': 'ENTITY', '╱': 'ACTION', '→': 'CAUSE', '✶': 'IMPORTANT',
    '△': 'SYSTEM', '▬': 'RESOURCE', '⊂': 'CATEGORY', '≡': 'DEFINITION',
    '↑': 'PRIORITY', '#': 'QUANTITY',
}

// ── First-person pronouns — never add article ─────────────────────────────────
const FIRST_PERSON = new Set(['i', 'me', 'my', 'mine', 'we', 'us', 'our'])
const SECOND_PERSON = new Set(['you', 'your', 'yours'])
const THIRD_PERSON = new Set(['he', 'him', 'his', 'she', 'her', 'hers', 'they', 'them', 'their'])
const ALL_PRONOUNS = new Set([...FIRST_PERSON, ...SECOND_PERSON, ...THIRD_PERSON, 'it', 'its'])

// ── Helpers ───────────────────────────────────────────────────────────────────

function article(word: string): string {
    if (ALL_PRONOUNS.has(word.toLowerCase())) return ''
    return 'aeiou'.includes((word ?? '')[0]?.toLowerCase()) ? 'an' : 'a'
}

function withArticle(word: string): string {
    const art = article(word)
    return art ? `${art} ${word}` : word
}

function cap(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/**
 * Conjugate verb based on subject.
 * If subject is first/second person → base form (I want, you write)
 * Otherwise → 3rd person singular (he wants, a pen writes)
 */
function conjugate(verb: string, subject?: string): string {
    if (!verb) return verb
    const sub = subject?.toLowerCase() ?? ''
    // First or second person → base form
    if (FIRST_PERSON.has(sub) || SECOND_PERSON.has(sub)) return verb
    // Irregular
    if (verb === 'be') return 'is'
    if (verb === 'have') return 'has'
    if (verb === 'do') return 'does'
    if (verb === 'go') return 'goes'
    // Regular conjugation
    if (verb.endsWith('e')) return verb + 's'
    if (['s', 'sh', 'ch', 'x', 'z'].some(s => verb.endsWith(s))) return verb + 'es'
    if (verb.endsWith('y') && !'aeiou'.includes(verb[verb.length - 2])) return verb.slice(0, -1) + 'ies'
    return verb + 's'
}

function extractJSON(raw: string): string {
    let c = raw.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
    const s = c.indexOf('{'), e = c.lastIndexOf('}')
    if (s !== -1 && e > s) c = c.slice(s, e + 1)
    return c
}

// ── Token type ────────────────────────────────────────────────────────────────

export interface ResolvedToken {
    raw: string
    grammarSymbol: string
    symbolName: string
    id: number | null
    word: string | null
    pos: string | null
    wasCompressed: boolean
}

// ── Expand compressed tokens ──────────────────────────────────────────────────

function expandCompressed(
    symbolic: string,
    resolvedWords: Array<{ id: number; word: string }>
): string {
    return symbolic.trim().split(/\s+/).map(raw => {
        if (/^[◯╱→✶△▬⊂≡↑#]@/.test(raw)) return raw
        const match = raw.match(/^@(\d+)$/)
        if (match) {
            const id = parseInt(match[1])
            const entry = lookupId(id)
            if (entry?.symbol) return `${entry.symbol}@${id}`
        }
        return raw
    }).join(' ')
}

function resolveTokens(input: string): ResolvedToken[] {
    return input.trim().split(/\s+/).filter(Boolean).map(raw => {
        const match = raw.match(/^([◯╱→✶△▬⊂≡↑#]?)@(\d+)$/)
        if (match) {
            const grammarSymbol = match[1] || ''
            const id = parseInt(match[2])
            const entry = lookupId(id)
            const word = entry?.word ? expandAbbreviations(entry.word) : null
            return {
                raw, grammarSymbol,
                symbolName: SYMBOL_NAMES[grammarSymbol] ?? grammarSymbol,
                id, word,
                pos: entry?.pos ?? null,
                wasCompressed: /^@\d+$/.test(raw),
            }
        }
        return {
            raw, grammarSymbol: raw,
            symbolName: SYMBOL_NAMES[raw] ?? raw,
            id: null, word: null, pos: null, wasCompressed: false,
        }
    })
}

function buildAnnotated(tokens: ResolvedToken[]): string {
    return tokens.map(t =>
        t.word
            ? `${t.grammarSymbol}(${t.word}/${t.pos})`
            : t.id !== null
                ? `${t.grammarSymbol}(@${t.id}/unknown)`
                : t.grammarSymbol || t.raw
    ).join(' ')
}

function extractSymbolSeq(tokens: ResolvedToken[]): string {
    return tokens.map(t => t.grammarSymbol).filter(Boolean).join(' ')
}

// ── Deterministic graph reconstruction ───────────────────────────────────────

function graphReconstruct(tokens: ResolvedToken[]): { sentence: string; confidence: number } {
    const symSeq = extractSymbolSeq(tokens)
    const words = tokens.map(t => t.word).filter(Boolean) as string[]

    if (!words.length) return { sentence: '', confidence: 0 }

    // Check for any unresolved tokens (word is null = @ID not in vocabulary)
    const hasUnresolved = tokens.some(t => t.id !== null && !t.word)
    if (hasUnresolved) {
        console.log('[speak] Unresolved tokens found — routing to Gemini')
        return { sentence: '', confidence: 0.3 }
    }

    // Find key roles
    const entities = tokens.filter(t => t.grammarSymbol === '◯' && t.word)
    const action = tokens.find(t => t.grammarSymbol === '╱')
    const resource = tokens.find(t => t.grammarSymbol === '▬')
    const cause = tokens.find(t => t.grammarSymbol === '→')
    const category = tokens.find(t => t.grammarSymbol === '⊂')
    const definition = tokens.find(t => t.grammarSymbol === '≡')
    const important = tokens.find(t => t.grammarSymbol === '✶')
    const priority = tokens.find(t => t.grammarSymbol === '↑')
    const quantity = tokens.find(t => t.grammarSymbol === '#')
    const system = tokens.find(t => t.grammarSymbol === '△')

    const subject = entities[0]
    const object = entities[1]

    // ── Named patterns (highest confidence) ──────────────────────────────────

    // possession: ◯ ⊂
    if (symSeq === '◯ ⊂' && subject && category) {
        const own = ALL_PRONOUNS.has(category.word!) ? `${category.word}'s` : `${withArticle(category.word!)}'s`
        return { sentence: cap(`${own} ${subject.word}.`), confidence: 0.97 }
    }

    // definition: ◯ ≡
    if (symSeq === '◯ ≡' && subject && definition) {
        return { sentence: cap(`${withArticle(subject.word!)} is ${withArticle(definition.word!)}.`), confidence: 0.97 }
    }

    // causation: ◯ →
    if (symSeq === '◯ →' && subject && cause) {
        return { sentence: cap(`${cap(withArticle(subject.word!))} leads to ${withArticle(cause.word!)}.`), confidence: 0.93 }
    }

    // classification: ◯ ⊂ ◯
    if (symSeq === '◯ ⊂ ◯' && subject && object) {
        return { sentence: cap(`${cap(withArticle(subject.word!))} is a type of ${withArticle(object.word!)}.`), confidence: 0.94 }
    }

    // simple action: ◯ ╱
    if (symSeq === '◯ ╱' && subject && action) {
        const verb = conjugate(action.word!, subject.word!)
        return { sentence: cap(`${cap(withArticle(subject.word!))} ${verb}.`), confidence: 0.91 }
    }

    // action on resource: ◯ ╱ ▬
    if (symSeq === '◯ ╱ ▬' && subject && action && resource) {
        const verb = conjugate(action.word!, subject.word!)
        return { sentence: cap(`${cap(withArticle(subject.word!))} ${verb} on ${withArticle(resource.word!)}.`), confidence: 0.92 }
    }

    // action on entity: ◯ ╱ ◯
    if (symSeq === '◯ ╱ ◯' && subject && action && object) {
        const verb = conjugate(action.word!, subject.word!)
        return { sentence: cap(`${cap(withArticle(subject.word!))} ${verb} ${withArticle(object.word!)}.`), confidence: 0.91 }
    }

    // action causing: ◯ ╱ ▬ →
    if (symSeq === '◯ ╱ ▬ →' && subject && action && resource && cause) {
        const verb = conjugate(action.word!, subject.word!)
        return { sentence: cap(`${cap(withArticle(subject.word!))} ${verb} on ${withArticle(resource.word!)}, leading to ${withArticle(cause.word!)}.`), confidence: 0.89 }
    }

    // priority action: ◯ ╱ ▬ ↑
    if (symSeq === '◯ ╱ ▬ ↑' && subject && action && resource) {
        const verb = conjugate(action.word!, subject.word!)
        return { sentence: cap(`${cap(withArticle(subject.word!))} urgently ${verb} on ${withArticle(resource.word!)}.`), confidence: 0.88 }
    }

    // critical action: ◯ ╱ ◯ ✶
    if (subject && action && object && important) {
        const verb = conjugate(action.word!, subject.word!)
        return { sentence: cap(`${cap(withArticle(subject.word!))} critically ${verb} ${withArticle(object.word!)}.`), confidence: 0.87 }
    }

    // ── General fallback (builds from parts) ─────────────────────────────────

    const parts: string[] = []
    const conf: number[] = []

    if (subject) {
        const pre = important ? `${important.word} ` : ''
        const art = article(subject.word!)
        parts.push(cap(art ? `${art} ${pre}${subject.word}` : `${pre}${subject.word}`))
        conf.push(0.90)
    }

    if (action) {
        parts.push(conjugate(action.word!, subject?.word ?? undefined))
        conf.push(0.88)
    }

    if (resource) { parts.push(`on ${withArticle(resource.word!)}`); conf.push(0.85) }
    if (object) { parts.push(withArticle(object.word!)); conf.push(0.85) }
    if (quantity) { parts.push(`${quantity.word} times`); conf.push(0.82) }
    if (priority) { parts.push('as top priority'); conf.push(0.85) }
    if (system) { parts.push(`using ${withArticle(system.word!)}`); conf.push(0.80) }
    if (cause) { parts.push(`, leading to ${withArticle(cause.word!)}`); conf.push(0.87) }
    if (category) { parts.push(`belonging to ${withArticle(category.word!)}`); conf.push(0.87) }
    if (definition) { parts.push(`is ${withArticle(definition.word!)}`); conf.push(0.92) }

    if (!parts.length) return { sentence: '', confidence: 0.3 }

    const sentence = parts.join(' ').replace(/\s+,/g, ',').replace(/\s{2,}/g, ' ').trim() + '.'
    const confidence = conf.reduce((a, b) => a + b, 0) / conf.length

    return { sentence: cap(sentence), confidence }
}

// ── Gemini prompt ─────────────────────────────────────────────────────────────

const GEMINI_DECODE = `You are a decoder for a symbolic grammar language.

Each token is shown as: SYMBOL(word/pos)
Symbols: ◯=ENTITY ╱=ACTION →=CAUSE ✶=IMPORTANT △=SYSTEM ▬=RESOURCE ⊂=CATEGORY ≡=DEFINITION ↑=PRIORITY #=QUANTITY

Pattern templates:
  ◯ ⊂      → "{0} belongs to {1}"
  ◯ ╱      → "{0} performs {1}"
  ◯ ╱ ▬    → "{0} does {1} on {2}"
  ◯ ╱ ◯    → "{0} performs {1} on {2}"
  ◯ →      → "{0} leads to {1}"
  ◯ ≡      → "{0} is {1}"

Rules:
- Write ONE fluent English sentence. Correct grammar and tense.
- Respect pronouns: ◯(i) = "I", not "A i". ◯(me) = "me".
- For ◯(i) ╱(want) ◯(pen) → "I want a pen." NOT "A i wants a pen."
- Expand abbreviations (llm → large language model).
- Rate your confidence 0–1.

Return ONLY valid JSON: { "text": "sentence here", "confidence": 0.95 }`

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const input: string =
            typeof body.symbolic === 'string' ? body.symbolic
                : Array.isArray(body.symbols) ? (body.symbols as string[]).join(' ')
                    : ''

        if (!input.trim()) {
            return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
        }

        // Step 1: Expand compressed tokens
        const rawTokens = input.trim().split(/\s+/).filter(Boolean)
        const resolvedWords = rawTokens
            .map(t => {
                const m = t.match(/@(\d+)/)
                if (!m) return null
                const id = parseInt(m[1])
                const entry = lookupId(id)
                return entry ? { id, word: entry.word } : null
            })
            .filter(Boolean) as Array<{ id: number; word: string }>

        const isCompressed = rawTokens.some(t => /^@\d+$/.test(t))
        const expanded = isCompressed ? expandCompressed(input, resolvedWords) : input

        // Step 2: Resolve tokens
        const resolved = resolveTokens(expanded)
        const annotated = buildAnnotated(resolved)
        const symbolSeq = extractSymbolSeq(resolved)

        console.log(`[speak] input:     ${input}`)
        console.log(`[speak] expanded:  ${expanded}`)
        console.log(`[speak] annotated: ${annotated}`)
        console.log(`[speak] symSeq:    ${symbolSeq}`)

        // Step 3: Deterministic graph reconstruction
        const { sentence: graphSentence, confidence: graphConf } = graphReconstruct(resolved)
        console.log(`[speak] graph:     "${graphSentence}" conf=${graphConf.toFixed(2)}`)

        let finalText = graphSentence
        let confidence = graphConf
        let usedGemini = false

        // Step 4: High confidence → return directly, skip Gemini
        if (graphConf >= 0.80 && graphSentence && !body.forceGemini) {
            console.log('[speak] High confidence — skipping Gemini')
        } else {
            // Step 5: Low confidence or unresolved tokens → Gemini
            console.log(`[speak] Low confidence (${(graphConf * 100).toFixed(0)}%) — using Gemini`)
            usedGemini = true

            const model = genAI.getGenerativeModel({
                model: 'models/gemini-2.5-flash',
                generationConfig: { responseMimeType: 'application/json' },
            })

            const contextLine = body.context ? `\nContext: ${expandAbbreviations(body.context)}` : ''
            const result = await model.generateContent([
                GEMINI_DECODE,
                `Decode: ${annotated}${contextLine}`,
            ])

            const raw = result.response.text().trim()
            const clean = extractJSON(raw)

            try {
                const parsed = JSON.parse(clean)
                finalText = parsed.text ?? graphSentence
                confidence = parsed.confidence ?? confidence
            } catch {
                console.error('[speak] Gemini JSON parse failed:', raw)
            }
        }

        return NextResponse.json({
            text: finalText,
            confidence: Math.round(confidence * 100) / 100,
            usedGemini,
            resolved,
            symbolic: input,
            expanded,
            pattern: symbolSeq,
            audioBase64: null,
            mimeType: 'text/plain',
        })
    } catch (err) {
        console.error('[speak]', err)
        return NextResponse.json({ error: 'Decode failed' }, { status: 500 })
    }
}