'use client'

// src/app/admin/albums/AlbumEditor.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Eye, EyeOff, ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const schema = z.object({
  titleZh:    z.string().min(1, '請填寫中文標題'),
  titleEn:    z.string().min(1, 'Please enter English title'),
  descZh:     z.string().optional(),
  descEn:     z.string().optional(),
  coverImage: z.string().url('請輸入有效的圖片網址').optional().or(z.literal('')),
  eventDate:  z.string().optional(),
  isPublished:z.boolean(),
})
type FormData = z.infer<typeof schema>

interface AlbumEditorProps {
  initialData?: Partial<FormData> & { id?: string }
  mode: 'create' | 'edit'
}

export default function AlbumEditor({ initialData, mode }: AlbumEditorProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        titleZh: '', titleEn: '', descZh: '', descEn: '',
        coverImage: '', eventDate: '', isPublished: false,
        ...initialData,
      },
    })

  const isPublished = watch('isPublished')
  const coverImage  = watch('coverImage')

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const url    = mode === 'create' ? '/api/albums' : `/api/albums/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const payload = {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : undefined,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '操作失敗')
      router.push('/admin/albums')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '未知錯誤')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/albums" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? '新增相簿' : '編輯相簿'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Language tabs */}
        <div className="card p-6 space-y-5">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {(['zh', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveTab(lang)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === lang
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {lang === 'zh' ? '繁體中文' : 'English'}
              </button>
            ))}
          </div>

          {activeTab === 'zh' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  相簿名稱（中文）<span className="text-red-500">*</span>
                </label>
                <input {...register('titleZh')} className="input" placeholder="例：112學年度校慶活動" />
                {errors.titleZh && <p className="text-red-500 text-xs mt-1">{errors.titleZh.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">相簿描述（中文）</label>
                <textarea {...register('descZh')} rows={3} className="input resize-none"
                  placeholder="選填，簡短說明本相簿內容" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Album Name (English)<span className="text-red-500">*</span>
                </label>
                <input {...register('titleEn')} className="input" placeholder="e.g. School Anniversary 2023" />
                {errors.titleEn && <p className="text-red-500 text-xs mt-1">{errors.titleEn.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                <textarea {...register('descEn')} rows={3} className="input resize-none"
                  placeholder="Optional short description" />
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">相簿設定</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1.5"><Calendar size={14} />活動日期</span>
              </label>
              <input {...register('eventDate')} type="date" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">封面圖片網址</label>
              <input {...register('coverImage')} className="input" placeholder="https://..." />
              {errors.coverImage && (
                <p className="text-red-500 text-xs mt-1">{errors.coverImage.message}</p>
              )}
            </div>
          </div>

          {/* Cover preview */}
          {coverImage && (
            <div className="relative aspect-video w-full max-w-xs rounded-xl overflow-hidden bg-gray-100">
              <img src={coverImage} alt="封面預覽" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Publish toggle */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              role="switch"
              aria-checked={isPublished}
              onClick={() => setValue('isPublished', !isPublished)}
              className={cn(
                'relative w-10 h-6 rounded-full transition-colors',
                isPublished ? 'bg-primary-600' : 'bg-gray-300'
              )}
            >
              <span className={cn(
                'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                isPublished ? 'translate-x-4' : 'translate-x-0'
              )} />
            </div>
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              {isPublished
                ? <><Eye size={14} className="text-green-600" />已發布</>
                : <><EyeOff size={14} className="text-gray-400" />草稿</>
              }
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary gap-2"
          >
            <Save size={16} />
            {isSubmitting ? '儲存中…' : '儲存'}
          </button>
          <Link href="/admin/albums" className="btn-secondary">取消</Link>
        </div>
      </form>
    </div>
  )
}
