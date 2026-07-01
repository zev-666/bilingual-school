'use client'

// src/app/admin/media/MediaLibrary.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  Search, Upload, Trash2, Copy, Check, FileText,
  ImageIcon, Grid3X3, List, X, ChevronLeft, ChevronRight,
  Loader2, HardDrive,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MediaItem {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  createdAt: string
}

interface Meta {
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number) {
  if (bytes < 1024)            return `${bytes} B`
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function isImage(mimeType: string) {
  return mimeType.startsWith('image/')
}

function fileIcon(mimeType: string) {
  if (isImage(mimeType)) return <ImageIcon size={28} className="text-primary-400" />
  return <FileText size={28} className="text-gray-400" />
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'p-1.5 rounded-lg transition-colors text-xs font-medium flex items-center gap-1',
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-white/90 text-gray-600 hover:text-primary-600 hover:bg-white'
      )}
      aria-label="複製網址"
    >
      {copied ? <><Check size={12} />已複製</> : <><Copy size={12} />複製</>}
    </button>
  )
}

function MediaCard({
  item,
  selected,
  onSelect,
  onPreview,
  viewMode,
}: {
  item: MediaItem
  selected: boolean
  onSelect: (id: string) => void
  onPreview: (item: MediaItem) => void
  viewMode: 'grid' | 'list'
}) {
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all',
          selected
            ? 'border-primary-400 bg-primary-50'
            : 'border-transparent hover:bg-gray-50'
        )}
        onClick={() => onSelect(item.id)}
      >
        {/* Checkbox */}
        <div className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
          selected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
        )}>
          {selected && <Check size={12} className="text-white" />}
        </div>

        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
          {isImage(item.mimeType) ? (
            <Image src={item.url} alt={item.filename} width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <FileText size={18} className="text-gray-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{item.filename}</p>
          <p className="text-xs text-gray-400">{formatSize(item.size)} · {item.mimeType}</p>
        </div>

        {/* URL */}
        <p className="text-xs text-gray-400 truncate max-w-[200px] hidden md:block">{item.url}</p>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <CopyButton url={item.url} />
          {isImage(item.mimeType) && (
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(item) }}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors text-xs"
            >
              預覽
            </button>
          )}
        </div>
      </div>
    )
  }

  // Grid mode
  return (
    <div
      className={cn(
        'group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all',
        selected
          ? 'border-primary-500 shadow-md shadow-primary-100'
          : 'border-transparent hover:border-gray-200'
      )}
      onClick={() => onSelect(item.id)}
    >
      {/* Media preview */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {isImage(item.mimeType) ? (
          <Image
            src={item.url}
            alt={item.filename}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            {fileIcon(item.mimeType)}
            <p className="text-xs text-gray-500 font-medium uppercase">
              {item.mimeType.split('/')[1]?.split('.').pop() ?? 'file'}
            </p>
          </div>
        )}
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
        <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
          <CopyButton url={item.url} />
        </div>
        {isImage(item.mimeType) && (
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(item) }}
            className="text-xs text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
          >
            放大預覽
          </button>
        )}
      </div>

      {/* Selected indicator */}
      <div className={cn(
        'absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
        selected
          ? 'border-primary-500 bg-primary-500'
          : 'border-white/70 bg-black/20 opacity-0 group-hover:opacity-100'
      )}>
        {selected && <Check size={11} className="text-white" />}
      </div>

      {/* Info strip */}
      <div className="p-2 bg-white">
        <p className="text-xs font-medium text-gray-700 truncate">{item.filename}</p>
        <p className="text-xs text-gray-400">{formatSize(item.size)}</p>
      </div>
    </div>
  )
}

// ─── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="font-medium text-gray-800 truncate">{item.filename}</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Image */}
        <div className="relative bg-gray-50 flex items-center justify-center" style={{ minHeight: 320 }}>
          <Image
            src={item.url}
            alt={item.filename}
            width={800}
            height={600}
            className="max-h-[60vh] w-auto object-contain"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 space-x-3">
            <span>{formatSize(item.size)}</span>
            <span>{item.mimeType}</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 max-w-xs truncate block">
              {item.url}
            </code>
            <CopyButton url={item.url} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MediaLibrary() {
  const [items, setItems]         = useState<MediaItem[]>([])
  const [meta, setMeta]           = useState<Meta | null>(null)
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document'>('all')
  const [page, setPage]           = useState(1)
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid')
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [preview, setPreview]     = useState<MediaItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch media
  const fetchMedia = useCallback(async (p = page, s = search, t = typeFilter) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page:    String(p),
        perPage: '40',
        search:  s,
        type:    t,
      })
      const res  = await fetch(`/api/media?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '載入失敗')
      setItems(json.data.data)
      setMeta(json.data.meta)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter])

  useEffect(() => { fetchMedia(page, search, typeFilter) }, [page, typeFilter])

  // Debounced search
  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchMedia(1, val, typeFilter), 400)
  }

  // Select / deselect
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  // Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        if (!res.ok) throw new Error(`上傳失敗：${file.name}`)
      }
      setPage(1)
      await fetchMedia(1, search, typeFilter)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '上傳失敗')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Delete selected
  const handleDelete = async () => {
    if (!confirm(`確定要刪除選取的 ${selected.size} 個檔案嗎？此操作無法復原。`)) return
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (!res.ok) throw new Error('刪除失敗')
      setSelected(new Set())
      await fetchMedia(1, search, typeFilter)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '刪除失敗')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">媒體庫</h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary gap-2 text-sm"
          >
            {uploading
              ? <><Loader2 size={15} className="animate-spin" />上傳中…</>
              : <><Upload size={15} />上傳檔案</>
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜尋檔案名稱…"
            className="input pl-9 py-2 text-sm"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {(['all', 'image', 'document'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                typeFilter === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {{ all: '全部', image: '圖片', document: '文件' }[t]}
            </button>
          ))}
        </div>

        {/* View mode */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={cn('p-1.5 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn('p-1.5 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <List size={15} />
          </button>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500">已選 {selected.size} 個</span>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl
                bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
            >
              {deleteLoading
                ? <Loader2 size={14} className="animate-spin" />
                : <Trash2 size={14} />
              }
              刪除
            </button>
          </div>
        )}
      </div>

      {/* Select all / count */}
      {!loading && items.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <button
            onClick={selectAll}
            className="hover:text-primary-600 transition-colors"
          >
            {selected.size === items.length ? '取消全選' : '全選本頁'}
          </button>
          <span>·</span>
          <span className="flex items-center gap-1">
            <HardDrive size={13} />
            共 {meta?.total ?? 0} 個檔案
          </span>
        </div>
      )}

      {/* Media grid / list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-primary-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <ImageIcon size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm">
            {search ? '找不到符合的檔案' : '媒體庫是空的，點選右上角上傳'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              onSelect={toggleSelect}
              onPreview={setPreview}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="card p-2 space-y-1">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              onSelect={toggleSelect}
              onPreview={setPreview}
              viewMode="list"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>

          {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === meta.totalPages)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`dot-${i}`} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                    page === p
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {p}
                </button>
              )
            )
          }

          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <PreviewModal item={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}
