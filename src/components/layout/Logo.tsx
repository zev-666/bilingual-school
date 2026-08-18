// src/components/layout/Logo.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 全站唯一的 LOGO 來源。前台 Navbar／Footer、首頁門戶頁首頁尾、後台登入頁
// 全部都用這個元件，之後要換 LOGO 只要換 public/ 底下的圖檔即可，
// 不需要再一個一個檔案去找。
//
// variant（預設 'mark'）：
//   'mark' → public/images/logo-mark.png  只有中間那隻雞＋燈塔書本
//            40~60px 這種頁首尺寸下，外環那圈中英文字會糊成一團看不清楚，
//            所以頁首／頁尾／登入頁一律用這個版本，雞才看得出來。
//   'full' → public/images/logo-eerc.png  完整圓形徽章（含外環中英文名稱）
//            適合 120px 以上的大尺寸、分享縮圖（og:image）、公文與印刷品。
//
// favicon／手機加到主畫面的圖示是另外兩個檔案，Next.js App Router 會自動抓：
//   src/app/icon.png        （瀏覽器分頁小圖示）
//   src/app/apple-icon.png  （iOS 加入主畫面）
// ─────────────────────────────────────────────────────────────────────────────

import Image from 'next/image'

export default function Logo({
  size = 40,
  variant = 'mark',
  className = '',
  priority = false,
}: {
  size?: number
  variant?: 'full' | 'mark'
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={variant === 'full' ? '/images/logo-eerc.png' : '/images/logo-mark.png'}
      alt="基隆市英語教育資源中心 Keelung City English Education Resource Center"
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
