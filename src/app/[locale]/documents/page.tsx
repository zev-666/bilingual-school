// src/app/[locale]/documents/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { formatDate, formatFileSize, cn } from '@/lib/utils'
import { FileDown, FileText, Download, Calendar } from 'lucide-react'

interface Props { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'documents' })
  return { title: t('title') }
}

const MOCK_DOCS = [
  { id: '1', titleZh: '2025學年度招生簡章', titleEn: '2025 Admissions Brochure', descZh: '詳細說明招生條件、報名流程及相關規定。', descEn: 'Admission requirements, application process and regulations.', category: 'BROCHURE', fileUrl: '#', fileName: '2025招生簡章.pdf', fileSize: 2048000, fileType: 'application/pdf', downloadCount: 423, isPublished: true, createdAt: new Date('2024-08-01'), authorId: '1', updatedAt: new Date() },
  { id: '2', titleZh: '學生請假申請單', titleEn: 'Student Leave Application Form', descZh: '學生請假時需填寫此表單，並由家長簽名。', descEn: 'Form required for student leave requests, requires parent signature.', category: 'FORM', fileUrl: '#', fileName: '請假申請單.pdf', fileSize: 512000, fileType: 'application/pdf', downloadCount: 187, isPublished: true, createdAt: new Date('2024-07-15'), authorId: '1', updatedAt: new Date() },
  { id: '3', titleZh: '學生手冊暨校規', titleEn: 'Student Handbook and School Rules', descZh: '學生行為規範及校規說明。', descEn: 'Student code of conduct and school regulations.', category: 'REGULATION', fileUrl: '#', fileName: '學生手冊.pdf', fileSize: 5120000, fileType: 'application/pdf', downloadCount: 856, isPublished: true, createdAt: new Date('2024-08-20'), authorId: '1', updatedAt: new Date() },
  { id: '4', titleZh: '2024年度學校報告', titleEn: '2024 Annual School Report', descZh: '本年度辦學成果及各項數據統計報告。', descEn: 'Annual report on school achievements and statistics.', category: 'REPORT', fileUrl: '#', fileName: '2024年報.pdf', fileSize: 8192000, fileType: 'application/pdf', downloadCount: 234, isPublished: true, createdAt: new Date('2024-09-01'), authorId: '1', updatedAt: new Date() },
  { id: '5', titleZh: '課後活動報名表', titleEn: 'After-School Activity Registration', descZh: '各項課後活動報名申請表格。', descEn: 'Registration forms for various after-school activities.', category: 'FORM', fileUrl: '#', fileName: '課後活動報名表.pdf', fileSize: 256000, fileType: 'application/pdf', downloadCount: 312, isPublished: true, createdAt: new Date('2024-08-25'), authorId: '1', updatedAt: new Date() },
  { id: '6', titleZh: '個人資料使用同意書', titleEn: 'Personal Data Consent Form', descZh: '學生個人資料蒐集使用同意書，入學時必填。', descEn: 'Personal data collection consent form, required for enrollment.', category: 'FORM', fileUrl: '#', fileName: '個資同意書.pdf', fileSize: 384000, fileType: 'application/pdf', downloadCount: 541, isPublished: true, createdAt: new Date('2024-07-01'), authorId: '1', updatedAt: new Date() },
]

const CATEGORY_ICON: Record<string, typeof FileText> = {
  FORM: FileText, REGULATION: FileText, BROCHURE: FileDown,
  REPORT: FileText, OTHER: FileText,
}

const CATEGORIES = ['all', 'FORM', 'REGULATION', 'BROCHURE', 'REPORT', 'OTHER'] as const

async function getDocuments(category?: string) {
  try {
    const where = { isPublished: true, ...(category && category !== 'all' ? { category: category as any } : {}) }
    return await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } })
  } catch {
    return category && category !== 'all'
      ? MOCK_DOCS.filter((d) => d.category === category)
      : MOCK_DOCS
  }
}

export default async function DocumentsPage({ params: { locale } }: Props & { searchParams?: { category?: string } }, { searchParams }: { searchParams?: { category?: string } } = {}) {
  const [t, docs] = await Promise.all([
    getTranslations({ locale, namespace: 'documents' }),
    getDocuments(),
  ])
  const isZh = locale === 'zh-TW'

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white py-16">
        <div className="container-school text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-white/80 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-school py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(docs as typeof MOCK_DOCS).map((doc) => {
            const title = isZh ? doc.titleZh : doc.titleEn
            const desc  = isZh ? doc.descZh  : doc.descEn

            return (
              <div key={doc.id} className="card p-5 flex gap-4 group hover:shadow-md transition-shadow">
                {/* File icon */}
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FileDown size={22} className="text-red-500" aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>
                  {desc && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{desc}</p>}

                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Download size={11} /> {doc.downloadCount}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <time dateTime={new Date(doc.createdAt).toISOString()}>
                        {formatDate(doc.createdAt, locale)}
                      </time>
                    </span>
                  </div>

                  <a
                    href={doc.fileUrl}
                    download={doc.fileName}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600
                      hover:text-primary-700 transition-colors"
                  >
                    <Download size={14} aria-hidden="true" />
                    {t('download')}
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
