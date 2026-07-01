import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, FileText, Download, Pencil, Trash2 } from 'lucide-react'
import DeleteDocumentButton from './DeleteDocumentButton'

const CATEGORY_LABELS: Record<string, { zh: string; en: string; color: string }> = {
  FORM: { zh: '表單', en: 'Form', color: 'bg-blue-100 text-blue-700' },
  REGULATION: { zh: '法規', en: 'Regulation', color: 'bg-purple-100 text-purple-700' },
  BROCHURE: { zh: '簡章', en: 'Brochure', color: 'bg-green-100 text-green-700' },
  REPORT: { zh: '報告', en: 'Report', color: 'bg-orange-100 text-orange-700' },
  OTHER: { zh: '其他', en: 'Other', color: 'bg-gray-100 text-gray-700' },
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function getDocuments() {
  try {
    return await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return [
      {
        id: 'mock-1',
        titleZh: '113學年度招生簡章',
        titleEn: 'Admission Brochure 2024',
        category: 'BROCHURE',
        fileUrl: '/docs/brochure-2024.pdf',
        fileSize: 2048000,
        downloadCount: 128,
        isPublished: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'mock-2',
        titleZh: '學生請假申請表',
        titleEn: 'Student Leave Application Form',
        category: 'FORM',
        fileUrl: '/docs/leave-form.pdf',
        fileSize: 512000,
        downloadCount: 45,
        isPublished: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: 'mock-3',
        titleZh: '學校教育法規彙編',
        titleEn: 'School Regulation Compilation',
        category: 'REGULATION',
        fileUrl: '/docs/regulations.pdf',
        fileSize: 5120000,
        downloadCount: 22,
        isPublished: false,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
      },
    ]
  }
}

export default async function AdminDocumentsPage() {
  const documents = await getDocuments()

  const byCategory = Object.keys(CATEGORY_LABELS).reduce(
    (acc, cat) => {
      acc[cat] = documents.filter((d) => d.category === cat)
      return acc
    },
    {} as Record<string, typeof documents>,
  )

  const totalDownloads = documents.reduce((sum, d) => sum + (d.downloadCount ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文件管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            共 {documents.length} 份文件・累計下載 {totalDownloads} 次
          </p>
        </div>
        <Link href="/admin/documents/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新增文件
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
          <div key={cat} className="card p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{byCategory[cat]?.length ?? 0}</div>
            <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${label.color}`}>
              {label.zh}
            </div>
          </div>
        ))}
      </div>

      {/* Document List by Category */}
      {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
        const docs = byCategory[cat]
        if (!docs?.length) return null
        return (
          <div key={cat} className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${label.color}`}>
                {label.zh} / {label.en}
              </span>
              <span className="text-sm text-gray-500">{docs.length} 份</span>
            </div>
            <div className="divide-y divide-gray-50">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-gray-900">{doc.titleZh}</p>
                      {!doc.isPublished && (
                        <span className="badge badge-gray flex-shrink-0">草稿</span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500">{doc.titleEn}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatFileSize(doc.fileSize ?? 0)}</span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {doc.downloadCount ?? 0} 次下載
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="預覽"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <Link
                      href={`/admin/documents/${doc.id}`}
                      className="rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                      title="編輯"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteDocumentButton id={doc.id} title={doc.titleZh} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {documents.length === 0 && (
        <div className="card py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">尚無文件，點擊「新增文件」開始上傳</p>
        </div>
      )}
    </div>
  )
}
