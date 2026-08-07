'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface VideoData {
  id?: string
  titleZh: string; titleEn: string
  descZh?: string; descEn?: string
  videoUrl: string
  source: string
  isPublished: boolean
}

interface VideoEditorProps {
  mode?: 'create' | 'edit'
  initialData?: VideoData
}

export default function VideoEditor({ mode = 'create', initialData }: VideoEditorProps) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const [tab, setTab] = useState<'zh' | 'en'>('zh')
  const [form, setForm] = useState<VideoData>(initialData || {
    titleZh: '', titleEn: '', descZh: '', descEn: '',
    videoUrl: '', source: 'YOUTUBE', isPublished: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const url = isEdit ? `/api/videos/${initialData?.id}` : '/api/videos'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { router.push('/admin/videos'); router.refresh() }
      else { const data = await res.json(); setError(data.error || '儲存失敗') }
    } catch { setError('網路錯誤') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">YouTube 影片網址</label>
          <input
            value={form.videoUrl}
            onChange={e => setForm({ ...form, videoUrl: e.target.value })}
            className="input"
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          <p className="text-xs text-gray-400 mt-1">貼上完整的 YouTube 網址即可，系統會自動抓縮圖，不用另外上傳檔案。</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex gap-2 mb-4 border-b border-gray-100">
          <button type="button" onClick={() => setTab('zh')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'zh' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>
            中文
          </button>
          <button type="button" onClick={() => setTab('en')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === 'en' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>
            English
          </button>
        </div>

        {tab === 'zh' ? (
          <div className="space-y-4">
            <div>
              <label className="label">標題（中文）</label>
              <input value={form.titleZh} onChange={e => setForm({ ...form, titleZh: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">說明（中文）</label>
              <textarea value={form.descZh ?? ''} onChange={e => setForm({ ...form, descZh: e.target.value })} rows={3} className="input resize-none" placeholder="選填" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Title (English)</label>
              <input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Description (English)</label>
              <textarea value={form.descEn ?? ''} onChange={e => setForm({ ...form, descEn: e.target.value })} rows={3} className="input resize-none" placeholder="Optional" />
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
          立即發布
        </label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '儲存中...' : isEdit ? '更新影片' : '新增影片'}
        </button>
        <button type="button" onClick={() => router.push('/admin/videos')} className="btn-ghost">
          取消
        </button>
      </div>
    </form>
  )
}
