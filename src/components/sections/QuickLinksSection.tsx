import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import Reveal from '@/components/ui/Reveal'

export default function QuickLinksSection({ locale }: { locale: string }) {
  const t = useTranslations('home.quicklinks')
  const isEn = locale === 'en'

  const links = [
    {
      href: '/calendar',
      num: '01',
      icon: '📅',
      iconBg: 'bg-[#FFE8D6]',
      title: t('calendar'),
      zhSub: '掌握中心重要日程',
      enSub: 'Key dates & events',
    },
    {
      href: '/documents',
      num: '02',
      icon: '📄',
      iconBg: 'bg-[#DDF2E7]',
      title: t('documents'),
      zhSub: '各類申請表、規章文件',
      enSub: 'Applications & regulations',
    },
    {
      href: '/teachers',
      num: '03',
      icon: '🧑‍🏫',
      iconBg: 'bg-[#FFF0B8]',
      title: isEn ? 'Our Team' : '師資介紹',
      zhSub: '召集人、行政與外師顧問',
      enSub: 'Conveners & consultants',
    },
    {
      href: '/contact',
      num: '04',
      icon: '💬',
      iconBg: 'bg-[#DCEFFB]',
      title: t('contact'),
      zhSub: '歡迎來信與來電',
      enSub: "We'd love to hear from you",
    },
  ]

  return (
    <section className="bg-cream py-[88px]">
      <div className="container-school">
        <div className="mx-auto mb-[52px] max-w-[720px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FBDCB3] bg-[#FFF1E0] px-4 py-1.5 text-[0.78rem] font-bold tracking-[0.14em] text-orangeDeep">
            ⚡ QUICK ACCESS
          </span>
          <h2 className="mt-3.5 text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold text-ink">{t('title')}</h2>
          <p className="mx-auto mt-2 max-w-[640px] text-inkSoft">
            {isEn ? 'Calendar, forms and resources in one place' : '行事曆、表單與檔案資源，一站搞定'}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((l, i) => (
            <Reveal key={l.href} delay={i * 0.1}>
              <Link
                href={l.href as any}
                className="group relative block rounded-[28px] border border-line bg-white p-[30px_28px] shadow-[0_6px_18px_rgba(178,122,66,0.08)] transition hover:-translate-y-[6px] hover:shadow-soft"
              >
                <span className="font-heading text-[0.85rem] font-bold tracking-[0.12em] text-inkFaint">{l.num}</span>
                <span className="absolute right-[26px] top-[30px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#FFF1E0] text-base font-bold text-orangeDeep transition group-hover:bg-coOrange group-hover:text-white">
                  →
                </span>
                <div className={`mb-4 mt-5 flex h-14 w-14 items-center justify-center rounded-[18px] text-[1.6rem] ${l.iconBg}`}>
                  {l.icon}
                </div>
                <h3 className="text-[1.05rem] font-bold text-ink">{l.title}</h3>
                <p className="mt-1.5 text-[0.82rem] text-inkSoft">{isEn ? l.enSub : l.zhSub}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
