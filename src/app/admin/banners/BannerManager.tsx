'use client'

// src/app/admin/banners/BannerManager.tsx
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Reorder } from 'framer-motion'
import {
  Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, X, Upload, Loader2, ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Banner {
  id: string
  titleZh: string
  titleEn: string
  subtitleZh: string | null
  subtitleEn: string | null
  imageUrl: string
  linkUrl: string | null
  linkTextZh: string | null
  linkTextEn: string | null
  isActive: boolean
  sortOrder: number
}

type FormState = {
  titleZh: string
  titleEn: string
  subtitleZh: string
  subtitleEn: string
  imageUrl: string
  linkUrl: string
  linkTextZh: string
  linkTextEn: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  titleZh: '', titleEn: '', subtitleZh: '', subtitleEn: '',
  imageUrl: '', linkUrl: '', linkTextZh: '', linkTextEn: '', isActive: true,
}

export default function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(
    [...initialBanners].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function openCreateModal() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
    setModalOpen(true)
  }

  function openEditModal(banner: Banner) {
    setEditingId(banner.id)
    setForm({
      titleZh: banner.titleZh,
      titleEn: banner.titleEn,
      subtitleZh: banner.subtitleZh || '',
      subtitleEn: banner.subtitleEn || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      linkTextZh: banner.linkTextZh || '',
      linkTextEn: banner.linkTextEn || '',
      isActive: banner.isActive,
    })
    setError(null)
    setModalOpen(true)
  }

  async function handleImageUpload(file: File) {
    setIsUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.success) {
        setForm((prev) => ({ ...prev, imageUrl: json.data.url }))
      } else {
        setError(json.error || '圖片上傳失敗')
      }
    } catch {
      setError('圖片上傳失敗，請檢查網路連線')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit() {
    if (!form.titleZh || !form.titleEn || !form.imageUrl) {
      setError('中文標題、英文標題、輪播圖片為必填')
      return
    }
    setIsSaving(true)
    setError(null)

    try {
      const url = editingId ? `/api/banners/${editingId}` : '/api/banners'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.success) {
        setModalOpen(false)
        if (editingId) {
          setBanners((prev) => prev.map((b) => (b.id === editingId ? json.data : b)))
        } else {
          setBanners((prev) => [...prev, json.data])
        }
      } else {
        setError(json.error || '儲存失敗')
      }
    } catch {
      setError('儲存失敗，請稍後再試')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleActive(banner: Banner) {
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b)))
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      })
      const json = await res.json()
      if (!json.success) {
        setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b)))
      }
    } catch {
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, isActive: banner.isActive } : b)))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/banners/${deleteTarget.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id))
        setDeleteTarget(null)
      } else {
        setError(json.error || '刪除失敗')
      }
    } catch {
      setError('刪除失敗，請稍後再試')
    }
  }

  async function handleReorder(newOrder: Banner[]) {
    setBanners(newOrder)
    try {
      await fetch('/api/banners/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newOrder.map((b) => b.id) }),
      })
    } catch {
      // 排序失敗不特別處理，使用者可重新整理頁面重試
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">共 {banners.length} 張輪播圖，拖曳左側握把可調整順序</p>
        <button onClick={openCreateModal} className="btn-primary text-sm gap-1.5">
          <Plus size={16} />
          新增輪播圖
        </button>
      </div>

      {error && !modalOpen && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {banners.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
          <ImageIcon size={40} className="mb-3" />
          <p className="text-sm">目前沒有輪播圖，點右上角「新增輪播圖」開始建立</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={banners} onReorder={handleReorder} className="space-y-3">
          {banners.map((banner) => (
            <Reorder.Item
              key={banner.id}
              value={banner}
              className="card flex items-center gap-4 p-4 cursor-grab active:cursor-grabbing bg-white"
            >
              <GripVertical size={20} className="text-gray-300 shrink-0" />

              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {banner.imageUrl ? (
                  <Image src={banner.imageUrl} alt={banner.titleZh} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-gray-900">{banner.titleZh}</p>
                  <span className={cn(
                    'shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
                    banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  )}>
                    {banner.isActive ? '啟用中' : '已停用'}
                  </span>
                </div>
                <p className="truncate text-sm text-gray-500">{banner.titleEn}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => handleToggleActive(banner)} title={banner.isActive ? '停用' : '啟用'}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                  {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEditModal(banner)} title="編輯" className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setDeleteTarget(banner)} title="刪除" className="rounded-md p-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* 新增 / 編輯 Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? '編輯輪播圖' : '新增輪播圖'}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  輪播圖片 <span className="text-red-500">*</span>
                </label>
                <div onClick={() => fileInputRef.current?.click()}
                  className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary-400">
                  {isUploading ? (
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  ) : form.imageUrl ? (
                    <Image src={form.imageUrl} alt="預覽" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Upload size={24} className="mb-1" />
                      <span className="text-sm">點擊上傳圖片（建議 1920x800）</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file) }} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">中文標題 <span className="text-red-500">*</span></label>
                  <input className="input" value={form.titleZh} onChange={(e) => setForm({ ...form, titleZh: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">英文標題 <span className="text-red-500">*</span></label>
                  <input className="input" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">中文副標題</label>
                  <input className="input" value={form.subtitleZh} onChange={(e) => setForm({ ...form, subtitleZh: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">英文副標題</label>
                  <input className="input" value={form.subtitleEn} onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">按鈕文字（中）</label>
                  <input className="input" value={form.linkTextZh} onChange={(e) => setForm({ ...form, linkTextZh: e.target.value })} placeholder="了解更多" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">按鈕文字（英）</label>
                  <input className="input" value={form.linkTextEn} onChange={(e) => setForm({ ...form, linkTextEn: e.target.value })} placeholder="Learn More" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">點擊連結（選填）</label>
                <input className="input" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/admission 或 https://..." />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                立即啟用（前台首頁顯示）
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={handleSubmit} disabled={isSaving || isUploading} className="btn-primary text-sm gap-1.5 disabled:opacity-50">
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {editingId ? '儲存變更' : '建立輪播圖'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-gray-900">確定要刪除嗎？</h3>
            <p className="mb-6 text-sm text-gray-500">即將刪除「{deleteTarget.titleZh}」，此動作無法復原。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">確定刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
