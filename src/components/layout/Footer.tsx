import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Mail, Phone, Printer, MapPin, Landmark, ExternalLink } from 'lucide-react'
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

// 後台「網站設定」找不到對應 key 時的預設值，跟 admin/settings/page.tsx 的 DEFAULT_SETTINGS 保持一致
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
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-school py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-700 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-white">基隆市英語資源中心</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">支援教師與外師的英語教學資源與研習平台</p>
            <a
              href="https://bilingual-school.vercel.app/zh-TW"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Landmark size={13} className="flex-shrink-0" />
              主管機關：基隆市政府教育處
              <ExternalLink size={11} className="flex-shrink-0" />
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">快速連結</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/news', label: t('nav.news') },
                { href: '/about', label: t('nav.about') },
                { href: '/admission', label: t('nav.admission') },
                { href: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">本站資訊</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={'/privacy' as any} className="hover:text-white transition-colors">
                  {t('legal.privacy_policy')}
                </Link>
              </li>
              <li>
                <Link href={'/security-policy' as any} className="hover:text-white transition-colors">
                  {t('legal.security_policy')}
                </Link>
              </li>
              <li className="text-gray-400 pt-1">
                {t('footer.last_updated')}：{formatDate(lastUpdated, locale)}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">聯絡資訊</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-primary-400 flex-shrink-0" />
                {address}
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary-400 flex-shrink-0" />
                {settings.contact_phone}
              </li>
              <li className="flex items-center gap-2">
                <Printer size={14} className="text-primary-400 flex-shrink-0" />
                02-2XXX-XXXX（請填入傳真）
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary-400 flex-shrink-0" />
                {settings.contact_email}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} 基隆市英語資源中心 {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}