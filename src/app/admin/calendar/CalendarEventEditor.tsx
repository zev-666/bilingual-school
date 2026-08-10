'use client'

// src/app/admin/calendar/CalendarEventEditor.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const EVENT_TYPES = ['HOLIDAY', 'MEETING', 'WORKSHOP', 'DEADLINE', 'ACTIVITY', 'OTHER'] as const
const TYPE_LABELS: Record<string, string> = {
  HOLIDAY:  '假期',
  MEETING:  '會議',
  WORKSHOP: '研習活動',
  DEADLINE: '截止日期',
  ACTIVITY: '活動',
  OTHER:    '其他',
}

const schema = z.object({
  titleZh:     z.string().min(1, '請填寫標題（中文）'),
  titleEn:     z.string().min(1, 'Please enter title (English)'),
  descZh:      z.string().optional(),
  descEn:      z.string().optional(),
  startDate:   z.string().min(1, '請選擇開始日期'),
  endDate:     z.string().optional(),
  type:        z.enum(EVENT_TYPES),
  isPublished: z.boolean(),
})
type FormData = z.infer<typeof schema>

interface CalendarEventEditorProps {
  initialData?: Partial<FormData> & { id?: string }
  mode: 'create' | 'edit'
}

export default function CalendarEventEditor({ initialData, mode }: CalendarEventEditorProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        titleZh: '', titleEn: '', descZh: '', descEn: '',
        startDate: '', endDate: '', type: 'OTHER', isPublished: true,
        ...initialData,
      },
    })

  const isPublished = watch('isPublished')

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const url    = mode === 'create' ? '/api/calendar-events' : `/api/calendar-events/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          endDate: data.endDate === '' ? undefined : data.endDate,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '操作失敗')
      router.push('/admin/calendar')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '未知錯誤')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/calendar" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? '新增行程' : '編輯行程'}
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
                  標題（中文）<span className="text-red-500">*</span>
                </label>
                <input {...register('titleZh')} className="input" placeholder="例：期中考試週" />
                {errors.titleZh && <p className="text-red-500 text-xs mt-1">{errors.titleZh.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">說明（中文）</label>
                <textarea {...register('descZh')} rows={3} className="input resize-none"
                  placeholder="選填，補充說明" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (English)<span className="text-red-500">*</span>
                </label>
                <input {...register('titleEn')} className="input" placeholder="e.g. Midterm Exam Week" />
                {errors.titleEn && <p className="text-red-500 text-xs mt-1">{errors.titleEn.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                <textarea {...register('descEn')} rows={3} className="input resize-none"
                  placeholder="Optional additional details" />
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">日期與設定</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日期<span className="text-red-500">*</span>
              </label>
              <input {...register('startDate')} type="date" className="input" />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">結束日期（選填）</label>
              <input {...register('endDate')} type="date" className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                類型<span className="text-red-500">*</span>
              </label>
              <select {...register('type')} className="input">
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* isPublished toggle */}
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
            <span className="text-sm font-medium text-gray-700">
              {isPublished ? '已發布' : '草稿（前台不顯示）'}
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary gap-2">
            <Save size={16} />
            {isSubmitting ? '儲存中…' : '儲存'}
          </button>
          <Link href="/admin/calendar" className="btn-secondary">取消</Link>
        </div>
      </form>
    </div>
  )
}
