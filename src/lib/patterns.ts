/**
 * lib/patterns.ts
 *
 * Pattern learning system — tracks how symbolic sentences are structured
 * and learns compression rules from repeated usage.
 *
 * Stores in data/patterns.json:
 *  - sequences:        symbol sequence → name + template + usage count
 *  - wordRoles:        per-word symbol history + ambiguity flag
 *  - bigrams:          word pair → implied words between them
 *  - clusters:         semantic groups (writing, medical, AI, etc.)
 *  - fingerprints:     hash of symbol sequence → confidence score
 *  - compressionRules: per-word omit decision
 */

import fs from 'fs'
import path from 'path'

export interface SequencePattern {
    symbols: string
    name: string
    template: string
    count: number
    examples: string[]
}

export interface WordRole {
    word: string
    dominant: string
    counts: Record<string, number>
    total: number
    ambiguous: boolean
}

export interface BigramTransition {
    from: string
    to: string
    impliedSymbols: string[]
    impliedWords: string[]
    count: number
    confidence: number
}

export interface ConceptCluster {
    id: string
    name: string
    words: string[]
    symbol: string
}

export interface Fingerprint {
    hash: string
    symbolSeq: string
    wordSeqs: string[]
    count: number
    confidence: number
    failCount: number
}

export interface CompressionRule {
    word: string
    omitSymbol: boolean
    defaultSymbol: string
    confidence: number
}

export interface PatternStore {
    sequences: Record<string, SequencePattern>
    wordRoles: Record<string, WordRole>
    bigrams: Record<string, BigramTransition>
    clusters: Record<string, ConceptCluster>
    wordToCluster: Record<string, string>
    fingerprints: Record<string, Fingerprint>
    compressionRules: Record<string, CompressionRule>
}

export interface LearnedToken {
    word: string
    symbol: string
    id: number
}

const CONFIDENCE_THRESHOLD = 0.85
const AMBIGUITY_THRESHOLD = 0.70
const MIN_OBSERVATIONS = 3

const DATA_DIR = path.join(process.cwd(), 'data')
const PATTERNS_PATH = path.join(DATA_DIR, 'patterns.json')

const BASE_SEQUENCES: SequencePattern[] = [
    { symbols: '◯ ⊂', name: 'Possession', template: '{0} belongs to {1}', count: 0, examples: [] },
    { symbols: '◯ ╱', name: 'Action', template: '{0} performs {1}', count: 0, examples: [] },
    { symbols: '◯ ╱ ▬', name: 'Action on Resource', template: '{0} does {1} with {2}', count: 0, examples: [] },
    { symbols: '◯ ╱ ◯', name: 'Action on Entity', template: '{0} performs {1} on {2}', count: 0, examples: [] },
    { symbols: '◯ →', name: 'Causation', template: '{0} leads to {1}', count: 0, examples: [] },
    { symbols: '◯ ≡', name: 'Definition', template: '{0} is {1}', count: 0, examples: [] },
    { symbols: '◯ ⊂ ◯', name: 'Classification', template: '{0} is a type of {1}', count: 0, examples: [] },
    { symbols: '◯ ╱ ▬ →', name: 'Action Causing', template: '{0} does {1} on {2} causing {3}', count: 0, examples: [] },
    { symbols: '◯ ╱ ▬ ↑', name: 'Priority Action', template: '{0} urgently does {1} on {2}', count: 0, examples: [] },
    { symbols: '◯ ╱ ◯ ✶', name: 'Critical Action', template: '{0} critically performs {1} on {2}', count: 0, examples: [] },
    { symbols: '# ◯', name: 'Quantity Entity', template: '{1} {0}s', count: 0, examples: [] },
    { symbols: '◯ # ╱', name: 'Entity Count Action', template: '{0} does {2} {1} times', count: 0, examples: [] },
]

