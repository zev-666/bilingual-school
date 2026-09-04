import Reveal from '@/components/ui/Reveal'

interface SocialSectionProps {
  locale: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  lineUrl?: string
}

const ITEMS = [
  { key: 'facebook', labelZh: 'Facebook 粉絲專頁', labelEn: 'Facebook Page', mark: 'f', color: 'bg-[#1877F2]' },
  { key: 'instagram', labelZh: 'Instagram', labelEn: 'Instagram', mark: '◎', color: 'bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]' },
  { key: 'youtube', labelZh: 'YouTube 頻道', labelEn: 'YouTube Channel', mark: '▶', color: 'bg-[#FF0000]' },
  { key: 'line', labelZh: 'LINE 官方帳號', labelEn: 'LINE Official Account', mark: '✆', color: 'bg-[#06C755]' },
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
        <div className="mx-auto mb-[52px] max-w-[720px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FBDCB3] bg-[#FFF1E0] px-4 py-1.5 text-[0.78rem] font-bold tracking-[0.14em] text-orangeDeep">
            📲 FOLLOW US
          </span>
          <h2 className="mt-3.5 text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold text-ink">
            {isEn ? 'Follow Us' : '追蹤我們'}
          </h2>
          <p className="mx-auto mt-2 max-w-[640px] text-inkSoft">
            {isEn ? 'Stay in the loop and learn English together' : '活動消息不漏接，加入我們一起學英語'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((item) => (
            <Reveal key={item.key}>
              <a
                href={urls[item.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-full border border-line bg-creamSoft py-[10px] pl-[10px] pr-[22px] text-[0.9rem] font-bold text-ink transition hover:-translate-y-1 hover:shadow-card"
              >
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[1.05rem] text-white transition-transform group-hover:scale-110 ${item.color}`}>
                  {item.mark}
                </span>
                {isEn ? item.labelEn : item.labelZh}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
