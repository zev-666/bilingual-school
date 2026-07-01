'use client'

// src/app/admin/albums/DeleteAlbumButton.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteAlbumButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${title}」嗎？\n相簿內所有照片也會一併刪除，此操作無法復原。`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('刪除失敗，請稍後再試')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      aria-label="刪除相簿"
    >
      <Trash2 size={13} />
    </button>
  )
}
