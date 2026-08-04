'use client'

// src/app/admin/albums/[id]/photos/PhotoManager.tsx
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Trash2, ImagePlus, Loader2, GripVertical } from 'lucide-react'

interface Photo {
  id: string
  url: string
  thumbnail: string | null
  captionZh: string | null
  captionEn: string | null
  sortOrder: number
}

interface PhotoManagerProps {
  albumId: string
  initialPhotos: Photo[]
}

export default function PhotoManager({ albumId, initialPhotos }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>(
    [...initialPhotos].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── 拖曳排序 ──────────────────────────────────────────────
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [reorderSaving, setReorderSaving] = useState(false)

  async function persistOrder(ordered: Photo[]) {
    setReorderSaving(true)
    try {
      await fetch(`/api/albums/${albumId}/photos/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: ordered.map((p) => p.id) }),
      })
    } catch {
      alert('排序儲存失敗，請重新整理頁面再試一次')
    } finally {
      setReorderSaving(false)
    }
  }

  function handleDragStart(id: string) {
    setDraggedId(id)
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (id !== draggedId) setDragOverId(id)
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }
    setPhotos((prev) => {
      const next = [...prev]
      const fromIndex = next.findIndex((p) => p.id === draggedId)
      const toIndex = next.findIndex((p) => p.id === targetId)
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      persistOrder(next)
      return next
    })
    setDraggedId(null)
    setDragOverId(null)
  }

  function moveByKeyboard(id: string, direction: -1 | 1) {
    setPhotos((prev) => {
      const index = prev.findIndex((p) => p.id === id)
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      persistOrder(next)
      return next
    })
  }
  // ──────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    setUploadError(null)

    try {
      for (const file of files) {
        // 1. Upload file
        const form = new FormData()
        form.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
        if (!uploadRes.ok) throw new Error(`上傳失敗：${file.name}`)
        const { data: uploadData } = await uploadRes.json()

        // 2. Create photo record
        const photoRes = await fetch(`/api/albums/${albumId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: uploadData.url,
            thumbnail: uploadData.url,
            sortOrder: photos.length,
          }),
        })
        if (!photoRes.ok) throw new Error('儲存照片記錄失敗')
        const { data: newPhoto } = await photoRes.json()
        setPhotos((prev) => [...prev, newPhoto])
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '上傳失敗')
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm('確定要刪除這張照片嗎？')) return
    try {
      const res = await fetch(`/api/albums/${albumId}/photos/${photoId}`, { method: 'DELETE' })
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      } else {
        alert('刪除失敗，請稍後再試')
      }
    } catch {
      alert('刪除失敗，請稍後再試')
    }
  }

  return (
    <div className="space-y-5">
      {/* Upload area */}
      <div
        className="card border-2 border-dashed border-gray-200 hover:border-primary-400
          transition-colors cursor-pointer p-8 text-center"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const dt = e.dataTransfer
          if (dt.files.length > 0 && fileInputRef.current) {
            // Simulate input change
            Object.defineProperty(fileInputRef.current, 'files', { value: dt.files, writable: true })
            fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-primary-600">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-sm font-medium">上傳中，請稍候…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImagePlus size={32} />
            <p className="text-sm font-medium text-gray-600">點擊或拖曳照片到此處上傳</p>
            <p className="text-xs">支援 JPG、PNG、WebP，可一次選取多張</p>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {uploadError}
        </div>
      )}

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="card py-16 text-center">
          <Upload size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">尚無照片，請上傳</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              共 {photos.length} 張照片，拖曳可調整順序
            </p>
            {reorderSaving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" />
                排序儲存中...
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(photo.id)}
                onDragOver={(e) => handleDragOver(e, photo.id)}
                onDrop={() => handleDrop(photo.id)}
                onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}
                className={`group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing border-2 transition-opacity ${
                  draggedId === photo.id ? 'opacity-40' : ''
                } ${dragOverId === photo.id ? 'border-primary-500' : 'border-transparent'}`}
              >
                <Image
                  src={photo.thumbnail ?? photo.url}
                  alt={photo.captionZh ?? ''}
                  fill
                  className="object-cover pointer-events-none"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* 拖曳握把 + 順序編號 */}
                <div className="absolute left-1.5 top-1.5 bg-black/50 rounded p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={14} />
                </div>
                <div className="absolute right-1.5 top-1.5 bg-black/50 rounded px-1.5 py-0.5 text-xs text-white font-medium">
                  {i + 1}
                </div>

                {/* Overlay on hover：刪除 + 鍵盤方向按鈕 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                    aria-label="刪除照片"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveByKeyboard(photo.id, -1)}
                      disabled={i === 0}
                      aria-label="往前移動"
                      className="rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-700 disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveByKeyboard(photo.id, 1)}
                      disabled={i === photos.length - 1}
                      aria-label="往後移動"
                      className="rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-gray-700 disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
