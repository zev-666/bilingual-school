import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { FileText, Calendar, Download, Mail } from 'lucide-react'

export default function QuickLinksSection({ locale }: { locale: string }) {
  const t = useTranslations('home.quicklinks')

  const links = [
    { href: '/admission', label: t('admission'), icon: FileText, color: 'bg-primary-700' },
    { href: '/news', label: t('calendar'), icon: Calendar, color: 'bg-primary-600' },
    { href: '/documents', label: t('documents'), icon: Download, color: 'bg-accent-600' },
    { href: '/contact', label: t('contact'), icon: Mail, color: 'bg-gray-700' },
  ]

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-school">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 tracking-tight">{t('title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {links.map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href as any}
              className="card p-6 text-center hover:border-primary-200 group">
              <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
