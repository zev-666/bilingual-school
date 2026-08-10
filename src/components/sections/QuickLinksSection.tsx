import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { FileText, Calendar, Download, Mail } from 'lucide-react'

const COLOR_RAMPS = [
  { bg: 'bg-sky-100', icon: 'text-sky-600' },
  { bg: 'bg-amber-100', icon: 'text-amber-600' },
  { bg: 'bg-rose-100', icon: 'text-rose-600' },
]

export default function QuickLinksSection({ locale }: { locale: string }) {
  const t = useTranslations('home.quicklinks')

  const links = [
    { href: '/admission', label: t('admission'), icon: FileText },
    { href: '/news', label: t('calendar'), icon: Calendar },
    { href: '/documents', label: t('documents'), icon: Download },
    { href: '/contact', label: t('contact'), icon: Mail },
  ]

  return (
    <section className="section-padding bg-sky-50">
      <div className="container-school">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-8 tracking-tight">{t('title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {links.map(({ href, label, icon: Icon }, i) => {
            const ramp = COLOR_RAMPS[i % COLOR_RAMPS.length]
            return (
              <Link key={href} href={href as any}
                className="card p-6 text-center group">
                <div className={`w-14 h-14 ${ramp.bg} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={ramp.icon} />
                </div>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}