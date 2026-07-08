import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const t = useTranslations()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-school py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-700 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-white">基隆市英語資源中心</span>
            </div>
            <p className="text-sm text-gray-400">支援教師與外師的英語教學資源與研習平台</p>
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
            <h3 className="font-semibold text-white mb-4">聯絡資訊</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-primary-400 flex-shrink-0" />
                基隆市中正區（請填入實際地址）
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary-400 flex-shrink-0" />
                02-2XXX-XXXX
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary-400 flex-shrink-0" />
                info@kl-erc.edu.tw
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © 2024 基隆市英語資源中心 版權所有
        </div>
      </div>
    </footer>
  )
}