const BASE_CLUSTERS: ConceptCluster[] = [
    { id: 'writing_instruments', name: 'Writing Instruments', symbol: '◯', words: ['pen', 'pencil', 'marker', 'stylus', 'chalk', 'crayon', 'quill'] },
    { id: 'writing_surfaces', name: 'Writing Surfaces', symbol: '▬', words: ['paper', 'page', 'notebook', 'canvas', 'board', 'screen', 'document'] },
    { id: 'writing_actions', name: 'Writing Actions', symbol: '╱', words: ['write', 'draw', 'sketch', 'inscribe', 'draft', 'compose', 'scribble'] },
    { id: 'medical_procedures', name: 'Medical Procedures', symbol: '╱', words: ['surgery', 'operation', 'procedure', 'treatment', 'therapy', 'transplant'] },
    { id: 'medical_entities', name: 'Medical Entities', symbol: '◯', words: ['patient', 'doctor', 'nurse', 'surgeon', 'physician', 'specialist'] },
    { id: 'medical_outcomes', name: 'Medical Outcomes', symbol: '→', words: ['recovery', 'healing', 'cure', 'remission', 'discharge', 'rehabilitation'] },
    { id: 'ai_models', name: 'AI Models', symbol: '◯', words: ['llm', 'model', 'gpt', 'claude', 'gemini', 'bert', 'transformer', 'agent'] },
    { id: 'ai_actions', name: 'AI Actions', symbol: '╱', words: ['generate', 'train', 'finetune', 'infer', 'predict', 'embed', 'tokenize'] },
    { id: 'data_resources', name: 'Data Resources', symbol: '▬', words: ['data', 'dataset', 'token', 'embedding', 'vector', 'text', 'prompt'] },
    { id: 'blockchain_entities', name: 'Blockchain Entities', symbol: '◯', words: ['wallet', 'contract', 'token', 'node', 'validator', 'dao', 'blockchain'] },
    { id: 'blockchain_actions', name: 'Blockchain Actions', symbol: '╱', words: ['stake', 'mint', 'burn', 'transfer', 'swap', 'deploy', 'vote'] },
    { id: 'ownership_pronouns', name: 'Ownership Pronouns', symbol: '⊂', words: ['me', 'him', 'her', 'them', 'us', 'you', 'it'] },
]

let _cache: PatternStore | null = null

function defaultStore(): PatternStore {
    const store: PatternStore = {
        sequences: {}, wordRoles: {}, bigrams: {},
        clusters: {}, wordToCluster: {}, fingerprints: {}, compressionRules: {},
    }
    for (const s of BASE_SEQUENCES) store.sequences[s.symbols] = { ...s }
    for (const c of BASE_CLUSTERS) {
        store.clusters[c.id] = { ...c, words: [...c.words] }
        for (const w of c.words) store.wordToCluster[w] = c.id
    }
    return store
}

export function loadPatterns(): PatternStore {
    if (_cache) return _cache
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        if (!fs.existsSync(PATTERNS_PATH)) {
            const fresh = defaultStore()
            fs.writeFileSync(PATTERNS_PATH, JSON.stringify(fresh, null, 2), 'utf-8')
            _cache = fresh
            return _cache
        }
        _cache = JSON.parse(fs.readFileSync(PATTERNS_PATH, 'utf-8')) as PatternStore
        for (const s of BASE_SEQUENCES) {
            if (!_cache.sequences[s.symbols]) _cache.sequences[s.symbols] = { ...s }
        }
        for (const c of BASE_CLUSTERS) {
            if (!_cache.clusters[c.id]) {
                _cache.clusters[c.id] = { ...c }
                for (const w of c.words) _cache.wordToCluster[w] = c.id
            }
        }
        if (!_cache.bigrams) _cache.bigrams = {}
        if (!_cache.clusters) _cache.clusters = {}
        if (!_cache.wordToCluster) _cache.wordToCluster = {}
        if (!_cache.fingerprints) _cache.fingerprints = {}
        if (!_cache.compressionRules) _cache.compressionRules = {}
        return _cache
    } catch {
        _cache = defaultStore()
        return _cache
    }
}

export function savePatterns(store: PatternStore): void {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        fs.writeFileSync(PATTERNS_PATH, JSON.stringify(store, null, 2), 'utf-8')
        _cache = store
    } catch (err) {
        console.error('[patterns] Save failed:', err)
    }
}

