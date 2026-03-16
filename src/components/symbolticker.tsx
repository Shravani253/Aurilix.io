import { SYMBOLS } from '@/lib/symbols'

const ITEMS = [...SYMBOLS, ...SYMBOLS] // duplicate for seamless loop

export default function SymbolTicker() {
    return (
        <div
            className="absolute bottom-0 left-0 right-0 overflow-hidden"
            style={{ borderTop: '1px solid #161625' }}
        >
            <div className="ticker-track py-2">
                {ITEMS.map((s, i) => (
                    <span
                        key={i}
                        className="text-[11px] tracking-[0.2em]"
                        style={{ color: '#2e2c38', fontFamily: 'var(--font-inconsolata)' }}
                    >
                        <span style={{ color: '#c9a84c', marginRight: '8px' }}>{s.glyph}</span>
                        {s.name}
                    </span>
                ))}
            </div>
        </div>
    )
}
