/**
 * lib/vocabulary.ts
 *
 * Persistent vocabulary manager.
 * Each entry stores: { id, word, pos, symbol }
 *
 * POS → Symbol mapping:
 *   noun      → ◯  ENTITY
 *   verb      → ╱  ACTION
 *   adjective → ✶  IMPORTANCE
 *   adverb    → ↑  PRIORITY
 *   other     → △  SYSTEM
 */

import fs from 'fs'
import path from 'path'

export type POS = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other'

export interface VocabEntry {
  id: number
  word: string   // always lowercase
  pos: POS
  symbol: string   // default grammar symbol derived from POS
}

export interface VocabularyStore {
  wordToId: Record<string, number>
  idToEntry: Record<string, VocabEntry>
  nextId: number
}

// POS → default grammar symbol
export const POS_TO_SYMBOL: Record<POS, string> = {
  noun: '◯',
  verb: '╱',
  adjective: '✶',
  adverb: '↑',
  other: '△',
}

export function defaultSymbolForPOS(pos: POS): string {
  return POS_TO_SYMBOL[pos] ?? '◯'
}

const DATA_DIR = path.join(process.cwd(), 'data')
const VOCAB_PATH = path.join(DATA_DIR, 'vocabulary.json')

let _cache: VocabularyStore | null = null

function defaultStore(): VocabularyStore {
  return { wordToId: {}, idToEntry: {}, nextId: 1 }
}

export function loadVocabulary(): VocabularyStore {
  if (_cache) return _cache
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(VOCAB_PATH)) {
      const empty = defaultStore()
      fs.writeFileSync(VOCAB_PATH, JSON.stringify(empty, null, 2), 'utf-8')
      _cache = empty
      return _cache
    }
    _cache = JSON.parse(fs.readFileSync(VOCAB_PATH, 'utf-8')) as VocabularyStore
    return _cache
  } catch (err) {
    console.error('[vocabulary] Load failed:', err)
    _cache = defaultStore()
    return _cache
  }
}

export function saveVocabulary(store: VocabularyStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(VOCAB_PATH, JSON.stringify(store, null, 2), 'utf-8')
    _cache = store
  } catch (err) {
    console.error('[vocabulary] Save failed:', err)
  }
}

export function lookupWord(word: string): number | undefined {
  return loadVocabulary().wordToId[word.toLowerCase()]
}

export function lookupId(id: number): VocabEntry | undefined {
  return loadVocabulary().idToEntry[String(id)]
}

export function getFullVocabulary(): VocabularyStore {
  return loadVocabulary()
}

/**
 * Register a word with auto-assigned ID.
 * Derives symbol from POS automatically.
 * No-op if word already exists.
 */
export function registerWord(word: string, pos: POS): number {
  const store = loadVocabulary()
  const key = word.toLowerCase()

  if (store.wordToId[key] !== undefined) {
    // Migration: add symbol if missing from old entries
    const existing = store.idToEntry[String(store.wordToId[key])]
    if (existing && !existing.symbol) {
      existing.symbol = defaultSymbolForPOS(pos)
      saveVocabulary(store)
    }
    return store.wordToId[key]
  }

  const id: number = store.nextId++
  const symbol: string = defaultSymbolForPOS(pos)
  const entry: VocabEntry = { id, word: key, pos, symbol }

  store.wordToId[key] = id
  store.idToEntry[String(id)] = entry

  saveVocabulary(store)
  console.log(`[vocabulary] Learned @${id} = "${key}" (${pos} → ${symbol})`)
  return id
}

/**
 * Manual ID assignment — you choose the ID.
 * registerWordWithId(2, 'pen', 'noun') → @2 = pen (◯)
 */
export function registerWordWithId(id: number, word: string, pos: POS): number {
  const store = loadVocabulary()
  const key = word.toLowerCase()
  const existingId = store.wordToId[key]
  const existingEntry = store.idToEntry[String(id)]

  if (existingId === id) return id

  if (existingEntry && existingEntry.word !== key) {
    throw new Error(
      `@${id} is already assigned to "${existingEntry.word}". Cannot assign to "${key}".`
    )
  }

  if (existingId !== undefined && existingId !== id) {
    delete store.idToEntry[String(existingId)]
  }

  const symbol: string = defaultSymbolForPOS(pos)
  const entry: VocabEntry = { id, word: key, pos, symbol }

  store.wordToId[key] = id
  store.idToEntry[String(id)] = entry
  if (id >= store.nextId) store.nextId = id + 1

  saveVocabulary(store)
  console.log(`[vocabulary] Manual @${id} = "${key}" (${pos} → ${symbol})`)
  return id
}

export function registerWords(
  words: Array<{ word: string; pos: POS }>
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const { word, pos } of words) {
    result[word.toLowerCase()] = registerWord(word, pos)
  }
  return result
}

/**
 * Add symbol field to all entries that are missing it.
 * Call once after updating vocabulary.ts.
 */
export function migrateSymbols(): number {
  const store = loadVocabulary()
  let migrated = 0
  for (const entry of Object.values(store.idToEntry)) {
    if (!entry.symbol) {
      (entry as VocabEntry).symbol = defaultSymbolForPOS(entry.pos)
      migrated++
    }
  }
  if (migrated > 0) {
    saveVocabulary(store)
    console.log(`[vocabulary] Migrated ${migrated} entries with symbol field`)
  }
  return migrated
}

export function clearCache(): void { _cache = null }