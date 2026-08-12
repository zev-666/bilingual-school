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
    <section className="bg-amber-50 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-slate-900">{t('title')}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {links.map(({ href, label, icon: Icon }, i) => {
            const ramp = COLOR_RAMPS[i % COLOR_RAMPS.length]
            return (
              <Link
                key={href}
                href={href as any}
                className="group rounded-[28px] border border-amber-100 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${ramp.bg} transition-transform group-hover:scale-110`}>
                  <Icon size={24} className={ramp.icon} />
                </div>
                <span className="text-sm font-bold text-slate-700">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
