import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/layout/Breadcrumb'
import HideOnHome from '@/components/layout/HideOnHome'
import PageTransition from '@/components/ui/PageTransition'

export const metadata: Metadata = {
  title: { default: '基隆市英語資源中心', template: '%s |基隆市英語資源中心' },
  description: '基隆市英語資源中心 — 提供教師與外師專業英語教學資源、研習與交流平台',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!routing.locales.includes(locale as 'zh-TW' | 'en')) notFound()
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      {/* 全站 Navbar — 首頁也顯示（對應 design-preview 的頂部導覽列） */}
      <Navbar />
      {/* 麵包屑只顯示在內頁（首頁自帶 Hero，不需要麵包屑） */}
      <HideOnHome>
        <Breadcrumb />
      </HideOnHome>
      <main id="main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      {/* 全站 Footer — 首頁也顯示（對應 design-preview 的頁尾） */}
      <Footer locale={locale} />
    </NextIntlClientProvider>
  )
}