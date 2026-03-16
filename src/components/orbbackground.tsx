// Pure CSS orbs — no JS animations, matches HTML reference exactly

export default function OrbBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Violet orb — top left */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(123,94,167,0.35), transparent 70%)',
                    filter: 'blur(80px)',
                    top: '-10%',
                    left: '-5%',
                    animation: 'orbFloat1 16s ease-in-out infinite',
                }}
            />
            {/* Gold orb — bottom right */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(201,168,76,0.18), transparent 70%)',
                    filter: 'blur(80px)',
                    bottom: '5%',
                    right: '-5%',
                    animation: 'orbFloat2 14s ease-in-out infinite',
                }}
            />
            {/* Teal orb — center */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(61,184,168,0.12), transparent 70%)',
                    filter: 'blur(80px)',
                    top: '40%',
                    left: '35%',
                    animation: 'orbFloat3 18s ease-in-out infinite',
                }}
            />
        </div>
    )
}
