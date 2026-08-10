import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import DocumentsClient from './DocumentsClient'

export const dynamic = 'force-dynamic'

async function getDocuments() {
  try {
    return await prisma.document.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return [
      {
        id: '1',
        titleZh: '範例文件',
        titleEn: 'Sample Document',
        category: 'FORM',
        formType: 'ADMINISTRATIVE',
        fileUrl: '#',
        fileSize: 102400,
        downloadCount: 0,
      },
    ]
  }
}

export default async function DocumentsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('documents')
  const documents = await getDocuments()

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <Suspense fallback={null}>
          <DocumentsClient locale={locale} documents={documents as any} />
        </Suspense>
      </div>
    </div>
  )
}
