import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Calendar, Download, Mail } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'

export default function QuickLinksSection({ locale }: { locale: string }) {
  const t = useTranslations('home.quicklinks')

  const links = [
    { href: '/news', label: t('calendar'), icon: Calendar, num: '01' },
    { href: '/documents', label: t('documents'), icon: Download, num: '02' },
    { href: '/contact', label: t('contact'), icon: Mail, num: '03' },
  ]

  return (
    <section className="bg-[#FCFBF7] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C34E24]">QUICK ACCESS</p>
          <h2 className="mb-9 text-3xl font-bold text-[#2D241E]">{t('title')}</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map(({ href, label, icon: Icon, num }, index) => (
            <Reveal key={href} delay={index * 0.1}>
              <Link
                href={href as any}
                className="group block rounded-2xl border border-[#EFE9E1] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(24,95,165,.13)]"
              >
                <span className="text-xs text-[#C34E24]">{num}</span>
                <div className="mt-6 flex items-center gap-2">
                  <Icon size={18} className="text-[#C34E24]" />
                  <h3 className="font-bold text-[#2D241E]">{label}</h3>
                </div>
                <span className="mt-6 block text-xl text-[#C34E24] transition-transform group-hover:translate-x-1">↗</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
