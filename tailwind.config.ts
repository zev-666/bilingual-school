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
        primary: {
          50:  '#E6F1FB',
          100: '#B5D4F4',
          200: '#85B7EB',
          300: '#5B9EE0',
          400: '#378ADD',
          500: '#2B6FC7',
          600: '#185FA5',
          700: '#0C447C',
          800: '#0A3866',
          900: '#042C53',
        },
        accent: {
          50:  '#F6F8E3',
          100: '#E9EEBB',
          200: '#DCE491',
          300: '#C7D25F',
          400: '#B7C23E',
          500: '#9BA72E',
          600: '#7C8622',
          700: '#606A19',
          800: '#464E12',
          900: '#2E340B',
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
