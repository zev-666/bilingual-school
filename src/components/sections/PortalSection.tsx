// src/components/sections/PortalSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 首頁入口區塊：三張直式大卡分流（版型參考臺中市英語教育資源中心入口網）。
//
//   卡一 英語教學 English Teaching      → /home（站內中文內頁）
//   卡二 線上學習 Cool English          → 站外平台，新視窗（讀 siteSetting）
//   卡三 外師專區 For Foreign Teachers  → /home 英文版（next-intl locale 切換）
//
// 與臺中版的差異：
//   1. 保留全站頁首與頁尾（臺中入口頁也有），所以 layout.tsx 不動 Navbar
//   2. 卡二會離開本站，因此比臺中多一個外連圖示提示使用者
//
// 文字色一律 #3B2A1C，對三張底色逐一驗過對比度：
//   #F08A7A 珊瑚 5.62:1 (AA) ／ #FFD97D 奶油黃 10.09:1 (AAA) ／ #A7DCEE 淺藍 9.20:1 (AAA)
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from '@/i18n/routing'
import { ExternalLink } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import PortalEnglishTeaching from '@/components/illustrations/PortalEnglishTeaching'
import PortalCoolEnglish from '@/components/illustrations/PortalCoolEnglish'
import PortalFet from '@/components/illustrations/PortalFet'

interface PortalSectionProps {
  locale: string
  coolEnglishUrl?: string
}

/** 三張卡共用外觀。portal-card 這個 class 是給 globals.css 的 hover 動畫掛勾用的。 */
const CARD =
  'portal-card group relative flex w-full max-w-[330px] flex-col overflow-hidden rounded-[26px] ' +
  'px-7 pb-5 pt-10 shadow-card transition duration-300 hover:-translate-y-2 hover:shadow-soft ' +
  'focus:outline-none focus-visible:ring-4 focus-visible:ring-orangeDeep min-h-[520px]'

const TEXT = '#3B2A1C'

function CardHead({ zh, en }: { zh: string; en: string }) {
  return (
    <div className="text-center" style={{ color: TEXT }}>
      <h2 className="text-[2rem] font-extrabold leading-tight tracking-wide">{zh}</h2>
      <p className="mt-1.5 text-[1.2rem] font-bold leading-snug">{en}</p>
    </div>
  )
}

export default function PortalSection({ locale, coolEnglishUrl }: PortalSectionProps) {
  const isEn = locale === 'en'
  const hasCoolEnglish = Boolean(coolEnglishUrl && coolEnglishUrl.trim() !== '')

  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-cream px-6 py-14">
      <div className="flex w-full max-w-[1160px] flex-wrap items-stretch justify-center gap-8">
        {/* 卡一：英語教學 → 站內內頁 */}
        <Reveal className="flex w-full max-w-[330px] justify-center">
          <Link href="/home" className={`${CARD} bg-coral`}>
            <CardHead zh="英語教學" en="English Teaching" />
            <PortalEnglishTeaching className="pointer-events-none mx-auto mt-auto w-full max-w-[278px]" />
          </Link>
        </Reveal>

        {/* 卡二：Cool English → 站外平台 */}
        <Reveal delay={0.1} className="flex w-full max-w-[330px] justify-center">
          {hasCoolEnglish ? (
            <a
              href={coolEnglishUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${CARD} bg-coYellow`}
            >
              <CardHead zh="線上學習" en="Cool English" />
              {/* 這張會離開本站，給使用者一個明確提示 */}
              <span
                className="mt-3 inline-flex items-center justify-center gap-1.5 text-[0.82rem] font-bold opacity-75"
                style={{ color: TEXT }}
              >
                <ExternalLink size={14} aria-hidden="true" />
                {isEn ? 'Opens in a new window' : '另開新視窗前往教育部平台'}
              </span>
              <PortalCoolEnglish className="pointer-events-none mx-auto mt-auto w-full max-w-[278px]" />
            </a>
          ) : (
            // 後台尚未設定 cool_english_url 時的安全狀態：不可點，但版面不破
            <div className={`${CARD} bg-coYellow cursor-default`} aria-disabled="true">
              <CardHead zh="線上學習" en="Cool English" />
              <span
                className="mt-3 block text-center text-[0.82rem] font-bold opacity-70"
                style={{ color: TEXT }}
              >
                {isEn ? 'Link not set yet' : '連結尚未設定'}
              </span>
              <PortalCoolEnglish className="pointer-events-none mx-auto mt-auto w-full max-w-[278px]" />
            </div>
          )}
        </Reveal>

        {/* 卡三：外師專區 → 切換為英文版全站 */}
        <Reveal delay={0.2} className="flex w-full max-w-[330px] justify-center">
          <Link href="/home" locale="en" className={`${CARD} bg-[#A7DCEE]`}>
            <CardHead zh="外師專區" en="For Foreign Teachers" />
            <PortalFet className="pointer-events-none mx-auto mt-auto w-full max-w-[278px]" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
