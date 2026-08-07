'use client'

import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { ChevronRight, Home } from 'lucide-react'

const NAV_KEYS = ['news', 'albums', 'videos', 'documents', 'teachers', 'about', 'admission', 'contact'] as const

export default function Breadcrumb() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tl = useTranslations('legal')
  const tc = useTranslations('common')

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null // 首頁不顯示

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1

    let label: string = segment
    if ((NAV_KEYS as readonly string[]).includes(segment)) {
      label = t(segment as any)
    } else if (segment === 'privacy') {
      label = tl('privacy_policy')
    } else if (segment === 'security-policy') {
      label = tl('security_policy')
    } else if (isLast) {
      label = tc('detail') // 動態內容頁（如公告詳情）
    }

    return { href, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-200">
      <div className="container-school py-3">
        <ol className="flex items-center flex-wrap gap-1.5 text-sm text-gray-600">
          <li className="flex items-center gap-1.5">
            <Link href="/" className="flex items-center gap-1 hover:text-primary-700 transition-colors">
              <Home size={14} />
              <span>{t('home')}</span>
            </Link>
            <ChevronRight size={14} className="text-gray-400" />
          </li>
          {crumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {crumb.isLast ? (
                <span className="font-medium text-gray-900" aria-current="page">{crumb.label}</span>
              ) : (
                <Link href={crumb.href as any} className="hover:text-primary-700 transition-colors">
                  {crumb.label}
                </Link>
              )}
              {i < crumbs.length - 1 && <ChevronRight size={14} className="text-gray-400" />}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
