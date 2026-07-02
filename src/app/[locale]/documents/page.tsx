import { useTranslations } from 'next-intl'
import { prisma } from '@/lib/prisma'
import { formatFileSize } from '@/lib/utils'
import { Download, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getDocuments() {
  try {
    return await prisma.document.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' } })
  } catch {
    return [{ id: '1', titleZh: '範例文件', titleEn: 'Sample Document', category: 'FORM', fileUrl: '#', fileSize: 102400, downloadCount: 0 }]
  }
}

export default async function DocumentsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('documents')
  const tc = useTranslations('documents.categories')
  const documents = await getDocuments()

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <div key={doc.id} className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {locale === 'zh-TW' ? doc.titleZh : doc.titleEn}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="badge-blue">{tc(doc.category as any)}</span>
                    {doc.fileSize && <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>}
                    <span className="text-xs text-gray-400">{doc.downloadCount} {t('downloads')}</span>
                  </div>
                </div>
              </div>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <Download size={14} /> {t('download')}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
