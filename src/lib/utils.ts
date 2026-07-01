// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { zhTW, enUS } from 'date-fns/locale'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date for display */
export function formatDate(date: Date | string, locale: string = 'zh-TW'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dateFnsLocale = locale === 'zh-TW' ? zhTW : enUS
  return format(d, locale === 'zh-TW' ? 'yyyy年M月d日' : 'MMMM d, yyyy', {
    locale: dateFnsLocale,
  })
}

/** Format date as relative time */
export function formatRelativeTime(date: Date | string, locale: string = 'zh-TW'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dateFnsLocale = locale === 'zh-TW' ? zhTW : enUS
  return formatDistanceToNow(d, { addSuffix: true, locale: dateFnsLocale })
}

/** Format file size in human-readable form */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Generate a URL-safe slug from text */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '-')      // spaces → hyphens (incl. CJK space)
    .replace(/[^\w\u4e00-\u9fff-]/g, '') // keep word chars, CJK, hyphens
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Extract YouTube video ID from various URL formats */
export function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/
  )
  return match?.[1] ?? null
}

/** Extract Vimeo video ID */
export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

/** Build YouTube thumbnail URL */
export function youtubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'maxres' = 'hq') {
  const qualityMap = { default: 'default', hq: 'hqdefault', maxres: 'maxresdefault' }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/** Paginate array (for mock data) */
export function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  return {
    data: items.slice(start, start + perPage),
    meta: { total, page, perPage, totalPages },
  }
}

/** API response helpers */
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

/** Category color map for badges */
export const CATEGORY_COLORS: Record<string, string> = {
  ANNOUNCEMENT: 'bg-blue-100 text-blue-700',
  ACTIVITY:     'bg-green-100 text-green-700',
  ADMISSION:    'bg-purple-100 text-purple-700',
  COMPETITION:  'bg-orange-100 text-orange-700',
  NEWS:         'bg-gray-100 text-gray-700',
}
