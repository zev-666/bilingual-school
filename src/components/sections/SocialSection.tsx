import { Facebook, Instagram, Youtube, MessageCircle, Share2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'

interface SocialSectionProps {
  locale: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  lineUrl?: string
}

// 原本用文字符號（f / ◎ / ▶ / ✆）當品牌標記，辨識度低且不像官方連結，
// 改用 Lucide 的實際品牌圖示；LINE 無對應品牌圖示，以對話框圖示代替。
const ITEMS: { key: string; labelZh: string; labelEn: string; Icon: LucideIcon; color: string }[] = [
  { key: 'facebook', labelZh: 'Facebook 粉絲專頁', labelEn: 'Facebook Page', Icon: Facebook, color: 'bg-[#1877F2]' },
  { key: 'instagram', labelZh: 'Instagram', labelEn: 'Instagram', Icon: Instagram, color: 'bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]' },
  { key: 'youtube', labelZh: 'YouTube 頻道', labelEn: 'YouTube Channel', Icon: Youtube, color: 'bg-[#C4302B]' },
  { key: 'line', labelZh: 'LINE 官方帳號', labelEn: 'LINE Official Account', Icon: MessageCircle, color: 'bg-[#05A64B]' },
]

export default function SocialSection({ locale, facebookUrl, instagramUrl, youtubeUrl, lineUrl }: SocialSectionProps) {
  const isEn = locale === 'en'
  const urls: Record<string, string | undefined> = {
    facebook: facebookUrl,
    instagram: instagramUrl,
    youtube: youtubeUrl,
    line: lineUrl,
  }
  const items = ITEMS.filter((item) => urls[item.key] && urls[item.key]!.trim() !== '')

  if (items.length === 0) return null

  return (
    <section className="bg-white py-[88px]">
      <div className="container-school">
        <div className="mb-[52px]">
          <SectionHeading
            eyebrow="FOLLOW US"
            icon={Share2}
            align="center"
            title={isEn ? 'Follow Us' : '追蹤我們'}
            subtitle={isEn ? 'Stay in the loop and learn English together' : '活動消息不漏接，加入我們一起學英語'}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((item) => {
            const Icon = item.Icon
            return (
              <Reveal key={item.key}>
                <a
                  href={urls[item.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-full border border-line bg-creamSoft py-[10px] pl-[10px] pr-[22px] text-[0.9rem] font-bold text-ink transition hover:-translate-y-1 hover:shadow-card focus:outline-none focus-visible:ring-4 focus-visible:ring-coYellow"
                >
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110 ${item.color}`}>
                    <Icon size={19} strokeWidth={2} aria-hidden="true" />
                  </span>
                  {isEn ? item.labelEn : item.labelZh}
                </a>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
