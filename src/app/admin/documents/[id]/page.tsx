import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import DocumentEditor from '../DocumentEditor'

interface Props {
  params: { id: string }
}

async function getDocument(id: string) {
  try {
    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) return null
    return doc
  } catch {
    return null
  }
}

export default async function EditDocumentPage({ params }: Props) {
  const doc = await getDocument(params.id)
  if (!doc) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/documents"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">編輯文件</h1>
          <p className="mt-0.5 text-sm text-gray-500">{doc.titleZh}</p>
        </div>
      </div>
      <DocumentEditor
        mode="edit"
        initialData={{
          id: doc.id,
          titleZh: doc.titleZh,
          titleEn: doc.titleEn,
          category: doc.category,
          isPublished: doc.isPublished,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize ?? 0,
        }}
      />
    </div>
  )
}
