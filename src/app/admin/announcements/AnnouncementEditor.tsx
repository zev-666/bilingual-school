'use client'

// src/app/admin/announcements/AnnouncementEditor.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CATEGORIES = ['ANNOUNCEMENT','ACTIVITY','ADMISSION','COMPETITION','NEWS'] as const
const CATEGORY_LABELS: Record<string, string> = {
  ANNOUNCEMENT: '公告', ACTIVITY: '活動', ADMISSION: '招生',
  COMPETITION: '競賽', NEWS: '新聞',
}

const schema = z.object({
  titleZh:    z.string().min(1, '請填寫中文標題'),
  titleEn:    z.string().min(1, 'Please enter English title'),
  summaryZh:  z.string().optional(),
  summaryEn:  z.string().optional(),
  contentZh:  z.string().min(1, '請填寫中文內容'),
  contentEn:  z.string().min(1, 'Please enter English content'),
  category:   z.enum(CATEGORIES),
  coverImage: z.string().url().optional().or(z.literal('')),
  isPinned:   z.boolean(),
  isPublished:z.boolean(),
})
type FormData = z.infer<typeof schema>

interface AnnouncementEditorProps {
  initialData?: Partial<FormData> & { id?: string; slug?: string }
  mode: 'create' | 'edit'
}

export default function AnnouncementEditor({ initialData, mode }: AnnouncementEditorProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleZh: '', titleEn: '', summaryZh: '', summaryEn: '',
      contentZh: '', contentEn: '', category: 'ANNOUNCEMENT',
      coverImage: '', isPinned: false, isPublished: false,
      ...initialData,
    },
  })

  const isPublished = watch('isPublished')

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const url  = mode === 'create' ? '/api/announcements' : `/api/announcements/${initialData?.slug}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, coverImage: data.coverImage || undefined }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? '儲存失敗')
      }
      router.push('/admin/announcements')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const TabBtn = ({ tab, label }: { tab: 'zh' | 'en'; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
        activeTab === tab
          ? 'bg-white text-primary-600 border-b-2 border-primary-600'
          : 'text-gray-500 hover:text-gray-700'
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/announcements" className="btn-ghost p-2 -ml-2">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">
          {mode === 'create' ? '新增公告' : '編輯公告'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language tabs */}
            <div className="card overflow-hidden">
              <div className="bg-gray-50 px-4 flex gap-1 border-b border-gray-100">
                <TabBtn tab="zh" label="中文" />
                <TabBtn tab="en" label="English" />
              </div>

              <div className="p-5 space-y-4">
                {activeTab === 'zh' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        中文標題 <span className="text-red-500">*</span>
                      </label>
                      <input type="text" {...register('titleZh')} className={cn('input', errors.titleZh && 'border-red-300')} />
                      {errors.titleZh && <p className="mt-1 text-xs text-red-600">{errors.titleZh.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">中文摘要</label>
                      <textarea rows={2} {...register('summaryZh')} className="input resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        中文內容 <span className="text-red-500">*</span>
                        <span className="ml-2 font-normal text-gray-400 text-xs">(支援 Markdown)</span>
                      </label>
                      <textarea rows={12} {...register('contentZh')} className={cn('input resize-y font-mono text-sm', errors.contentZh && 'border-red-300')} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        English Title <span className="text-red-500">*</span>
                      </label>
                      <input type="text" {...register('titleEn')} className={cn('input', errors.titleEn && 'border-red-300')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">English Summary</label>
                      <textarea rows={2} {...register('summaryEn')} className="input resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        English Content <span className="text-red-500">*</span>
                        <span className="ml-2 font-normal text-gray-400 text-xs">(Markdown supported)</span>
                      </label>
                      <textarea rows={12} {...register('contentEn')} className={cn('input resize-y font-mono text-sm', errors.contentEn && 'border-red-300')} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">發布設定</h3>
              <div className="flex items-center justify-between">
                <label htmlFor="isPublished" className="text-sm text-gray-700">發布狀態</label>
                <button
                  type="button"
                  onClick={() => setValue('isPublished', !isPublished)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    isPublished ? 'bg-primary-600' : 'bg-gray-200'
                  )}
                  role="switch"
                  aria-checked={isPublished}
                  id="isPublished"
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    isPublished ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPinned" {...register('isPinned')} className="rounded" />
                <label htmlFor="isPinned" className="text-sm text-gray-700">置頂顯示</label>
              </div>
            </div>

            {/* Category */}
            <div className="card p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">分類</label>
              <select {...register('category')} className="input text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            {/* Cover image */}
            <div className="card p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">封面圖片 URL</label>
              <input type="url" {...register('coverImage')} placeholder="https://..." className="input text-sm" />
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full gap-2">
              <Save size={16} />
              {isSubmitting ? '儲存中...' : '儲存'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
