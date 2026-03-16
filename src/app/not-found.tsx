'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()
    return (
        <div style={{ minHeight: '100vh', background: '#05050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <span style={{ fontFamily: 'var(--font-inconsolata)', fontSize: '48px', color: '#c9a84c', opacity: 0.3 }}>◯</span>
            <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.3em', color: '#2e2c38', textTransform: 'uppercase' }}>
                Page not found
            </p>
            <button onClick={() => router.push('/')} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '9px', letterSpacing: '0.25em', color: '#c9a84c', background: 'none', border: '1px solid rgba(201,168,76,0.3)', padding: '8px 24px', cursor: 'pointer', textTransform: 'uppercase' }}>
                ← Back to AURILIX.IO
            </button>
        </div>
    )
}