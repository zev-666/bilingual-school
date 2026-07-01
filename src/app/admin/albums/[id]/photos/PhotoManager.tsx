'use client'

// src/app/admin/albums/[id]/photos/PhotoManager.tsx
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Trash2, ImagePlus, Loader2 } from 'lucide-react'

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
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          <p className="text-sm text-gray-500">共 {photos.length} 張照片</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={photo.thumbnail ?? photo.url}
                  alt={photo.captionZh ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                    aria-label="刪除照片"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
