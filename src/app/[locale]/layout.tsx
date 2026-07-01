// src/app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { Inter, Noto_Sans_TC } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import '@/app/globals.css'

// Load Google Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansTc = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
})

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: LocaleLayoutProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home.hero' })

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: locale === 'zh-TW' ? '雙語實驗學校' : 'Bilingual School',
      template: `%s | ${locale === 'zh-TW' ? '雙語實驗學校' : 'Bilingual School'}`,
    },
    description:
      locale === 'zh-TW'
        ? '提供世界級雙語教育，培育具全球視野的未來人才。'
        : 'Providing world-class bilingual education, cultivating future leaders with global perspectives.',
    openGraph: {
      type: 'website',
      locale: locale === 'zh-TW' ? 'zh_TW' : 'en_US',
      siteName: locale === 'zh-TW' ? '雙語實驗學校' : 'Bilingual School',
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      canonical: '/',
      languages: {
        'zh-TW': '/zh-TW',
        'en': '/en',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Validate locale (這裡使用 notFound() 是合法的，因為這不是 root layout)
  if (!routing.locales.includes(locale as 'zh-TW' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${notoSansTc.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <NextIntlClientProvider messages={messages}>
          {/* Skip to content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary-600 text-white px-4 py-2 rounded-md"
          >
            {locale === 'zh-TW' ? '跳到主要內容' : 'Skip to main content'}
          </a>

          <Navbar />

          <main id="main-content" className="min-h-screen">
            {children}
          </main>

          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}