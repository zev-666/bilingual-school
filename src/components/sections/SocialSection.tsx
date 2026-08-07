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
    <section className="section-padding bg-white">
      <div className="container-school">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 tracking-tight">
          {locale === 'zh-TW' ? '追蹤我們' : 'Follow Us'}
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {items.map(({ key, url, icon: Icon, color }) => (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 px-6 py-4 hover:border-primary-200 group">
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {locale === 'zh-TW' ? LABELS[key].zh : LABELS[key].en}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}