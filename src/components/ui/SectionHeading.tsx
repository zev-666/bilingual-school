// src/components/ui/SectionHeading.tsx
// 首頁各區塊共用的標題組件。
// 目的：統一原本散在 5 個 section、各自手寫一份的 pill 標籤 + 標題 + 副標，
// 並把 pill 裡的 emoji 換成 Lucide 線條圖示，維持全站單一圖示語言。
//
// 用法：
//   <SectionHeading eyebrow="ABOUT US · 關於本中心" icon={Compass} title="..." subtitle="..." />
//   align="center" 時整組置中（快速連結／團隊／追蹤我們用），預設靠左。

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface SectionHeadingProps {
  /** pill 標籤文字，例如 "ABOUT US · 關於本中心" */
  eyebrow: string
  /** pill 標籤左側的 Lucide 圖示元件（直接傳元件本身，不要傳 JSX） */
  icon: LucideIcon
  /** 主標題，可傳字串或 JSX（需要手動斷行時） */
  title: ReactNode
  /** 副標題，可省略 */
  subtitle?: ReactNode
  /** 置中或靠左，預設靠左 */
  align?: 'left' | 'center'
}

export default function SectionHeading({
  eyebrow,
  icon: Icon,
  title,
  subtitle,
  align = 'left',
}: SectionHeadingProps) {
  const isCenter = align === 'center'

  return (
    <div className={isCenter ? 'mx-auto max-w-[720px] text-center' : ''}>
      <span className="inline-flex items-center gap-2 rounded-full border border-[#FBDCB3] bg-[#FFF1E0] px-4 py-1.5 text-[0.78rem] font-bold tracking-[0.14em] text-orangeDeep">
        <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
        {eyebrow}
      </span>
      <h2 className="mt-3.5 text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold leading-tight text-ink">
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-2 leading-[1.9] text-inkSoft ${isCenter ? 'mx-auto max-w-[640px]' : 'max-w-[560px]'}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
