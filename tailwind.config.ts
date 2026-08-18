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
        // ── 首頁整合門戶專用「磚紅暖灰色系」（Terracotta Red）──────────────
        // 只有首頁門戶會用到這組，其他頁面仍沿用上面的 primary / accent，
        // 所以改這裡不會動到既有的師資／相簿／文件／後台頁面。
        // 對比度已實測：primary 對白底 6.6:1、text 對底色 11.7:1、
        // textMuted 對底色 4.7:1，全部通過 WCAG 2.1 AA。
        earthBg: '#FAF6F3',        // 主要淺底色（暖米）
        earthSurface: '#FFFFFF',   // 卡片表面色
        earthMuted: '#EDE3DE',     // 次要淺底色（暖灰）
        earthPrimary: '#A03E33',   // 主強調色（磚紅）
        earthPrimaryHover: '#7F2E25',
        earthAccent: '#4A7C8C',    // 點綴藍灰
        earthText: '#3B3230',      // 內文（暖炭）
        earthTextMuted: '#7A6B67',
        earthBorder: '#E3D6D0',
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-noto)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
