// src/app/admin/banners/page.tsx
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import BannerManager from './BannerManager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Banner 輪播管理' }

async function getBanners() {
  try {
    return await prisma.bannerSlide.findMany({ orderBy: { sortOrder: 'asc' } })
  } catch {
    return []
  }
}
export default async function AdminBannersPage() {
  const banners = await getBanners()
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banner 輪播管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          管理首頁 Hero 輪播圖，可拖曳調整順序、啟用 / 停用個別輪播圖
        </p>
      </div>
      <BannerManager initialBanners={banners} />
    </div>
  )
}
