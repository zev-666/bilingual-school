// src/app/[locale]/calendar/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { cn, CALENDAR_TYPE_COLORS } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: { locale: string }
  searchParams: { type?: string }
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'calendar' })
  return { title: t('title') }
}

const EVENT_TYPES = ['HOLIDAY', 'MEETING', 'WORKSHOP', 'DEADLINE', 'ACTIVITY', 'OTHER'] as const

async function getEvents(type?: string) {
  try {
    return await prisma.calendarEvent.findMany({
      where: {
        isPublished: true,
        ...(type && type !== 'all' ? { type: type as (typeof EVENT_TYPES)[number] } : {}),
      },
      orderBy: { startDate: 'asc' },
    })
  } catch {
    return []
  }
}

function formatDay(d: Date, locale: string) {
  return new Date(d).toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}

function monthKey(d: Date) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string, locale: string) {
  const [y, m] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, 1)
  return dt.toLocaleDateString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', { year: 'numeric', month: 'long' })
}

export default async function CalendarPage({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: 'calendar' })
  const tt = await getTranslations({ locale, namespace: 'calendar.types' })
  const activeType = searchParams.type ?? 'all'
  const events = await getEvents(activeType)

  const grouped = events.reduce<Record<string, typeof events>>((acc, ev) => {
    const key = monthKey(ev.startDate)
    ;(acc[key] ??= []).push(ev)
    return acc
  }, {})
  const months = Object.keys(grouped).sort()

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          <a
            href="/calendar"
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
              activeType === 'all'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            )}
          >
            {t('allTypes')}
          </a>
          {EVENT_TYPES.map((type) => (
            <a
              key={type}
              href={`/calendar?type=${type}`}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                activeType === type
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              )}
            >
              {tt(type)}
            </a>
          ))}
        </div>

        {months.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-20 text-center">
            <CalendarDays size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-12 max-w-3xl">
            {months.map((key) => (
              <div key={key}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary-600 rounded-full inline-block" />
                  {monthLabel(key, locale)}
                </h2>
                <div className="space-y-3">
                  {grouped[key].map((event) => (
                    <div key={event.id} className="card p-5 flex items-start gap-4">
                      <div className="w-16 shrink-0 text-center">
                        <p className="text-xs font-semibold text-primary-600 uppercase">
                          {formatDay(event.startDate, locale)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900">
                            {locale === 'zh-TW' ? event.titleZh : event.titleEn}
                          </h3>
                          <span className={cn('badge text-xs', CALENDAR_TYPE_COLORS[event.type])}>
                            {tt(event.type)}
                          </span>
                        </div>
                        {(locale === 'zh-TW' ? event.descZh : event.descEn) && (
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            {locale === 'zh-TW' ? event.descZh : event.descEn}
                          </p>
                        )}
                        {event.endDate && (
                          <p className="text-xs text-gray-400 mt-1">
                            {t('until')} {formatDay(event.endDate, locale)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
