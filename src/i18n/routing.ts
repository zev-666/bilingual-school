// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['zh-TW', 'en'],
  defaultLocale: 'zh-TW',
  pathnames: {
    '/': '/',
    '/news': { 'zh-TW': '/news', 'en': '/news' },
    '/news/[slug]': { 'zh-TW': '/news/[slug]', 'en': '/news/[slug]' },
    '/albums': { 'zh-TW': '/albums', 'en': '/albums' },
    '/albums/[slug]': { 'zh-TW': '/albums/[slug]', 'en': '/albums/[slug]' },
    '/videos': { 'zh-TW': '/videos', 'en': '/videos' },
    '/documents': { 'zh-TW': '/documents', 'en': '/documents' },
    '/teachers': { 'zh-TW': '/teachers', 'en': '/teachers' },
    '/about': { 'zh-TW': '/about', 'en': '/about' },
    '/admission': { 'zh-TW': '/admission', 'en': '/admission' },
    '/contact': { 'zh-TW': '/contact', 'en': '/contact' },
  },
})

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
