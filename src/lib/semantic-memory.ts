/**
 * lib/semantic-memory.ts
 *
 * Links the semantic graph to LLM latent memory.
 *
 * Stores in data/semantic-memory.json:
 *  - probes:      cached LLM probability queries (word → top candidates)
 *  - edgeWeights: learned probability for each word-pair edge
 *  - wordVectors: simplified symbolic embeddings per word
 *
 * The Viterbi path function picks the max-probability word sequence
 * through the graph — like HMM decoding over LLM latent knowledge.
 */

import fs from 'fs'
import path from 'path'

export interface Candidate {
    word: string
    probability: number
    symbol: string
}

export interface SemanticProbe {
    query: string
    candidates: Candidate[]
    timestamp: number
    source: 'cache' | 'llm'
}

export interface EdgeWeight {
    fromWord: string
    toWord: string
    edgeType: string
    probability: number
    observations: number
}

export interface SemanticMemoryStore {
    probes: Record<string, SemanticProbe>
    edgeWeights: Record<string, EdgeWeight>
    wordVectors: Record<string, number[]>
}

const DATA_DIR = path.join(process.cwd(), 'data')
const MEMORY_PATH = path.join(DATA_DIR, 'semantic-memory.json')

let _cache: SemanticMemoryStore | null = null

function defaultStore(): SemanticMemoryStore {
    return { probes: {}, edgeWeights: {}, wordVectors: {} }
}

export function loadSemanticMemory(): SemanticMemoryStore {
    if (_cache) return _cache
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
        if (!fs.existsSync(MEMORY_PATH)) {
            const s = defaultStore()
            fs.writeFileSync(MEMORY_PATH, JSON.stringify(s, null, 2))
            _cache = s; return _cache
        }
        _cache = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf-8'))
        if (!_cache!.probes) _cache!.probes = {}
        if (!_cache!.edgeWeights) _cache!.edgeWeights = {}
        if (!_cache!.wordVectors) _cache!.wordVectors = {}
        return _cache!
    } catch {
        _cache = defaultStore(); return _cache
    }
}

export function saveSemanticMemory(store: SemanticMemoryStore): void {
    try {
        fs.writeFileSync(MEMORY_PATH, JSON.stringify(store, null, 2))
        _cache = store
    } catch (err) {
        console.error('[semantic-memory] Save failed:', err)
    }
}

export function getEdgeWeight(word1: string, word2: string): EdgeWeight | null {
    const store = loadSemanticMemory()
    return store.edgeWeights[`${word1}+${word2}`]
        ?? store.edgeWeights[`${word2}+${word1}`]
        ?? null
}

export function recordEdgeWeight(
    fromWord: string, toWord: string,
    edgeType: string, probability: number
): void {
    const store = loadSemanticMemory()
    const key = `${fromWord}+${toWord}`
    if (!store.edgeWeights[key]) {
        store.edgeWeights[key] = { fromWord, toWord, edgeType, probability, observations: 0 }
    }
    const w = store.edgeWeights[key]
    w.probability = (w.probability * w.observations + probability) / (w.observations + 1)
    w.observations++
    saveSemanticMemory(store)
}

export function getCachedProbe(query: string): SemanticProbe | null {
    return loadSemanticMemory().probes[query] ?? null
}

export function cacheProbe(query: string, candidates: Candidate[]): void {
    const store = loadSemanticMemory()
    store.probes[query] = { query, candidates, timestamp: Date.now(), source: 'llm' }
    saveSemanticMemory(store)
}

export interface WeightedNode {
    word: string
    symbol: string
    id: number | null
    probability: number
    alternatives: Candidate[]
}

/**
 * Viterbi path — pick max-probability word sequence using edge weights.
 * Analogous to HMM Viterbi decoding over LLM latent semantic space.
 */
export function viterbiPath(
    nodes: Array<{ word: string; symbol: string; id: number | null }>
): WeightedNode[] {
    const store = loadSemanticMemory()
    return nodes.map((node, i) => {
        let prob = 0.70  // prior

        if (i > 0) {
            const prev = nodes[i - 1]
            const weight = getEdgeWeight(prev.word, node.word)
            if (weight) {
                prob = Math.min(0.99, (prob + weight.probability * weight.observations) / (1 + weight.observations))
            }
        }

        const probeKey = `${node.symbol}:${node.word}`
        const probe = store.probes[probeKey]

        return {
            word: node.word,
            symbol: node.symbol,
            id: node.id,
            probability: prob,
            alternatives: probe?.candidates ?? [],
        }
    })
}

export function encodeWordVector(word: string, pos: string, symbol: string, usageCount = 0): number[] {
    const posMap: Record<string, number[]> = {
        noun: [1, 0, 0], verb: [0, 1, 0], adjective: [0, 0, 1], adverb: [0, 0, 1], other: [0, 0, 0],
    }
    const symCausal = ['→', '⊂', '≡'].includes(symbol) ? 1 : 0
    const symResource = symbol === '▬' ? 1 : 0
    const symSystem = symbol === '△' ? 1 : 0
    const freq = Math.min(1, usageCount / 100)
    return [...(posMap[pos] ?? [0, 0, 0]), symCausal, symResource, symSystem, freq]
}

export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    const dot = a.reduce((s, ai, i) => s + ai * b[i], 0)
    const magA = Math.sqrt(a.reduce((s, x) => s + x * x, 0))
    const magB = Math.sqrt(b.reduce((s, x) => s + x * x, 0))
    return magA && magB ? dot / (magA * magB) : 0
}

export function clearMemoryCache(): void { _cache = null }