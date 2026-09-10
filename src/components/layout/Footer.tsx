import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Mail, Phone, MapPin, Landmark, ExternalLink, ShieldCheck } from 'lucide-react'
import Logo from './Logo'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

async function getLastUpdated() {
  try {
    const latest = await prisma.announcement.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    })
    return latest?.updatedAt ?? new Date()
  } catch {
    return new Date()
  }
}

const DEFAULT_CONTACT_SETTINGS = {
  contact_address_zh: '基隆市中正區（請填入實際地址）',
  contact_address_en: '(Please fill in actual address), Zhongzheng Dist., Keelung',
  contact_phone: '(02) 2XXX-XXXX',
  contact_email: 'info@kl-erc.edu.tw',
}

async function getContactSettings() {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: { in: ['contact_address_zh', 'contact_address_en', 'contact_phone', 'contact_email'] },
      },
    })
    const map = { ...DEFAULT_CONTACT_SETTINGS }
    for (const row of rows) {
      if (row.value) {
        ;(map as Record<string, string>)[row.key] = row.value
      }
    }
    return map
  } catch {
    return DEFAULT_CONTACT_SETTINGS
  }
}

export default async function Footer({ locale = 'zh-TW' }: { locale?: string }) {
  const t = await getTranslations()
  const lastUpdated = await getLastUpdated()
  const settings = await getContactSettings()
  const address = locale === 'en' ? settings.contact_address_en : settings.contact_address_zh

  return (
    <footer className="relative overflow-hidden bg-[#4E3A2C] py-[72px] text-[#EADCCB]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative z-10 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          {/* 品牌 */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coYellow to-coOrange">
                <Logo size={28} />
              </span>
              <span className="font-heading text-[1.02rem] font-bold text-[#FFEBD2]">
                {locale === 'zh-TW' ? '基隆市英語資源中心' : 'Keelung City English Education Resource Center'}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[0.88rem] leading-relaxed text-[#CBB6A3]">
              {locale === 'zh-TW' ? '把城市變成教室，把學習帶回生活。' : 'Turn the city into a classroom, bring learning back to life.'}
            </p>
            <a
              href="https://bilingual-school.vercel.app/zh-TW"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[0.76rem] text-[#EADCCB] transition hover:bg-white/20"
            >
              <Landmark size={13} className="flex-shrink-0" />
              {locale === 'zh-TW' ? '主管機關：基隆市政府教育處' : 'Supervised by: Keelung City Government Department of Education'}
              <ExternalLink size={11} className="flex-shrink-0" />
            </a>
          </div>

          {/* 快速連結 */}
          <div>
            <h4 className="mb-4 font-heading text-base font-bold text-[#FFEBD2]">{locale === 'zh-TW' ? '快速連結' : 'Quick Links'}</h4>
            <ul className="space-y-3 text-[0.88rem] text-[#CBB6A3]">
              {[
                { href: '/news', label: t('nav.news') },
                { href: '/about', label: t('nav.about') },
                { href: '/documents', label: t('nav.documents') },
                { href: '/teachers', label: t('nav.teachers') },
                { href: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any} className="transition hover:pl-1 hover:text-coYellow">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 本站資訊 */}
          <div>
            <h4 className="mb-4 font-heading text-base font-bold text-[#FFEBD2]">{locale === 'zh-TW' ? '本站資訊' : 'Site Info'}</h4>
            <ul className="space-y-3 text-[0.88rem] text-[#CBB6A3]">
              <li>
                <Link href={'/privacy' as any} className="transition hover:pl-1 hover:text-coYellow">
                  {t('legal.privacy_policy')}
                </Link>
              </li>
              <li>
                <Link href={'/security-policy' as any} className="transition hover:pl-1 hover:text-coYellow">
                  {t('legal.security_policy')}
                </Link>
              </li>
              <li className="text-[#D4C9BF]">
                {t('footer.last_updated')}：{formatDate(lastUpdated, locale)}
              </li>
            </ul>
          </div>

          {/* 聯絡資訊 */}
          <div>
            <h4 className="mb-4 font-heading text-base font-bold text-[#FFEBD2]">{locale === 'zh-TW' ? '聯絡資訊' : 'Contact'}</h4>
            <ul className="space-y-4 text-[0.86rem] leading-relaxed text-[#CBB6A3]">
              <li className="flex items-start gap-2.5">
                <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[10px] bg-coYellow/15">
                  <MapPin size={14} className="text-coYellow" />
                </span>
                {address}
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[10px] bg-coYellow/15">
                  <Phone size={14} className="text-coYellow" />
                </span>
                {settings.contact_phone}
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[10px] bg-coYellow/15">
                  <Mail size={14} className="text-coYellow" />
                </span>
                {settings.contact_email}
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/15 py-5 text-[0.8rem] text-[#D4C9BF] sm:flex-row">
          <span>
            © {new Date().getFullYear()} 基隆市英語資源中心 {t('footer.rights')}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5">
            <ShieldCheck size={14} />
            {locale === 'en' ? 'Built to WCAG 2.1 AA accessibility standards' : '本站依循 WCAG 2.1 AA 無障礙網頁設計原則建置'}
          </span>
        </div>
      </div>
    </footer>
  )
}
