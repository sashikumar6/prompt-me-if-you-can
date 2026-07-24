/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'Monaco', '"Courier New"', 'monospace'],
      },
      colors: {
        term: {
          bg: '#0a0a0a',
          surface: '#111111',
          green: '#4ade80',
          'green-bright': '#00ff41',
          'green-dim': '#166534',
          amber: '#fbbf24',
          red: '#f87171',
          border: '#1a2e1a',
          'border-hi': '#374151',
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        flash: 'flash 0.6s ease-out forwards',
        'flash-red': 'flashRed 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.25s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        flash: {
          '0%': { backgroundColor: 'rgba(251,191,36,0.25)', borderColor: 'rgba(251,191,36,0.6)' },
          '100%': { backgroundColor: 'transparent', borderColor: '' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(248,113,113,0.25)', borderColor: 'rgba(248,113,113,0.6)' },
          '100%': { backgroundColor: 'transparent', borderColor: '' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
