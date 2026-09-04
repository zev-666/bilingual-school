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
        // 對比度已用 axe-core 實測：primary 對白底 6.6:1、text 對底色 11.7:1、
        // textMuted 對最深底色 4.8:1，全部通過 WCAG 2.2 AA（政府網站要求等級）。
        earthBg: '#FAF6F3',        // 主要淺底色（暖米）
        earthSurface: '#FFFFFF',   // 卡片表面色
        earthMuted: '#EDE3DE',     // 次要淺底色（暖灰）
        earthPrimary: '#A03E33',   // 主強調色（磚紅）
        earthPrimaryHover: '#7F2E25',
        earthAccent: '#4A7C8C',    // 點綴藍灰
        earthText: '#3B3230',      // 內文（暖炭）
        earthTextMuted: '#6E5F5B',   // 次要文字（在最深的 earthMuted 底色上仍有 4.8:1）
        earthBorder: '#E3D6D0',

        // ── 溫暖親切・淺色系（design-preview.html 全新設計系統）──────────────
        // 來源：design-preview.html 的 :root CSS 變數，數值原封不動搬入，
        // 讓正式網站與預覽稿視覺完全一致。其餘細節色票（#FFF1E0、#FFE8D6 等）
        // 以 arbitrary value 寫在各元件的 className 中，不在這裡重複定義。
        cream: '#FFFBF3',        // 主要淺底色（奶油白）
        creamSoft: '#FFF6E9',    // 次要淺底色（淺杏）
        paper: '#FFFFFF',        // 卡片表面色
        sand: '#F5EBDD',         // 暖沙
        coOrange: '#F2994A',       // 主強調色（杏橙）—— 為避免覆蓋 Tailwind 內建 orange 色票而改名
        orangeDark: '#D9782B',   // 杏橙深一階
        orangeDeep: '#B85C1F',   // 杏橙深（文字強調用，對比達標）
        mint: '#7FC8A9',         // 點綴薄荷綠
        mintDark: '#4E9E7D',     // 薄荷綠深（文字/按鈕）
        coYellow: '#FFD97D',       // 奶油黃—— 為避免覆蓋 Tailwind 內建 yellow 色票而改名
        coSky: '#8FC1E3',          // 點綴淺藍—— 為避免覆蓋 Tailwind 內建 sky 色票而改名
        coral: '#F08A7A',        // 點綴珊瑚
        ink: '#4A3B30',          // 內文（暖炭棕）
        inkSoft: '#8A7A6D',      // 次要文字
        inkFaint: '#B5A695',     // 輔助文字
        line: '#EBDFCE',         // 分隔線／卡片邊框
      },
      boxShadow: {
        card: '0 10px 26px rgba(178, 122, 66, 0.10)',
        soft: '0 18px 40px rgba(178, 122, 66, 0.14)',
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
