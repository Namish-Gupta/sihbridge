/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                shm: {
                    bg: '#090d16',
                    panel: '#0f172a',
                    'panel-light': '#1e293b',
                    border: '#334155',
                    'border-light': '#475569',
                    measured: '#06b6d4', // cyan-500
                    'measured-glow': 'rgba(6, 182, 212, 0.4)',
                    inferred: '#8b5cf6', // purple-500
                    'inferred-glow': 'rgba(139, 92, 246, 0.4)',
                    healthy: '#10b981', // emerald-500
                    warning: '#f59e0b', // amber-500
                    critical: '#ef4444', // red-500
                    baseline: '#64748b', // slate-500
                }
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
                sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.3)',
                'glow-purple': '0 0 15px rgba(139, 92, 246, 0.3)',
                'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
                'glow-amber': '0 0 15px rgba(245, 158, 11, 0.4)',
                'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)' },
                    '50%': { opacity: 0.5, boxShadow: '0 0 5px rgba(239, 68, 68, 0.2)' },
                },
                subtlePulse: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                }
            }
        },
    },
    plugins: [],
}
