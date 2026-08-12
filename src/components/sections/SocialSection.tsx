import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react'

interface SocialSectionProps {
  locale: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  lineUrl?: string
}

const LABELS: Record<string, { zh: string; en: string }> = {
  facebook:  { zh: 'Facebook 粉絲專頁', en: 'Facebook Page' },
  instagram: { zh: 'Instagram',        en: 'Instagram' },
  youtube:   { zh: 'YouTube 頻道',      en: 'YouTube Channel' },
  line:      { zh: 'LINE 官方帳號',     en: 'LINE Official Account' },
}

export default function SocialSection({ locale, facebookUrl, instagramUrl, youtubeUrl, lineUrl }: SocialSectionProps) {
  const items = [
    { key: 'facebook',  url: facebookUrl,  icon: Facebook,      color: 'bg-[#1877F2]' },
    { key: 'instagram', url: instagramUrl, icon: Instagram,     color: 'bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]' },
    { key: 'youtube',   url: youtubeUrl,   icon: Youtube,       color: 'bg-[#FF0000]' },
    { key: 'line',      url: lineUrl,      icon: MessageCircle, color: 'bg-[#06C755]' },
  ].filter((item) => item.url && item.url.trim() !== '')

  if (items.length === 0) return null

  return (
    <section className="bg-[#E1F5EE] px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-[#0F2A4A]">
          {locale === 'zh-TW' ? '追蹤我們' : 'Follow Us'}
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {items.map(({ key, url, icon: Icon, color }) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-full border border-[#D7E3EF] bg-white px-6 py-3.5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(24,95,165,.13)]"
            >
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${color} transition-transform group-hover:scale-110`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-[#0F2A4A]">
                {locale === 'zh-TW' ? LABELS[key].zh : LABELS[key].en}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
