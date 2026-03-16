'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Chunk } from '@/types'
import { SYMBOL_MAP, SYMBOLS } from '@/lib/symbols'

const uid = () => Math.random().toString(36).slice(2, 9)

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((res, rej) => {
        const r = new FileReader()
        r.onload = () => res((r.result as string).split(',')[1])
        r.onerror = rej
        r.readAsDataURL(blob)
    })
}

interface TokenDetail {
    word: string
    pos: string
    grammarSymbol: string
    id: number
    ref: string
    isNew: boolean
}

function SymbolCell({ glyph }: { glyph: string }) {
    const def = SYMBOL_MAP[glyph]
    return (
        <div className="sym-cell">
            <span>{glyph}</span>
            {def && <span className="sym-tip">{def.meaning}</span>}
        </div>
    )
}

export default function AudioToSymbol() {
    const router = useRouter()
    const [mode, setMode] = useState<'record' | 'text'>('record')
    const [recording, setRecording] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [status, setStatus] = useState('')
    const [textInput, setTextInput] = useState('')
    const [chunks, setChunks] = useState<Chunk[]>([])

    const mrRef = useRef<MediaRecorder | null>(null)
    const parts = useRef<BlobPart[]>([])

    /* ── Symbolize ── */
    const symbolize = useCallback(async (text: string) => {
        setStatus('Converting to symbols...')

        const res = await fetch('/api/symbolize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        })

        const data = await res.json()

        // Show API-level errors clearly
        if (data.error) throw new Error(data.error)

        // Extract grammar glyphs from tokens array
        const symbols: string[] = Array.isArray(data.tokens)
            ? data.tokens.map((t: TokenDetail) => t.grammarSymbol)
            : []

        // Show expanded text if abbreviations were found
        const displayText = data.expandedText && data.expandedText !== text
            ? `${text} → ${data.expandedText}`
            : text

        setChunks(prev => [...prev, {
            id: uid(),
            text: displayText,
            symbols,
            tokens: data.tokens ?? [],
            symbolic: data.symbolic ?? '',
            newWords: data.newWords ?? [],
            timestamp: Date.now(),
        }])

        setStatus(
            data.newWords?.length
                ? `Learned ${data.newWords.length} new word${data.newWords.length > 1 ? 's' : ''}: ${data.newWords.join(', ')}`
                : ''
        )
    }, [])

    /* ── Record ── */
    const startRecord = useCallback(async () => {
        try {
            setStatus('Requesting microphone...')
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })

            parts.current = []
            mr.ondataavailable = e => { if (e.data.size > 0) parts.current.push(e.data) }

            mr.onstop = async () => {
                setProcessing(true)
                try {
                    const b64 = await blobToBase64(new Blob(parts.current, { type: 'audio/webm' }))
                    setStatus('Transcribing with Gemini...')
                    const tRes = await fetch('/api/transcribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audioBase64: b64, mimeType: 'audio/webm' }),
                    })
                    const { text, error } = await tRes.json()
                    if (error || !text) throw new Error(error ?? 'Empty transcription')
                    await symbolize(text)
                } catch (err: unknown) {
                    setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
                } finally {
                    setProcessing(false)
                    stream.getTracks().forEach(t => t.stop())
                }
            }

            mrRef.current = mr
            mr.start()
            setRecording(true)
            setStatus('Recording — tap Stop when done')
        } catch {
            setStatus('Microphone access denied')
        }
    }, [symbolize])

    const stopRecord = useCallback(() => {
        mrRef.current?.stop()
        setRecording(false)
    }, [])

    /* ── Text submit ── */
    const submitText = useCallback(async () => {
        if (!textInput.trim()) return
        setProcessing(true)
        setStatus('')
        try {
            await symbolize(textInput.trim())
            setTextInput('')   // clear input after success
        } catch (err: unknown) {
            setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setProcessing(false)
        }
    }, [textInput, symbolize])

    const busy = recording || processing

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
                    Audio → Symbols
                </div>
            </header>

            <main className="relative z-10 max-w-3xl mx-auto px-6 py-16">

                {/* ── Page title ── */}
                <div className="text-center mb-12">
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.3em', color: '#2e2c38', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Mode 01
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(20px,4vw,36px)', letterSpacing: '0.1em', background: 'linear-gradient(135deg,#ede9e0 30%,#c9a84c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        Audio → Symbols
                    </h2>
                    <div className="mx-auto mt-4 mb-0"
                        style={{ width: '120px', height: '1px', background: 'linear-gradient(90deg,transparent,#c9a84c,transparent)' }} />
                </div>

                {/* ── Mode toggle ── */}
                <div className="flex mb-10" style={{ border: '1px solid #22223a' }}>
                    {(['record', 'text'] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)}
                            className="flex-1 py-3 transition-all duration-200"
                            style={{
                                fontFamily: 'var(--font-cinzel)', fontSize: '10px', letterSpacing: '0.2em',
                                textTransform: 'uppercase', cursor: 'pointer', border: 'none',
                                background: mode === m ? 'rgba(201,168,76,0.08)' : 'transparent',
                                color: mode === m ? '#c9a84c' : '#2e2c38',
                                borderBottom: mode === m ? '1px solid #c9a84c' : '1px solid transparent',
                            }}>
                            {m === 'record' ? '◉ Record Audio' : '✎ Type Text'}
                        </button>
                    ))}
                </div>

                {/* ── Record mode ── */}
                {mode === 'record' && (
                    <div className="flex flex-col items-center gap-6 mb-10">
                        <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '15px', color: '#8a8690', textAlign: 'center' }}>
                            Tap record, speak your thoughts, tap stop. Gemini transcribes and encodes in real time.
                        </p>
                        <div className="flex gap-4">
                            {!recording ? (
                                <button onClick={startRecord} disabled={busy} className="btn-record">
                                    <span className="flex items-center gap-2"><span>◉</span> Record Live Audio</span>
                                </button>
                            ) : (
                                <button onClick={stopRecord} className="btn-record is-recording">
                                    <span className="flex items-center gap-2"><span>◼</span> Stop Recording</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Text mode ── */}
                {mode === 'text' && (
                    <div className="flex flex-col gap-4 mb-10">
                        <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '15px', color: '#8a8690', textAlign: 'center' }}>
                            Type any text and Gemini will encode its meaning into symbolic notation.
                        </p>
                        <textarea
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitText() }}
                            placeholder="Type your thoughts here..."
                            rows={4}
                            style={{
                                width: '100%', background: '#0a0a12', border: '1px solid #22223a',
                                color: '#ede9e0', fontFamily: 'var(--font-garamond)', fontSize: '15px',
                                padding: '16px', resize: 'none', outline: 'none', lineHeight: 1.7,
                            }}
                        />
                        <div className="flex justify-between items-center">
                            <span style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '9px', color: '#2e2c38', letterSpacing: '0.1em' }}>
                                Cmd+Enter to submit
                            </span>
                            <button onClick={submitText} disabled={!textInput.trim() || busy} className="btn-gold">
                                <span>Generate Symbols →</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Status ── */}
                {status && (
                    <p className="text-center mb-8"
                        style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '11px', letterSpacing: '0.15em', color: status.startsWith('Error') ? '#e05c5c' : '#c9a84c' }}>
                        {processing && !status.startsWith('Error') && <span className="mr-2">⟳</span>}
                        {status}
                    </p>
                )}

                {/* ── Results ── */}
                {chunks.length > 0 && (
                    <div style={{ border: '1px solid #22223a' }}>
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #22223a' }}>
                            {['Transcript', 'Symbols'].map(h => (
                                <div key={h} className="px-4 py-3"
                                    style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.25em', color: '#2e2c38', textTransform: 'uppercase', background: '#0a0a12', borderRight: '1px solid #161625' }}>
                                    {h}
                                </div>
                            ))}
                        </div>

                        {chunks.map(chunk => (
                            <div key={chunk.id} className="grid"
                                style={{ gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #161625' }}>

                                {/* Left: transcript */}
                                <div className="split-left p-4">
                                    <p className="transcript-line live">{chunk.text}</p>
                                    <span style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '9px', color: '#2e2c38' }}>
                                        {new Date(chunk.timestamp).toLocaleTimeString()}
                                    </span>
                                    {chunk.symbolic && (
                                        <p style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '10px', color: '#c9a84c', letterSpacing: '0.1em', marginTop: '6px', opacity: 0.6 }}>
                                            {chunk.symbolic}
                                        </p>
                                    )}
                                    {chunk.newWords && chunk.newWords.length > 0 && (
                                        <p style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '9px', color: '#8a8690', marginTop: '4px' }}>
                                            +learned: {chunk.newWords.join(', ')}
                                        </p>
                                    )}
                                </div>

                                {/* Right: symbol glyphs */}
                                <div className="split-right p-4 flex flex-wrap gap-2 items-center">
                                    {chunk.symbols.length > 0
                                        ? chunk.symbols.map((g, i) => <SymbolCell key={i} glyph={g} />)
                                        : <span style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '12px', color: '#2e2c38' }}>No symbols generated</span>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Clear ── */}
                {chunks.length > 0 && (
                    <div className="flex justify-end mt-3">
                        <button onClick={() => { setChunks([]); setStatus('') }}
                            style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.2em', color: '#2e2c38', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                            ✕ Clear
                        </button>
                    </div>
                )}

                {/* ── Empty state ── */}
                {chunks.length === 0 && !busy && (
                    <div className="mt-10">
                        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.3em', color: '#2e2c38', textTransform: 'uppercase', textAlign: 'center', marginBottom: '16px' }}>
                            Symbol Vocabulary
                        </p>
                        <div className="flex flex-wrap gap-px justify-center" style={{ border: '1px solid #161625' }}>
                            {SYMBOLS.map(s => (
                                <div key={s.glyph} className="flex items-center gap-2 px-3 py-2"
                                    style={{ background: '#0a0a12', borderRight: '1px solid #161625', borderBottom: '1px solid #161625' }}>
                                    <span style={{ color: '#c9a84c', fontFamily: 'var(--font-inconsolata)', fontSize: '20px' }}>{s.glyph}</span>
                                    <div className="flex flex-col">
                                        <span style={{ color: '#2e2c38', fontFamily: 'var(--font-cinzel)', fontSize: '8px', letterSpacing: '0.2em' }}>{s.name}</span>
                                        <span style={{ color: '#8a8690', fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '11px' }}>{s.meaning}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}
