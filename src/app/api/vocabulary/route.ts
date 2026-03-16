/**
 * app/api/vocabulary/route.ts
 *
 * GET    /api/vocabulary        → full vocabulary dump
 * POST   /api/vocabulary        → register one word (auto or manual ID)
 * DELETE /api/vocabulary        → wipe vocabulary (dev only)
 *
 * POST body:
 *   { word, pos? }              → auto ID
 *   { word, pos?, id }          → manual ID
 *   { word, pos?, id, force }   → force reassign
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import {
    getFullVocabulary,
    registerWord,
    registerWordWithId,
    clearCache,
    POS,
} from '@/lib/vocabulary'

const VOCAB_PATH = path.join(process.cwd(), 'data', 'vocabulary.json')

export async function GET() {
    try {
        const store = getFullVocabulary()
        return NextResponse.json({
            totalWords: Object.keys(store.wordToId).length,
            nextId: store.nextId,
            vocabulary: store.wordToId,
            entries: store.idToEntry,
        })
    } catch (err) {
        return NextResponse.json({ error: 'Failed to load vocabulary' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { word, pos, id, force } = await req.json()
        if (!word?.trim()) {
            return NextResponse.json({ error: '"word" is required' }, { status: 400 })
        }

        const validPOS: POS[] = ['noun', 'verb', 'adjective', 'adverb', 'other']
        const safePOS: POS = validPOS.includes(pos) ? (pos as POS) : 'other'
        const cleanWord = word.trim()

        let assignedId: number

        if (typeof id === 'number') {
            try {
                assignedId = registerWordWithId(id, cleanWord, safePOS)
            } catch (err: unknown) {
                if (force) {
                    // Force: delete old entry and re-register
                    const store = getFullVocabulary()
                    const oldEntry = store.idToEntry[String(id)]
                    if (oldEntry) delete store.wordToId[oldEntry.word]
                    const { saveVocabulary, defaultSymbolForPOS } = await import('@/lib/vocabulary')
                    store.idToEntry[String(id)] = { id, word: cleanWord.toLowerCase(), pos: safePOS, symbol: defaultSymbolForPOS(safePOS) }
                    store.wordToId[cleanWord.toLowerCase()] = id
                    if (id >= store.nextId) store.nextId = id + 1
                    saveVocabulary(store)
                    assignedId = id
                } else {
                    return NextResponse.json(
                        { error: err instanceof Error ? err.message : 'ID conflict' },
                        { status: 409 }
                    )
                }
            }
        } else {
            assignedId = registerWord(cleanWord, safePOS)
        }

        return NextResponse.json({
            word: cleanWord.toLowerCase(),
            pos: safePOS,
            id: assignedId,
            ref: `@${assignedId}`,
        })
    } catch (err) {
        return NextResponse.json({ error: 'Failed to register word' }, { status: 500 })
    }
}

export async function DELETE() {
    try {
        const empty = { wordToId: {}, idToEntry: {}, nextId: 1 }
        const dir = path.dirname(VOCAB_PATH)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(VOCAB_PATH, JSON.stringify(empty, null, 2), 'utf-8')
        clearCache()
        return NextResponse.json({ message: 'Vocabulary cleared. All IDs reset.' })
    } catch (err) {
        return NextResponse.json({ error: 'Failed to clear vocabulary' }, { status: 500 })
    }
}