export function fingerprintHash(symbolSeq: string): string {
    const map: Record<string, string> = {
        '◯': 'E', '╱': 'A', '→': 'C', '✶': 'I', '△': 'S', '▬': 'R', '⊂': 'B', '≡': 'D', '↑': 'P', '#': 'Q',
    }
    return symbolSeq.split(' ').map(s => map[s] ?? 'X').join('_')
}

export function extractSymbolSequence(symbolic: string): string {
    return symbolic.trim().split(/\s+/).map(t => {
        const m = t.match(/^([◯╱→✶△▬⊂≡↑#])/)
        return m ? m[1] : ''
    }).filter(Boolean).join(' ')
}

export function matchSequence(symbolSeq: string): SequencePattern | null {
    const store = loadPatterns()
    if (store.sequences[symbolSeq]) return store.sequences[symbolSeq]
    for (const seq of Object.values(store.sequences)) {
        if (symbolSeq.startsWith(seq.symbols) || seq.symbols.startsWith(symbolSeq)) return seq
    }
    return null
}

export function getCluster(word: string): ConceptCluster | null {
    const store = loadPatterns()
    const clusterId = store.wordToCluster[word]
    return clusterId ? (store.clusters[clusterId] ?? null) : null
}

export function getClusterSiblings(word: string): string[] {
    const cluster = getCluster(word)
    return cluster ? cluster.words.filter(w => w !== word) : []
}

export function recordDecodeConfidence(hash: string, confidence: number): void {
    const store = loadPatterns()
    const fp = store.fingerprints[hash]
    if (!fp) return
    if (confidence < 0.7) {
        fp.failCount = (fp.failCount ?? 0) + 1
        fp.confidence = Math.max(0, fp.confidence - 0.1)
    } else {
        fp.confidence = Math.min(1.0, fp.confidence + 0.02)
    }
    savePatterns(store)
}

export function learnFromEncoding(
    tokens: LearnedToken[],
    symbolic: string,
    sessionId?: string
): void {
    const store = loadPatterns()
    const symSeq = tokens.map(t => t.symbol).join(' ')
    const words = tokens.map(t => t.word)

    // Record sequence
    if (!store.sequences[symSeq]) {
        store.sequences[symSeq] = {
            symbols: symSeq, name: `Pattern: ${symSeq}`,
            template: buildDefaultTemplate(symSeq), count: 0, examples: [],
        }
    }
    const seq = store.sequences[symSeq]
    seq.count++
    if (!seq.examples.includes(symbolic) && seq.examples.length < 8) seq.examples.push(symbolic)

    // Word roles
    for (const t of tokens) {
        if (!store.wordRoles[t.word]) {
            store.wordRoles[t.word] = { word: t.word, dominant: t.symbol, counts: {}, total: 0, ambiguous: false }
        }
        const role = store.wordRoles[t.word]
        role.counts[t.symbol] = (role.counts[t.symbol] ?? 0) + 1
        role.total++
        role.dominant = Object.entries(role.counts).sort(([, a], [, b]) => b - a)[0][0]
        const domConf = role.counts[role.dominant] / role.total
        role.ambiguous = role.total >= MIN_OBSERVATIONS && domConf < AMBIGUITY_THRESHOLD
    }

    // Bigrams
    for (let i = 0; i < tokens.length - 1; i++) {
        for (let j = i + 1; j < Math.min(i + 4, tokens.length); j++) {
            const key = `${tokens[i].word}+${tokens[j].word}`
            const between = tokens.slice(i + 1, j)
            if (!store.bigrams[key]) {
                store.bigrams[key] = { from: tokens[i].word, to: tokens[j].word, impliedSymbols: [], impliedWords: [], count: 0, confidence: 0 }
            }
            const bg = store.bigrams[key]
            bg.count++
            for (const t of between) {
                if (!bg.impliedSymbols.includes(t.symbol)) bg.impliedSymbols.push(t.symbol)
                if (!bg.impliedWords.includes(t.word)) bg.impliedWords.push(t.word)
            }
            bg.confidence = Math.min(bg.count / 5, 1.0)
        }
    }

    // Fingerprint
    const hash = fingerprintHash(symSeq)
    const wordSeq = words.join('+')
    if (!store.fingerprints[hash]) {
        store.fingerprints[hash] = { hash, symbolSeq: symSeq, wordSeqs: [], count: 0, confidence: 0.5, failCount: 0 }
    }
    const fp = store.fingerprints[hash]
    fp.count++
    if (!fp.wordSeqs.includes(wordSeq) && fp.wordSeqs.length < 20) fp.wordSeqs.push(wordSeq)
    fp.confidence = Math.min(1.0, 0.5 + fp.count * 0.05)

    // Compression rules
    for (const t of tokens) {
        const role = store.wordRoles[t.word]
        if (role && role.total >= MIN_OBSERVATIONS) {
            const conf = role.counts[role.dominant] / role.total
            store.compressionRules[t.word] = {
                word: t.word, omitSymbol: conf >= CONFIDENCE_THRESHOLD && !role.ambiguous,
                defaultSymbol: role.dominant, confidence: conf,
            }
        }
    }

    savePatterns(store)
}

export function compressTokens(tokens: LearnedToken[]): {
    full: string; compressed: string
    tokens: Array<{ word: string; symbol: string; id: number; symbolOmitted: boolean }>
} {
    const store = loadPatterns()
    const symSeq = tokens.map(t => t.symbol).join(' ')
    const words = tokens.map(t => t.word)
    const hash = fingerprintHash(symSeq)
    const fp = store.fingerprints[hash]
    const fullyOk = fp && fp.wordSeqs.includes(words.join('+')) && fp.confidence >= CONFIDENCE_THRESHOLD && (fp.failCount ?? 0) < 3

    const enriched = tokens.map(t => {
        const rule = store.compressionRules[t.word]
        const omit = fullyOk || (rule?.omitSymbol && rule.defaultSymbol === t.symbol && !store.wordRoles[t.word]?.ambiguous)
        return { word: t.word, symbol: t.symbol, id: t.id, symbolOmitted: omit }
    })

    return {
        full: enriched.map(t => `${t.symbol}@${t.id}`).join(' '),
        compressed: enriched.map(t => t.symbolOmitted ? `@${t.id}` : `${t.symbol}@${t.id}`).join(' '),
        tokens: enriched,
    }
}

export function expandCompressedPattern(
    symbolic: string,
    resolvedWords: Array<{ id: number; word: string }>
): string {
    const store = loadPatterns()
    return symbolic.trim().split(/\s+/).map(raw => {
        if (/^[◯╱→✶△▬⊂≡↑#]@/.test(raw)) return raw
        const match = raw.match(/^@(\d+)$/)
        if (match) {
            const id = parseInt(match[1])
            const entry = resolvedWords.find(w => w.id === id)
            if (entry) {
                const rule = store.compressionRules[entry.word]
                if (rule) return `${rule.defaultSymbol}@${id}`
                const cluster = getCluster(entry.word)
                if (cluster) return `${cluster.symbol}@${id}`
            }
        }
        return raw
    }).join(' ')
}

export function getAllPatterns(): SequencePattern[] {
    return Object.values(loadPatterns().sequences).sort((a, b) => b.count - a.count)
}

export function clearPatternsCache(): void { _cache = null }

function buildDefaultTemplate(symSeq: string): string {
    const syms = symSeq.split(' ')
    const parts: string[] = []
    let i = 0
    for (const s of syms) {
        switch (s) {
            case '◯': parts.push(`{${i++}}`); break
            case '╱': parts.push(`does {${i++}}`); break
            case '→': parts.push(`leading to {${i++}}`); break
            case '✶': parts.push(`critically`); break
            case '△': parts.push(`via {${i++}}`); break
            case '▬': parts.push(`on {${i++}}`); break
            case '⊂': parts.push(`belonging to {${i++}}`); break
            case '≡': parts.push(`is {${i++}}`); break
            case '↑': parts.push(`urgently`); break
            case '#': parts.push(`{${i++}} times`); break
            default: parts.push(`{${i++}}`);
        }
    }
    return parts.join(' ')
}
