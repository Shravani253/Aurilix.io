/**
 * scripts/enrich-vocabulary.ts
 * Run:  npx tsx scripts/enrich-vocabulary.ts
 *
 * Adds "symbol" field to every vocabulary entry missing it.
 * Uses only Node.js built-ins — no imports from src/lib needed.
 */

import fs from 'fs'
import path from 'path'

const VOCAB_PATH = path.join(process.cwd(), 'data', 'vocabulary.json')

const POS_TO_SYMBOL: Record<string, string> = {
    noun: '◯',
    verb: '╱',
    adjective: '✶',
    adverb: '↑',
    other: '△',
}

async function enrich() {
    if (!fs.existsSync(VOCAB_PATH)) {
        console.error(`vocabulary.json not found at: ${VOCAB_PATH}`)
        process.exit(1)
    }

    console.log(`Reading: ${VOCAB_PATH}`)
    const store = JSON.parse(fs.readFileSync(VOCAB_PATH, 'utf-8'))

    const entries = Object.values(store.idToEntry) as any[]
    const needsWork = entries.filter((e: any) => !e.symbol)

    console.log(`Total entries : ${entries.length}`)
    console.log(`Need symbol   : ${needsWork.length}`)

    if (needsWork.length === 0) {
        console.log('\nAll entries already have a symbol field. Nothing to do.')
        return
    }

    let updated = 0
    for (const entry of needsWork) {
        const pos = entry.pos ?? 'other'
        const symbol = POS_TO_SYMBOL[pos] ?? '◯'
        store.idToEntry[String(entry.id)].symbol = symbol
        if (entry.word && store.wordToId[entry.word] === undefined) {
            store.wordToId[entry.word] = entry.id
        }
        updated++
    }

    fs.writeFileSync(VOCAB_PATH, JSON.stringify(store, null, 2), 'utf-8')

    console.log(`\nDone. Updated ${updated} entries.`)
    console.log('\nSample entries after migration:')
        ; (Object.values(store.idToEntry) as any[]).slice(0, 8).forEach((e: any) =>
            console.log(`  @${String(e.id).padEnd(4)} = "${e.word}"  (${e.pos} -> ${e.symbol})`)
        )
}

enrich().catch(console.error)