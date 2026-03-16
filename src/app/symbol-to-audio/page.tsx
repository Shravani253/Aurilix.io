'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SYMBOLS } from '@/lib/symbols'

interface TokenDetail {
    word: string
    pos: string
    grammarSymbol: string
    id: number
    ref: string
    isNew: boolean
}

export default function SymbolToAudio() {
    const router = useRouter()
    const [mode, setMode] = useState<'draw' | 'type'>('draw')
    const [selected, setSelected] = useState<string[]>([])
    const [textInput, setTextInput] = useState('')
    const [status, setStatus] = useState('')
    const [spoken, setSpoken] = useState('')
    const [processing, setProcessing] = useState(false)
    const [speaking, setSpeaking] = useState(false)

    /* ── Speak from symbol glyphs array ── */
    const speakSymbols = useCallback(async (syms: string[]) => {
        if (!syms.length) return
        setProcessing(true)
        setSpoken('')
        setStatus('Decoding symbols with Gemini...')
        try {
            const res = await fetch('/api/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbols: syms }),
            })
            const data = await res.json()
            if (data.error || !data.text) throw new Error(data.error ?? 'No text returned')

            setSpoken(data.text)
            setStatus(`Speaking: "${data.text}"`)
            setSpeaking(true)

            const utt = new SpeechSynthesisUtterance(data.text)
            utt.rate = 0.88
            utt.onend = () => { setSpeaking(false); setStatus('') }
            utt.onerror = () => { setSpeaking(false); setStatus('') }
            window.speechSynthesis.speak(utt)
        } catch (err: unknown) {
            setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setProcessing(false)
        }
    }, [])

    /* ── Speak from typed input ── */
    const speakText = useCallback(async () => {
        if (!textInput.trim()) return

        const glyphSet = new Set(SYMBOLS.map(s => s.glyph))
        const syms = textInput.trim().split('').filter(c => glyphSet.has(c))

        if (syms.length > 0) {
            // Input already contains symbol glyphs — decode directly
            await speakSymbols(syms)
        } else {
            // Plain text — symbolize first then decode
            setProcessing(true)
            setSpoken('')
            setStatus('Symbolizing text...')
            try {
                const sRes = await fetch('/api/symbolize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textInput.trim() }),
                })
                const data = await sRes.json()
                if (data.error) throw new Error(data.error)

                // New API returns tokens array — extract grammar glyphs
                const glyphs: string[] = Array.isArray(data.tokens)
                    ? data.tokens.map((t: TokenDetail) => t.grammarSymbol)
                    : []

                if (!glyphs.length) throw new Error('No symbols generated from text')

                // Now decode the glyphs back to speech
                await speakSymbols(glyphs)
            } catch (err: unknown) {
                setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
                setProcessing(false)
            }
        }
    }, [textInput, speakSymbols])

    const busy = processing || speaking

    return (
        <div className="relative min-h-screen" style={{ background: '#05050a' }}>

            {/* ── Header ── */}
            <header className="relative z-10 flex items-center justify-between px-8 py-5"
                style={{ borderBottom: '1px solid #161625' }}>
                <button onClick={() => router.push('/')}
                    style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.25em', color: '#2e2c38', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}>
                    ← Back
                </button>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '11px', letterSpacing: '0.2em', color: '#c9a84c' }}>
                    AURILIX.io
                </div>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.2em', color: '#2e2c38', textTransform: 'uppercase' }}>
                    Symbols → Audio
                </div>
            </header>

            <main className="relative z-10 max-w-3xl mx-auto px-6 py-16">

                {/* ── Page title ── */}
                <div className="text-center mb-12">
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.3em', color: '#2e2c38', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Mode 02
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(20px,4vw,36px)', letterSpacing: '0.1em', background: 'linear-gradient(135deg,#ede9e0 30%,#7b5ea7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        Symbols → Audio
                    </h2>
                    <div className="mx-auto mt-4"
                        style={{ width: '120px', height: '1px', background: 'linear-gradient(90deg,transparent,#7b5ea7,transparent)' }} />
                </div>

                {/* ── Mode toggle ── */}
                <div className="flex mb-10" style={{ border: '1px solid #22223a' }}>
                    {(['draw', 'type'] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)}
                            className="flex-1 py-3 transition-all duration-200"
                            style={{
                                fontFamily: 'var(--font-cinzel)', fontSize: '10px', letterSpacing: '0.2em',
                                textTransform: 'uppercase', cursor: 'pointer', border: 'none',
                                background: mode === m ? 'rgba(123,94,167,0.08)' : 'transparent',
                                color: mode === m ? '#7b5ea7' : '#2e2c38',
                                borderBottom: mode === m ? '1px solid #7b5ea7' : '1px solid transparent',
                            }}>
                            {m === 'draw' ? '◈ Pick Symbols' : '✎ Type Symbols'}
                        </button>
                    ))}
                </div>

                {/* ── Pick mode ── */}
                {mode === 'draw' && (
                    <div className="flex flex-col gap-6 mb-10">
                        <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '15px', color: '#8a8690', textAlign: 'center' }}>
                            Tap symbols to build a sequence. Order matters — it becomes the decoded sentence.
                        </p>

                        {/* Symbol palette */}
                        <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(5,1fr)', border: '1px solid #22223a' }}>
                            {SYMBOLS.map(s => (
                                <button key={s.glyph}
                                    onClick={() => setSelected(prev => [...prev, s.glyph])}
                                    className="flex flex-col items-center justify-center gap-1 py-4 transition-all duration-200"
                                    style={{ background: 'transparent', border: 'none', borderRight: '1px solid #161625', borderBottom: '1px solid #161625', cursor: 'pointer' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(123,94,167,0.08)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                                    <span style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '28px', color: '#7b5ea7' }}>{s.glyph}</span>
                                    <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '7px', letterSpacing: '0.2em', color: '#2e2c38', textTransform: 'uppercase' }}>{s.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Selected sequence */}
                        <div>
                            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.25em', color: '#2e2c38', textTransform: 'uppercase', marginBottom: '10px' }}>
                                Your Sequence
                            </p>
                            <div className="flex flex-wrap gap-2 items-center p-3"
                                style={{ background: '#0a0a12', border: '1px solid #22223a', minHeight: '56px' }}>
                                {selected.length === 0 ? (
                                    <span style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '13px', color: '#2e2c38' }}>
                                        Tap symbols above to build your sequence...
                                    </span>
                                ) : (
                                    selected.map((g, i) => (
                                        <span key={i} style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '28px', color: '#7b5ea7' }}>{g}</span>
                                    ))
                                )}
                            </div>
                            <div className="flex justify-between mt-2">
                                <button onClick={() => setSelected(prev => prev.slice(0, -1))}
                                    disabled={selected.length === 0}
                                    style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.2em', color: '#2e2c38', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                                    ← Undo
                                </button>
                                <button onClick={() => { setSelected([]); setSpoken(''); setStatus('') }}
                                    disabled={selected.length === 0}
                                    style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.2em', color: '#2e2c38', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                                    ✕ Clear
                                </button>
                            </div>
                        </div>

                        {/* Speak button */}
                        <div className="flex justify-center">
                            <button onClick={() => speakSymbols(selected)}
                                disabled={selected.length === 0 || busy}
                                className="btn-ghost"
                                style={{ borderColor: '#7b5ea7', color: '#7b5ea7' }}>
                                <span className="flex items-center gap-2">
                                    <span>◁</span> Speak This Sequence
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Type mode ── */}
                {mode === 'type' && (
                    <div className="flex flex-col gap-4 mb-10">
                        <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '15px', color: '#8a8690', textAlign: 'center' }}>
                            Type symbols directly (e.g.{' '}
                            <span style={{ color: '#7b5ea7', fontStyle: 'normal' }}>◯ → ✶</span>
                            ) or enter plain text to symbolize and decode.
                        </p>

                        {/* Quick-insert palette */}
                        <div className="flex flex-wrap gap-2">
                            {SYMBOLS.map(s => (
                                <button key={s.glyph}
                                    onClick={() => setTextInput(prev => prev + s.glyph)}
                                    title={s.meaning}
                                    className="sym-cell"
                                    style={{ background: 'transparent', border: '1px solid #22223a', cursor: 'pointer', flexShrink: 0 }}>
                                    <span>{s.glyph}</span>
                                    <span className="sym-tip">{s.meaning}</span>
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) speakText() }}
                            placeholder="◯ → ✶  or type any text..."
                            rows={3}
                            style={{
                                width: '100%', background: '#0a0a12', border: '1px solid #22223a',
                                color: '#ede9e0', fontFamily: 'var(--font-inconsolata)', fontSize: '24px',
                                padding: '16px', resize: 'none', outline: 'none', letterSpacing: '0.1em',
                            }}
                        />
                        <div className="flex justify-between items-center">
                            <span style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '9px', color: '#2e2c38', letterSpacing: '0.1em' }}>
                                Cmd+Enter to speak
                            </span>
                            <button onClick={speakText} disabled={!textInput.trim() || busy}
                                className="btn-ghost" style={{ borderColor: '#7b5ea7', color: '#7b5ea7' }}>
                                <span className="flex items-center gap-2"><span>◁</span> Speak</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Status ── */}
                {status && (
                    <p className="text-center mb-6"
                        style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '11px', letterSpacing: '0.15em', color: status.startsWith('Error') ? '#e05c5c' : '#7b5ea7' }}>
                        {processing && !status.startsWith('Error') && <span className="mr-2">⟳</span>}
                        {status}
                    </p>
                )}

                {/* ── Decoded output ── */}
                {spoken && !status && (
                    <div className="text-center p-6" style={{ background: '#0a0a12', border: '1px solid #22223a' }}>
                        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.25em', color: '#2e2c38', textTransform: 'uppercase', marginBottom: '10px' }}>
                            Decoded As
                        </p>
                        <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: 'clamp(16px,2.5vw,22px)', color: '#ede9e0', lineHeight: 1.7 }}>
                            "{spoken}"
                        </p>
                        {/* Replay button */}
                        <button
                            onClick={() => {
                                setSpeaking(true)
                                setStatus(`Speaking: "${spoken}"`)
                                const utt = new SpeechSynthesisUtterance(spoken)
                                utt.rate = 0.88
                                utt.onend = () => { setSpeaking(false); setStatus('') }
                                utt.onerror = () => { setSpeaking(false); setStatus('') }
                                window.speechSynthesis.speak(utt)
                            }}
                            disabled={speaking}
                            style={{ marginTop: '16px', fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.2em', color: '#7b5ea7', background: 'none', border: '1px solid #7b5ea7', padding: '6px 16px', cursor: 'pointer', textTransform: 'uppercase' }}>
                            ◁ Replay
                        </button>
                    </div>
                )}

            </main>
        </div>
    )
}
