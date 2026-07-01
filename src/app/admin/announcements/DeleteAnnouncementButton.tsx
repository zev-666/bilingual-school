'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteAnnouncementButton({ slug }: { slug: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      await fetch(`/api/announcements/${slug}`, { method: 'DELETE' })
      router.refresh()
    } finally { setLoading(false); setConfirming(false) }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={handleDelete} disabled={loading} className="btn-danger py-1.5 px-3 text-xs">
          {loading ? '刪除中...' : '確認刪除'}
        </button>
        <button onClick={() => setConfirming(false)} className="btn-ghost py-1.5 px-3 text-xs">取消</button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className="btn-ghost py-1.5 px-3 text-xs text-red-600 hover:bg-red-50">
      <Trash2 size={14} />
    </button>
  )
}
