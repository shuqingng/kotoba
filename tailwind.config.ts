import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper:      '#f5f0e8',
        ink:        '#1e1b18',
        navy:       '#1a1f3a',
        vermilion:  '#c9414a',
        'vermilion-light': '#f5c5c8',
        gold:       '#c9a84c',
        'gold-light': '#f0e4b8',
        muted:      '#8a8178',
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'sans-serif'],
        jp:    ['var(--font-noto-jp)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(30,27,24,0.08)',
        'card-hover': '0 6px 24px 0 rgba(30,27,24,0.14)',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'flip-out': {
          '0%':   { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(90deg)' },
        },
        'flip-in': {
          '0%':   { transform: 'rotateY(-90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'flip-out': 'flip-out 0.2s ease-in forwards',
        'flip-in':  'flip-in 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}

export default config
