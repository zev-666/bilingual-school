import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Formal navy — primary brand color (nav, buttons, links)
        primary: {
          50:  '#eef2f7',
          100: '#d6e0eb',
          200: '#adc1d6',
          300: '#7d9cbc',
          400: '#4d739e',
          500: '#305980',
          600: '#234367',
          700: '#1c3654',
          800: '#162a41',
          900: '#101f30',
        },
        // Muted gold — used sparingly for accents, highlights, and badges
        accent: {
          50:  '#fdf8ee',
          100: '#f9edcf',
          200: '#f2d896',
          300: '#e9bd5c',
          400: '#dba435',
          500: '#c28c26',
          600: '#9c6d1d',
          700: '#77521a',
          800: '#5a3f18',
          900: '#3e2b13',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
