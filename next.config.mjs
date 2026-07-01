import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 讓 Vercel build 時不要因為 ESLint 規則設定問題卡住整個 build
    // 本機開發時你仍然可以手動跑 `npm run lint` 檢查
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default withNextIntl(nextConfig)
