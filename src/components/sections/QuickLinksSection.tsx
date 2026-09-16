import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Zap, Calendar, FileText, Users, MessageSquare, ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'

export default function QuickLinksSection({ locale }: { locale: string }) {
  const t = useTranslations('home.quicklinks')
  const isEn = locale === 'en'

  // 圖示全部改為 Lucide 線條圖示（原本是 emoji：📅📄🧑‍🏫💬）
  const links = [
    {
      href: '/calendar',
      num: '01',
      Icon: Calendar,
      iconBg: 'bg-[#FFE8D6]',
      iconColor: 'text-orangeDeep',
      title: t('calendar'),
      zhSub: '掌握中心重要日程',
      enSub: 'Key dates & events',
    },
    {
      href: '/documents',
      num: '02',
      Icon: FileText,
      iconBg: 'bg-[#DDF2E7]',
      iconColor: 'text-mintDark',
      title: t('documents'),
      zhSub: '各類申請表、規章文件',
      enSub: 'Applications & regulations',
    },
    {
      href: '/teachers',
      num: '03',
      Icon: Users,
      iconBg: 'bg-[#FFF0B8]',
      iconColor: 'text-[#9A7B12]',
      title: isEn ? 'Our Team' : '團隊介紹',
      zhSub: '召集人、行政與外師顧問',
      enSub: 'Conveners & consultants',
    },
    {
      href: '/contact',
      num: '04',
      Icon: MessageSquare,
      iconBg: 'bg-[#DCEFFB]',
      iconColor: 'text-[#2A6389]',
      title: t('contact'),
      zhSub: '歡迎來信與來電',
      enSub: "We'd love to hear from you",
    },
  ]

  return (
    <section className="bg-cream py-[88px]">
      <div className="container-school">
        <div className="mb-[52px]">
          <SectionHeading
            eyebrow="QUICK ACCESS"
            icon={Zap}
            align="center"
            title={t('title')}
            subtitle={isEn ? 'Calendar, forms and resources in one place' : '行事曆、表單與檔案資源，一站搞定'}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((l, i) => {
            const Icon = l.Icon
            return (
              <Reveal key={l.href} delay={i * 0.1}>
                <Link
                  href={l.href as any}
                  className="group relative block rounded-[28px] border border-line bg-white p-[30px_28px] shadow-[0_6px_18px_rgba(178,122,66,0.08)] transition hover:-translate-y-[6px] hover:border-[#F3D79C] hover:shadow-soft"
                >
                  <span className="font-heading text-[0.85rem] font-bold tracking-[0.12em] text-inkFaint">{l.num}</span>
                  <span className="absolute right-[26px] top-[30px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#FFF1E0] text-orangeDeep transition group-hover:bg-coOrange group-hover:text-white">
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                  <div className={`mb-4 mt-5 flex h-14 w-14 items-center justify-center rounded-[18px] ${l.iconBg} ${l.iconColor}`}>
                    <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3 className="text-[1.05rem] font-bold text-ink">{l.title}</h3>
                  <p className="mt-1.5 text-[0.82rem] text-inkSoft">{isEn ? l.enSub : l.zhSub}</p>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
