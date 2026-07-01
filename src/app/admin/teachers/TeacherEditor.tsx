'use client'

// src/app/admin/teachers/TeacherEditor.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const TEACHER_TYPES = ['FULL_TIME', 'PART_TIME', 'STAFF'] as const
const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: '專任教師',
  PART_TIME: '兼任教師',
  STAFF:     '行政人員',
}

const schema = z.object({
  nameZh:    z.string().min(1, '請填寫中文姓名'),
  nameEn:    z.string().min(1, 'Please enter English name'),
  titleZh:   z.string().min(1, '請填寫職稱（中文）'),
  titleEn:   z.string().min(1, 'Please enter title (English)'),
  bioZh:     z.string().optional(),
  bioEn:     z.string().optional(),
  avatar:    z.string().url('請輸入有效的圖片網址').optional().or(z.literal('')),
  type:      z.enum(TEACHER_TYPES),
  email:     z.string().email('請輸入有效的 Email').optional().or(z.literal('')),
  sortOrder: z.coerce.number().default(0),
  isActive:  z.boolean(),
})
type FormData = z.infer<typeof schema>

interface TeacherEditorProps {
  initialData?: Partial<FormData> & { id?: string; subjects?: string[] }
  mode: 'create' | 'edit'
}

export default function TeacherEditor({ initialData, mode }: TeacherEditorProps) {
  const router = useRouter()
  const [error, setError]       = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh')
  const [subjects, setSubjects]  = useState<string[]>(initialData?.subjects ?? [])
  const [subjectInput, setSubjectInput] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        nameZh: '', nameEn: '', titleZh: '', titleEn: '',
        bioZh: '', bioEn: '', avatar: '', type: 'FULL_TIME',
        email: '', sortOrder: 0, isActive: true,
        ...initialData,
      },
    })

  const avatar   = watch('avatar')
  const isActive = watch('isActive')

  const addSubject = () => {
    const s = subjectInput.trim()
    if (s && !subjects.includes(s)) {
      setSubjects((prev) => [...prev, s])
    }
    setSubjectInput('')
  }

  const removeSubject = (s: string) =>
    setSubjects((prev) => prev.filter((x) => x !== s))

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      const url    = mode === 'create' ? '/api/teachers' : `/api/teachers/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          avatar:  data.avatar  === '' ? undefined : data.avatar,
          email:   data.email   === '' ? undefined : data.email,
          subjects,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '操作失敗')
      router.push('/admin/teachers')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '未知錯誤')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/teachers" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? '新增師資' : '編輯師資'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名（中文）<span className="text-red-500">*</span>
                  </label>
                  <input {...register('nameZh')} className="input" placeholder="王小明" />
                  {errors.nameZh && <p className="text-red-500 text-xs mt-1">{errors.nameZh.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    職稱（中文）<span className="text-red-500">*</span>
                  </label>
                  <input {...register('titleZh')} className="input" placeholder="英文教師" />
                  {errors.titleZh && <p className="text-red-500 text-xs mt-1">{errors.titleZh.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">個人簡介（中文）</label>
                <textarea {...register('bioZh')} rows={4} className="input resize-none"
                  placeholder="選填，簡短介紹教師背景與專長" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English)<span className="text-red-500">*</span>
                  </label>
                  <input {...register('nameEn')} className="input" placeholder="Ming Wang" />
                  {errors.nameEn && <p className="text-red-500 text-xs mt-1">{errors.nameEn.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (English)<span className="text-red-500">*</span>
                  </label>
                  <input {...register('titleEn')} className="input" placeholder="English Teacher" />
                  {errors.titleEn && <p className="text-red-500 text-xs mt-1">{errors.titleEn.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio (English)</label>
                <textarea {...register('bioEn')} rows={4} className="input resize-none"
                  placeholder="Optional short biography" />
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">基本設定</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                類型<span className="text-red-500">*</span>
              </label>
              <select {...register('type')} className="input">
                {TEACHER_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="teacher@school.edu.tw" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序（數字越小越前）</label>
              <input {...register('sortOrder')} type="number" className="input" min={0} />
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">大頭照網址</label>
            <input {...register('avatar')} className="input" placeholder="https://..." />
            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar.message}</p>}
            {avatar && (
              <div className="mt-2">
                <Image
                  src={avatar}
                  alt="大頭照預覽"
                  width={64}
                  height={64}
                  className="rounded-full object-cover border-2 border-gray-100"
                />
              </div>
            )}
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">授課科目</label>
            <div className="flex gap-2">
              <input
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject() } }}
                className="input flex-1"
                placeholder="輸入科目名稱，按 Enter 新增"
              />
              <button type="button" onClick={addSubject} className="btn-secondary px-3">
                <Plus size={16} />
              </button>
            </div>
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700
                    text-xs px-2.5 py-1 rounded-full font-medium">
                    {s}
                    <button type="button" onClick={() => removeSubject(s)} aria-label={`移除 ${s}`}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* isActive toggle */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              role="switch"
              aria-checked={isActive}
              onClick={() => setValue('isActive', !isActive)}
              className={cn(
                'relative w-10 h-6 rounded-full transition-colors',
                isActive ? 'bg-primary-600' : 'bg-gray-300'
              )}
            >
              <span className={cn(
                'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                isActive ? 'translate-x-4' : 'translate-x-0'
              )} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {isActive ? '顯示中' : '已隱藏'}
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary gap-2">
            <Save size={16} />
            {isSubmitting ? '儲存中…' : '儲存'}
          </button>
          <Link href="/admin/teachers" className="btn-secondary">取消</Link>
        </div>
      </form>
    </div>
  )
}
