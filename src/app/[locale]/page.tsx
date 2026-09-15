// src/app/[locale]/page.tsx
// 首頁 = 純入口頁，整屏只有三張分流大卡（對應設計稿的第一層）。
// 長條式內容已移至 /home（見 src/app/[locale]/home/page.tsx）。
// 本頁只需要 cool_english_url 一個設定值，查詢一樣包 try/catch，失敗回安全預設值。

import { prisma } from '@/lib/prisma'
import PortalSection from '@/components/sections/PortalSection'

export const revalidate = 300

async function getCoolEnglishUrl(): Promise<string> {
  try {
    const row = await prisma.siteSetting.findFirst({
      where: { key: 'cool_english_url' },
    })
    return row?.value ?? ''
  } catch {
    return ''
  }
}

export default async function PortalPage({ params: { locale } }: { params: { locale: string } }) {
  const coolEnglishUrl = await getCoolEnglishUrl()

  return <PortalSection locale={locale} coolEnglishUrl={coolEnglishUrl} />
}
