import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { FileText, Calendar, Download, Mail } from 'lucide-react'

export default function QuickLinksSection({ locale }: { locale: string }) {
  const t = useTranslations('home.quicklinks')

  const links = [
    { href: '/admission', label: t('admission'), icon: FileText, num: '01' },
    { href: '/news', label: t('calendar'), icon: Calendar, num: '02' },
    { href: '/documents', label: t('documents'), icon: Download, num: '03' },
    { href: '/contact', label: t('contact'), icon: Mail, num: '04' },
  ]

  return (
    <section className="bg-[#F7FAFD] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#185FA5]">QUICK ACCESS</p>
        <h2 className="mb-9 text-3xl font-bold text-[#0F2A4A]">{t('title')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map(({ href, label, icon: Icon, num }) => (
            <Link
              key={href}
              href={href as any}
              className="group rounded-2xl border border-[#D7E3EF] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(24,95,165,.13)]"
            >
              <span className="text-xs text-[#185FA5]">{num}</span>
              <div className="mt-6 flex items-center gap-2">
                <Icon size={18} className="text-[#185FA5]" />
                <h3 className="font-bold text-[#0F2A4A]">{label}</h3>
              </div>
              <span className="mt-6 block text-xl text-[#185FA5] transition-transform group-hover:translate-x-1">↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
