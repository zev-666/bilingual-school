'use client'

// src/app/[locale]/documents/DocumentsClient.tsx
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Download, FileText } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

type DocumentItem = {
  id: string
  titleZh: string
  titleEn: string
  category: string
  formType: string
  fileUrl: string
  fileSize: number
  downloadCount: number
}

interface DocumentsClientProps {
  locale: string
  documents: DocumentItem[]
}

const TABS = ['teaching', 'admin', 'other'] as const
type Tab = (typeof TABS)[number]

export default function DocumentsClient({ locale, documents }: DocumentsClientProps) {
  const t = useTranslations('documents')
  const tc = useTranslations('documents.categories')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTab = (searchParams.get('tab') as Tab) ?? 'teaching'

  const setTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  const filtered = documents.filter((doc) => {
    if (activeTab === 'teaching') return doc.category === 'FORM' && doc.formType === 'TEACHING'
    if (activeTab === 'admin') return doc.category === 'FORM' && doc.formType === 'ADMINISTRATIVE'
    return doc.category !== 'FORM'
  })

  return (
    <div>
      {/* Tabs */}
      <div role="tablist" aria-label={t('title')} className="mb-8 flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={activeTab === tab}
            onClick={() => setTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">{t('no_documents_in_tab')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
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
                    {doc.fileSize > 0 && (
                      <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {doc.downloadCount} {t('downloads')}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                <Download size={14} /> {t('download')}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
