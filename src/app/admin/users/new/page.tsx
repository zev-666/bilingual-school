import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import UserEditor from '../UserEditor'

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新增使用者</h1>
          <p className="mt-0.5 text-sm text-gray-500">建立後台管理帳號</p>
        </div>
      </div>
      <UserEditor mode="create" />
    </div>
  )
}
