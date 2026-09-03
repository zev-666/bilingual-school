import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 讓 Vercel build 時不要因為 ESLint 規則設定問題卡住整個 build
    // 本機開發時你仍然可以手動跑 `npm run lint` 檢查
    ignoreDuringBuilds: true,
  },

  // 移除 X-Powered-By: Next.js 標頭（不要主動洩漏框架版本，政府資安檢測常見扣分項）
  poweredByHeader: false,

  images: {
    // ⚠️ 2026-08 資安修正：原本是 { protocol: 'https', hostname: '**' }，
    // 等於允許把任意外部網址塞進 /_next/image 讓本站幫忙下載並轉檔 ——
    // 這會讓網站變成公開的圖片代理伺服器（任何人都能拿它當跳板、消耗頻寬、
    // 或觸發 Next.js 的 Image Optimizer DoS 弱點）。改成只允許實際會用到的來源。
    remotePatterns: [
      // Vercel Blob（目前圖片上傳的實際儲存位置）
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      // S3 備用儲存（若日後改用 AWS）
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.ap-northeast-1.amazonaws.com' },
      // ⚠️ ISO 封包前必須移除：/about 與 news mock data 目前還吃 Unsplash 的外部圖片。
      // 封閉的政府內網連不到 unsplash.com，圖片會全部破圖；而且每次載入都會把
      // 使用者 IP 送給第三方，個資查核會被挑。請改成上傳到媒體庫或放 public/images。
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // 限制可產生的尺寸，避免被大量不同 width 參數灌爆快取
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // SVG 交由瀏覽器渲染會有 XSS 風險，明確關閉
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
  },
}

export default withNextIntl(nextConfig)
