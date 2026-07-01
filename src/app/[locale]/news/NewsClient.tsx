'use client'

// src/app/[locale]/news/NewsClient.tsx
import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, Pin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link as IntlLink } from '@/i18n/routing'
import { cn, formatDate, CATEGORY_COLORS } from '@/lib/utils'

const CATEGORIES = ['all', 'ANNOUNCEMENT', 'ACTIVITY', 'ADMISSION', 'COMPETITION', 'NEWS'] as const

interface Announcement {
  id: string; slug: string; titleZh: string; titleEn: string
  summaryZh?: string | null; summaryEn?: string | null; category: string
  coverImage?: string | null; isPinned: boolean; publishedAt?: Date | null
  viewCount: number; author: { name: string }
}

interface NewsClientProps {
  locale: string
  initialAnnouncements: Announcement[]
  total: number
  totalPages: number
  currentPage: number
}

export default function NewsClient({
  locale, initialAnnouncements, total, totalPages, currentPage,
}: NewsClientProps) {
  const t = useTranslations('news')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const isZh = locale === 'zh-TW'

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const activeCategory = searchParams.get('category') ?? 'all'

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') params.delete(k)
      else params.set(k, v)
    })
    params.delete('page') // reset to page 1 on filter change
    startTransition(() => { router.push(`${pathname}?${params.toString()}`) })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ q: query || null })
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Page header */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white py-16">
        <div className="container-school text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-white/80 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-school py-10">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="input pl-10 pr-4"
              aria-label={t('search')}
            />
          </form>

          {/* Category tabs (scrollable on mobile) */}
          <div className="flex gap-2 overflow-x-auto pb-1 shrink-0" role="tablist" aria-label={tCommon('filter')}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParams({ category: cat === 'all' ? null : cat })}
                role="tab"
                aria-selected={activeCategory === cat}
                className={cn(
                  'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          {isZh ? `共 ${total} 筆結果` : `${total} results`}
        </p>

        {/* Articles grid */}
        {initialAnnouncements.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p>{t('noResults')}</p>
          </div>
        ) : (
          <div className={cn(
            'grid gap-6 transition-opacity duration-200',
            isPending && 'opacity-60',
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}>
            {initialAnnouncements.map((item, i) => {
              const title = isZh ? item.titleZh : item.titleEn
              const summary = isZh ? item.summaryZh : item.summaryEn
              const catColor = CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-700'

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="card group overflow-hidden"
                >
                  {item.coverImage ? (
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={item.coverImage}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-primary-400 to-indigo-400" />
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn('badge text-xs', catColor)}>
                        {t(`categories.${item.category}`)}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.isPinned && (
                          <Pin size={12} className="text-primary-500" aria-label={isZh ? '置頂' : 'Pinned'} />
                        )}
                        {item.publishedAt && (
                          <time dateTime={new Date(item.publishedAt).toISOString()} className="text-xs text-gray-400">
                            {formatDate(item.publishedAt, locale)}
                          </time>
                        )}
                      </div>
                    </div>

                    <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      <IntlLink href={`/news/${item.slug}` as '/'}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {title}
                      </IntlLink>
                    </h2>

                    {summary && (
                      <p className="text-sm text-gray-500 line-clamp-2">{summary}</p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>{item.author.name}</span>
                      <span>{item.viewCount.toLocaleString()} {t('views')}</span>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => updateParams({ page: String(currentPage - 1) })}
              disabled={currentPage <= 1}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
              aria-label={tCommon('prev')}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => updateParams({ page: String(p) })}
                className={cn(
                  'w-10 h-10 rounded-xl text-sm font-medium transition-colors',
                  p === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => updateParams({ page: String(currentPage + 1) })}
              disabled={currentPage >= totalPages}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
              aria-label={tCommon('next')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
