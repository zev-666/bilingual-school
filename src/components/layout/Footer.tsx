import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Mail, Phone, Printer, MapPin, Landmark, ExternalLink, ShieldCheck, Globe } from 'lucide-react'
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
    <footer className="border-t border-[#D7E3EF] bg-[#F7FAFD]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          {/* 品牌 */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#B5D4F4] bg-[#E6F1FB] text-[#185FA5]">
                <Globe size={18} />
              </span>
              <span className="font-bold text-[#0F2A4A]">基隆市英語資源中心</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#4A6B8A]">
              把城市變成教室，把學習帶回生活。
            </p>
            <a
              href="https://bilingual-school.vercel.app/zh-TW"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1.5 text-xs text-[#4A6B8A] transition-colors hover:text-[#185FA5]"
            >
              <Landmark size={13} className="flex-shrink-0" />
              主管機關：基隆市政府教育處
              <ExternalLink size={11} className="flex-shrink-0" />
            </a>
          </div>

          {/* 快速連結 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2A4A]">快速連結</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#4A6B8A]">
              {[
                { href: '/news', label: t('nav.news') },
                { href: '/about', label: t('nav.about') },
                { href: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any} className="transition-colors hover:text-[#185FA5]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 本站資訊 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2A4A]">本站資訊</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#4A6B8A]">
              <li>
                <Link href={'/privacy' as any} className="transition-colors hover:text-[#185FA5]">
                  {t('legal.privacy_policy')}
                </Link>
              </li>
              <li>
                <Link href={'/security-policy' as any} className="transition-colors hover:text-[#185FA5]">
                  {t('legal.security_policy')}
                </Link>
              </li>
              <li className="pt-1 text-[#6B87A0]">
                {t('footer.last_updated')}：{formatDate(lastUpdated, locale)}
              </li>
            </ul>
          </div>

          {/* 聯絡資訊 */}
          <div>
            <h3 className="text-sm font-bold text-[#0F2A4A]">聯絡資訊</h3>
            <ul className="mt-4 space-y-4 text-sm text-[#4A6B8A]">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#185FA5]" />
                {address}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-[#185FA5]" />
                {settings.contact_phone}
              </li>
              <li className="flex items-center gap-2">
                <Printer size={16} className="flex-shrink-0 text-[#185FA5]" />
                02-2XXX-XXXX（請填入傳真）
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-[#185FA5]" />
                {settings.contact_email}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#D7E3EF] pt-6 sm:flex-row sm:items-center">
          <div className="text-center text-xs text-[#6B87A0] sm:text-left">
            © {new Date().getFullYear()} 基隆市英語資源中心 {t('footer.rights')}
          </div>
          <a
            href="https://www.a11y.nat.gov.tw/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-shrink-0 items-center gap-2 rounded-md border border-[#B5D4F4] bg-white px-3 py-2 text-xs text-[#33526D] transition-colors hover:border-[#185FA5]"
          >
            <ShieldCheck size={14} className="flex-shrink-0" />
            {locale === 'en' ? 'This site follows WCAG 2.1 AA accessibility guidelines' : '本站依循 WCAG 2.1 AA 無障礙網頁設計原則建置'}
          </a>
        </div>
      </div>
    </footer>
  )
}
