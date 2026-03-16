/**
 * lib/graph-probe.ts
 *
 * Probes LLM latent memory for missing or uncertain graph edges.
 *
 * Instead of asking Gemini "write a sentence", we ask focused
 * probability questions about specific word relationships:
 *
 *   probeAction("pen", "paper")
 *   → "Given pen acting on paper, most likely verb?"
 *   → [{ write:0.87 }, { draw:0.45 }, { mark:0.23 }]
 *
 * Results are cached in semantic-memory.json — never re-probed for the same pair.
 *
 * PROBE TYPES:
 *   probeAction(subject, object?)  — find implied verb
 *   probeObject(action, subject?)  — find implied object/resource
 *   probeEdgeWeight(A, B)          — how likely is A directly related to B?
 *   probeResolveId(symbol, neighbors) — resolve unknown @ID from context
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCachedProbe, cacheProbe, recordEdgeWeight, Candidate } from './semantic-memory'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PROBE_SYSTEM = `You are a semantic probability estimator.
Answer focused questions about word relationships with probability scores.
Return ONLY valid JSON. Probabilities must be 0.0–1.0.`

function extractJSON(raw: string): any {
    const c = raw.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
    const s = c.indexOf('{'), e = c.lastIndexOf('}')
    return JSON.parse(s !== -1 && e > s ? c.slice(s, e + 1) : c)
}

export async function probeAction(subject: string, object?: string): Promise<Candidate[]> {
    const key = `action:${subject}${object ? '+' + object : ''}`
    const cached = getCachedProbe(key)
    if (cached) return cached.candidates

    const prompt = object
        ? `Subject "${subject}" acting on "${object}" — top 3 most likely verbs?`
        : `Subject "${subject}" — top 3 most likely actions it performs?`

    try {
        const model = genAI.getGenerativeModel({
            model: 'models/gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
        })
        const result = await model.generateContent([
            PROBE_SYSTEM,
            `${prompt}\nReturn: { "candidates": [{"word":"write","probability":0.87,"symbol":"╱"}] }`,
        ])
        const data: { candidates: Candidate[] } = extractJSON(result.response.text().trim())
        cacheProbe(key, data.candidates ?? [])
        return data.candidates ?? []
    } catch { return [] }
}

export async function probeObject(action: string, subject?: string): Promise<Candidate[]> {
    const key = `object:${action}${subject ? '+' + subject : ''}`
    const cached = getCachedProbe(key)
    if (cached) return cached.candidates

    const prompt = subject
        ? `"${subject}" performing "${action}" — most likely object or resource?`
        : `Action "${action}" — top 3 most likely objects it acts on?`

    try {
        const model = genAI.getGenerativeModel({
            model: 'models/gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
        })
        const result = await model.generateContent([
            PROBE_SYSTEM,
            `${prompt}\nReturn: { "candidates": [{"word":"paper","probability":0.82,"symbol":"▬"}] }`,
        ])
        const data: { candidates: Candidate[] } = extractJSON(result.response.text().trim())
        cacheProbe(key, data.candidates ?? [])
        return data.candidates ?? []
    } catch { return [] }
}

export async function probeEdgeWeight(
    fromWord: string, fromType: string,
    toWord: string, toType: string
): Promise<number> {
    const key = `edge:${fromWord}→${toWord}`
    const cached = getCachedProbe(key)
    if (cached?.candidates[0]) return cached.candidates[0].probability

    try {
        const model = genAI.getGenerativeModel({
            model: 'models/gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
        })
        const result = await model.generateContent([
            PROBE_SYSTEM,
            `How semantically likely: ${fromType}("${fromWord}") → ${toType}("${toWord}")?
Rate 0.0–1.0 (1=always, 0.5=sometimes, 0=never).
Return: { "candidates": [{"word":"${toWord}","probability":0.85,"symbol":""}] }`,
        ])
        const data: { candidates: Candidate[] } = extractJSON(result.response.text().trim())
        const prob = data.candidates?.[0]?.probability ?? 0.5
        cacheProbe(key, data.candidates ?? [])
        recordEdgeWeight(fromWord, toWord, `${fromType}→${toType}`, prob)
        return prob
    } catch { return 0.5 }
}

export async function probeResolveId(
    symbol: string,
    neighbors: Array<{ word: string; symbol: string }>
): Promise<Candidate[]> {
    const neighborStr = neighbors.map(n => `${n.symbol}(${n.word})`).join(', ')
    const key = `resolve:${symbol}:${neighborStr}`
    const cached = getCachedProbe(key)
    if (cached) return cached.candidates

    const SYMBOL_NAMES: Record<string, string> = {
        '◯': 'ENTITY', '╱': 'ACTION', '→': 'CAUSE', '✶': 'IMPORTANT',
        '△': 'SYSTEM', '▬': 'RESOURCE', '⊂': 'CATEGORY', '≡': 'DEFINITION',
        '↑': 'PRIORITY', '#': 'QUANTITY',
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'models/gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
        })
        const result = await model.generateContent([
            PROBE_SYSTEM,
            `Context: ${neighborStr}
What word most likely plays role of ${SYMBOL_NAMES[symbol] ?? symbol}?
Top 3 candidates with probabilities.
Return: { "candidates": [{"word":"pen","probability":0.82,"symbol":"${symbol}"}] }`,
        ])
        const data: { candidates: Candidate[] } = extractJSON(result.response.text().trim())
        cacheProbe(key, data.candidates ?? [])
        return data.candidates ?? []
    } catch { return [] }
}