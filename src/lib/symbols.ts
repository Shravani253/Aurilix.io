// All 10 primitive symbols from the HTML reference file
// Each maps a glyph to its semantic meaning

import type { Symbol } from '@/types'

export const SYMBOLS: Symbol[] = [
    { glyph: '◯', name: 'ENTITY', meaning: 'Entity / Object', color: 'gold' },
    { glyph: '╱', name: 'ACTION', meaning: 'Action / Process', color: 'teal' },
    { glyph: '→', name: 'CAUSE', meaning: 'Cause / Flow', color: 'violet' },
    { glyph: '✶', name: 'IMPORTANCE', meaning: 'Importance / Energy', color: 'gold' },
    { glyph: '△', name: 'SYSTEM', meaning: 'System / Mechanism', color: 'teal' },
    { glyph: '▬', name: 'RESOURCE', meaning: 'Resource / Material', color: 'rose' },
    { glyph: '⊂', name: 'CATEGORY', meaning: 'Belongs To / Category', color: 'violet' },
    { glyph: '≡', name: 'DEFINITION', meaning: 'Definition / Equals', color: 'gold' },
    { glyph: '↑', name: 'PRIORITY', meaning: 'Priority / Increase', color: 'teal' },
    { glyph: '#', name: 'QUANTITY', meaning: 'Quantity / Count', color: 'rose' },
]

export const SYMBOL_MAP = Object.fromEntries(SYMBOLS.map(s => [s.glyph, s]))

// Glyphs only — for the ticker and display
export const GLYPHS = SYMBOLS.map(s => s.glyph)

// Items for the hero ticker — tripled for seamless looping
export const TICKER_ITEMS = [...SYMBOLS, ...SYMBOLS, ...SYMBOLS]
