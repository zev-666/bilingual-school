import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import DocumentEditor from '../DocumentEditor'

export default function NewDocumentPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">新增文件</h1>
          <p className="mt-0.5 text-sm text-gray-500">上傳新文件供前台下載</p>
        </div>
      </div>
      <DocumentEditor mode="create" />
    </div>
  )
}
