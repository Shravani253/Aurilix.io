'use client'

import { useRouter } from 'next/navigation'
import { SYMBOLS, TICKER_ITEMS } from '@/lib/symbols'

/* ── Fixed orb background — sits behind everything ── */
function OrbBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute rounded-full" style={{
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(123,94,167,0.4), transparent 70%)',
        filter: 'blur(90px)', top: '-15%', left: '-10%',
      }} />
      <div className="absolute rounded-full" style={{
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.22), transparent 70%)',
        filter: 'blur(90px)', bottom: '0%', right: '-8%',
      }} />
      <div className="absolute rounded-full" style={{
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(61,184,168,0.15), transparent 70%)',
        filter: 'blur(80px)', top: '38%', left: '32%',
      }} />
      <div className="absolute rounded-full" style={{
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(194,95,110,0.12), transparent 70%)',
        filter: 'blur(70px)', top: '10%', right: '15%',
      }} />
    </div>
  )
}



function Ticker() {
  return (
    <div className="ticker-wrap absolute bottom-0 left-0 right-0">
      <div className="ticker-track">
        {TICKER_ITEMS.map((s, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-sym">{s.glyph}</span>{s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()

  return (
    <div className="relative" style={{ background: '#05050a' }}>
      <OrbBackground />


      {/* ══════════════════════════════════════ */}
      {/* HERO                                   */}
      {/* ══════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center overflow-hidden text-center" style={{ padding: '40px 20px' }}>

        {/* Ambient lines */}
        <div className="ambline" style={{ top: '20%' }} />
        <div className="ambline" style={{ top: '45%' }} />
        <div className="ambline" style={{ top: '75%' }} />

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5" style={{
          fontFamily: 'var(--font-inconsolata)', fontSize: '10px',
          letterSpacing: '0.3em', color: '#c9a84c',
          textTransform: 'uppercase',
          border: '1px solid rgba(201,168,76,0.18)',
          padding: '4px 16px',
        }}>
          <span style={{ width: '36px', height: '1px', background: '#c9a84c', opacity: 0.4, flexShrink: 0 }} />
          Real-Time Symbolic Notation
          <span style={{ width: '36px', height: '1px', background: '#c9a84c', opacity: 0.4, flexShrink: 0 }} />
        </div>

        {/* Title */}
        <h1 className="leading-none" style={{
          fontFamily: 'var(--font-cinzel)',
          fontSize: 'clamp(36px,8vw,96px)',
          letterSpacing: '0.08em',
          lineHeight: 1.05,
          background: 'linear-gradient(135deg,#ede9e0 30%,#c9a84c 60%,#7b5ea7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          AURILIX.IO
        </h1>

        {/* Divider */}
        <div className="my-7" style={{ width: '50%', height: '1px', background: 'linear-gradient(90deg,transparent,#c9a84c,rgba(123,94,167,0.5),transparent)' }} />

        {/* Subtitle */}
        <p className="max-w-lg" style={{
          fontFamily: 'var(--font-garamond)', fontStyle: 'italic',
          fontSize: 'clamp(15px,2.5vw,20px)', color: '#8a8690', lineHeight: 1.7,
        }}>
          Speak to generate. Watch your thoughts{' '}
          <span style={{ color: '#c9a84c', fontStyle: 'normal', fontWeight: 500 }}>crystallise</span>{' '}
          into timeless{' '}
          <span style={{ color: '#c9a84c', fontStyle: 'normal', fontWeight: 500 }}>symbolic notation</span>{' '}
          — live, as you speak.
        </p>

        {/* Symbol row */}
        <div className="flex gap-5 mt-9">
          {SYMBOLS.map(s => (
            <span key={s.glyph} title={s.meaning}
              className="cursor-default transition-all duration-300 hover:scale-125"
              style={{ fontSize: '28px', color: '#c9a84c', opacity: 0.4, fontFamily: 'var(--font-inconsolata)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.4' }}
            >{s.glyph}</span>
          ))}
        </div>

        <Ticker />
      </section>

      {/* ══════════════════════════════════════ */}
      {/* MODE CARDS                             */}
      {/* ══════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">

        <p className="section-label" style={{ paddingTop: 0 }}>Choose Your Mode</p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-stretch max-w-3xl mx-auto">

          {/* ── Card 1 — Audio → Symbols ── */}
          <button
            onClick={() => router.push('/audio-to-symbol')}
            className="group flex-1 text-left cursor-pointer"
            style={{
              /* square-ish: use aspect-ratio so it's always as tall as it is wide */
              aspectRatio: '1 / 1',
              /* glassmorphism */
              background: 'rgba(201,168,76,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(201,168,76,0.2)',
              padding: '36px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'rgba(201,168,76,0.6)'
              el.style.boxShadow = '0 0 60px rgba(201,168,76,0.12), inset 0 0 60px rgba(201,168,76,0.03)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'rgba(201,168,76,0.2)'
              el.style.boxShadow = 'none'
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(90deg,transparent,#c9a84c,transparent)' }} />

            {/* Number */}
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.4)', marginBottom: '20px' }}>01</div>

            {/* Giant glyph */}
            <div style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '72px', color: '#c9a84c', opacity: 0.15, lineHeight: 1, marginBottom: 'auto' }}>◉</div>

            {/* Content */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '16px', letterSpacing: '0.1em', color: '#ede9e0', marginBottom: '10px' }}>
                Audio → Symbols
              </h3>
              <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '13px', color: '#8a8690', lineHeight: 1.6, marginBottom: '24px' }}>
                Record live audio or type text. Gemini transcribes and encodes into the 10 symbolic primitives instantly.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Microphone', 'Text Input', 'Gemini'].map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '8px', letterSpacing: '0.15em', color: 'rgba(201,168,76,0.5)', border: '1px solid rgba(201,168,76,0.15)', padding: '2px 8px', textTransform: 'uppercase' }}>{t}</span>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-3">
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)' }} />
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '10px', letterSpacing: '0.2em', color: '#c9a84c', textTransform: 'uppercase' }}>Open →</span>
              </div>
            </div>
          </button>

          {/* ── Card 2 — Symbols → Audio ── */}
          <button
            onClick={() => router.push('/symbol-to-audio')}
            className="group flex-1 text-left cursor-pointer"
            style={{
              aspectRatio: '1 / 1',
              background: 'rgba(123,94,167,0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(123,94,167,0.2)',
              padding: '36px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'rgba(123,94,167,0.6)'
              el.style.boxShadow = '0 0 60px rgba(123,94,167,0.12), inset 0 0 60px rgba(123,94,167,0.03)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'rgba(123,94,167,0.2)'
              el.style.boxShadow = 'none'
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(90deg,transparent,#7b5ea7,transparent)' }} />

            {/* Number */}
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.25em', color: 'rgba(123,94,167,0.4)', marginBottom: '20px' }}>02</div>

            {/* Giant glyph */}
            <div style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '72px', color: '#7b5ea7', opacity: 0.15, lineHeight: 1, marginBottom: 'auto' }}>◁</div>

            {/* Content */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '16px', letterSpacing: '0.1em', color: '#ede9e0', marginBottom: '10px' }}>
                Symbols → Audio
              </h3>
              <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '13px', color: '#8a8690', lineHeight: 1.6, marginBottom: '24px' }}>
                Pick or type symbols directly. Gemini decodes the sequence into natural language and speaks it aloud.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Symbol Picker', 'Text Input', 'Web Speech'].map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '8px', letterSpacing: '0.15em', color: 'rgba(123,94,167,0.5)', border: '1px solid rgba(123,94,167,0.15)', padding: '2px 8px', textTransform: 'uppercase' }}>{t}</span>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-3">
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(123,94,167,0.3),transparent)' }} />
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '10px', letterSpacing: '0.2em', color: '#7b5ea7', textTransform: 'uppercase' }}>Open →</span>
              </div>
            </div>
          </button>

        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FOOTER                                 */}
      {/* ══════════════════════════════════════ */}
      <footer className="relative z-10" style={{ borderTop: '1px solid #161625' }}>
        {/* Top divider glow */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.15),transparent)', marginTop: '-1px' }} />

        <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col items-center gap-8">

          {/* Logo */}
          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '18px', letterSpacing: '0.15em', background: 'linear-gradient(135deg,#ede9e0 30%,#c9a84c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            AURILIX.IO
          </div>

          {/* Tagline */}
          <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '14px', color: '#2e2c38', textAlign: 'center', lineHeight: 1.7 }}>
            Speech becomes symbol. Symbol becomes meaning. Meaning becomes memory.
          </p>

          {/* Symbol strip */}
          <div className="flex gap-4">
            {SYMBOLS.map(s => (
              <span key={s.glyph} title={s.meaning} style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '14px', color: '#c9a84c', opacity: 0.2 }}>{s.glyph}</span>
            ))}
          </div>

          {/* Bottom row */}
          <div className="flex items-center gap-8 flex-wrap justify-center" style={{ borderTop: '1px solid #161625', paddingTop: '24px', width: '100%' }}>
            <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '8px', letterSpacing: '0.25em', color: '#2e2c38', textTransform: 'uppercase' }}>
              © 2025 AURILIX.IO
            </span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,#161625,transparent)' }} />
            <span style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '9px', letterSpacing: '0.15em', color: '#2e2c38' }}>
              Powered by Gemini · Next.js · Web Speech API
            </span>
          </div>

        </div>
      </footer>

    </div>
  )
}
