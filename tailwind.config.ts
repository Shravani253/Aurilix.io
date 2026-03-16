import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                void: '#05050a',
                deep: '#0a0a12',
                surface: '#0f0f1a',
                raised: '#161625',
                border: '#22223a',
                ink: '#ede9e0',
                'ink-dim': '#8a8690',
                'ink-ghost': '#2e2c38',
                gold: '#c9a84c',
                violet: '#7b5ea7',
                teal: '#3db8a8',
                rose: '#c25f6e',
            },
            fontFamily: {
                cinzel: ['var(--font-cinzel)', 'serif'],
                inconsolata: ['var(--font-inconsolata)', 'monospace'],
                garamond: ['var(--font-garamond)', 'serif'],
            },
            keyframes: {
                ticker: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                recordPulse: {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(194,95,110,0)' },
                    '50%': { boxShadow: '0 0 20px 4px rgba(194,95,110,0.3)' },
                },
            },
            animation: {
                ticker: 'ticker 28s linear infinite',
                recordPulse: 'recordPulse 1.5s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}

export default config
