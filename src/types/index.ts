// types/index.ts

// ── Symbol primitives ─────────────────────────────────────────────────────────
export interface Symbol {
    glyph: string
    name: string
    meaning: string
    color: 'gold' | 'violet' | 'teal' | 'rose'
}

// ── Token detail from /api/symbolize ─────────────────────────────────────────
export interface TokenDetail {
    word: string
    pos: string
    grammarSymbol: string
    id: number
    ref: string    // e.g. "@1"
    isNew: boolean
}

// ── Resolved token from /api/speak ───────────────────────────────────────────
export interface ResolvedToken {
    raw: string        // original token e.g. "◯@3"
    grammarSymbol: string
    id: number | null
    word: string | null
    pos: string | null
}

// ── A single chunk: one sentence → its symbols ───────────────────────────────
export interface Chunk {
    id: string
    text: string
    symbols: string[]       // grammar glyphs for display e.g. ["◯","╱","↑"]
    tokens?: TokenDetail[]  // full token data from /api/symbolize
    symbolic?: string         // e.g. "◯@1 ╱@2 ↑@3"
    newWords?: string[]       // words learned this session
    timestamp: number
}

// ── Full session ──────────────────────────────────────────────────────────────
export interface Session {
    id: string
    domain: string
    chunks: Chunk[]
    startedAt: number
    endedAt?: number
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface TranscribeResponse {
    text: string
    error?: string
}

export interface SymbolizeResponse {
    symbolic: string         // e.g. "◯@1 ╱@2 ↑@3"
    tokens: TokenDetail[]  // per-word detail
    explanation: string         // brief reason for symbol choices
    newWords: string[]       // words learned this call
    error?: string
}

export interface SpeakResponse {
    text: string          // reconstructed English sentence
    symbolic: string          // echo of the input symbolic string
    resolved: ResolvedToken[] // per-token vocabulary lookups
    // legacy fields kept for backward compat
    audioBase64: null
    mimeType: string
    error?: string
}

// ── Recording state ───────────────────────────────────────────────────────────
export type RecordingState = 'idle' | 'recording' | 'processing' | 'speaking'
