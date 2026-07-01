'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, FileText, X, Loader2 } from 'lucide-react'

const CATEGORIES = [
  { value: 'FORM', labelZh: '表單', labelEn: 'Form' },
  { value: 'REGULATION', labelZh: '法規', labelEn: 'Regulation' },
  { value: 'BROCHURE', labelZh: '簡章', labelEn: 'Brochure' },
  { value: 'REPORT', labelZh: '報告', labelEn: 'Report' },
  { value: 'OTHER', labelZh: '其他', labelEn: 'Other' },
]

const schema = z.object({
  titleZh: z.string().min(1, '請輸入中文標題'),
  titleEn: z.string().min(1, 'Please enter English title'),
  category: z.enum(['FORM', 'REGULATION', 'BROCHURE', 'REPORT', 'OTHER']),
  isPublished: z.boolean(),
  fileUrl: z.string().min(1, '請上傳文件'),
  fileSize: z.number().min(0),
})

type FormData = z.infer<typeof schema>

interface DocumentData {
  id?: string
  titleZh?: string
  titleEn?: string
  category?: string
  isPublished?: boolean
  fileUrl?: string
  fileSize?: number
}

interface Props {
  initialData?: DocumentData
  mode: 'create' | 'edit'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentEditor({ initialData, mode }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'zh' | 'en'>('zh')
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleZh: initialData?.titleZh ?? '',
      titleEn: initialData?.titleEn ?? '',
      category: (initialData?.category as FormData['category']) ?? 'FORM',
      isPublished: initialData?.isPublished ?? true,
      fileUrl: initialData?.fileUrl ?? '',
      fileSize: initialData?.fileSize ?? 0,
    },
  })

  const fileUrl = watch('fileUrl')
  const fileSize = watch('fileSize')

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'documents')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('上傳失敗')
      const data = await res.json()

      setValue('fileUrl', data.data.url, { shouldValidate: true })
      setValue('fileSize', file.size, { shouldValidate: true })
      setUploadedFileName(file.name)
    } catch (err) {
      alert(err instanceof Error ? err.message : '上傳失敗')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: FormData) {
    try {
      const url = mode === 'create' ? '/api/documents' : `/api/documents/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '儲存失敗')
      }

      router.push('/admin/documents')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : '儲存失敗')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category & Published */}
      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">基本設定</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">文件類別</label>
            <select {...register('category')} className="input">
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.labelZh} / {cat.labelEn}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
              <input type="checkbox" {...register('isPublished')} className="h-4 w-4 rounded text-primary-600" />
              <div>
                <span className="text-sm font-medium text-gray-700">立即發布</span>
                <p className="text-xs text-gray-400">勾選後即可在前台下載</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Bilingual Titles */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(['zh', 'en'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveTab(lang)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === lang
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {lang === 'zh' ? '🇹🇼 中文' : '🇺🇸 English'}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'zh' ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                中文標題 <span className="text-red-500">*</span>
              </label>
              <input {...register('titleZh')} className="input" placeholder="例：113學年度招生簡章" />
              {errors.titleZh && <p className="mt-1 text-xs text-red-500">{errors.titleZh.message}</p>}
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                English Title <span className="text-red-500">*</span>
              </label>
              <input {...register('titleEn')} className="input" placeholder="e.g. Admission Brochure 2024" />
              {errors.titleEn && <p className="mt-1 text-xs text-red-500">{errors.titleEn.message}</p>}
            </div>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">文件檔案</h2>

        {fileUrl ? (
          <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
              <FileText className="h-6 w-6 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">
                {uploadedFileName || fileUrl.split('/').pop()}
              </p>
              {fileSize > 0 && (
                <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setValue('fileUrl', '')
                setValue('fileSize', 0)
                setUploadedFileName('')
              }}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-primary-400 hover:bg-primary-50">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            <span className="mt-3 text-sm font-medium text-gray-600">
              {uploading ? '上傳中...' : '點擊上傳 PDF 或其他文件'}
            </span>
            <span className="mt-1 text-xs text-gray-400">支援 PDF、Word、Excel，最大 20MB</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        )}
        {errors.fileUrl && <p className="mt-2 text-xs text-red-500">{errors.fileUrl.message}</p>}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="btn-primary disabled:opacity-50"
        >
          {isSubmitting ? '儲存中...' : mode === 'create' ? '新增文件' : '儲存變更'}
        </button>
      </div>
    </form>
  )
}
