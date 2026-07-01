'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AnnouncementData {
  slug?: string
  titleZh: string; titleEn: string
  contentZh: string; contentEn: string
  category: string; isPinned: boolean; isPublished: boolean
}

const CATEGORIES = [
  { value: 'NEWS', label: '新聞' },
  { value: 'EVENT', label: '活動' },
  { value: 'ADMISSION', label: '招生' },
  { value: 'ACADEMIC', label: '學術' },
  { value: 'OTHER', label: '其他' },
]

export default function AnnouncementEditor({ initialData }: { initialData?: AnnouncementData }) {
  const router = useRouter()
  const isEdit = !!initialData?.slug
  const [tab, setTab] = useState<'zh' | 'en'>('zh')
  const [form, setForm] = useState<AnnouncementData>(initialData || {
    titleZh: '', titleEn: '', contentZh: '', contentEn: '',
    category: 'NEWS', isPinned: false, isPublished: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const url = isEdit ? `/api/announcements/${initialData!.slug}` : '/api/announcements'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { router.push('/admin/announcements'); router.refresh() }
      else { const data = await res.json(); setError(data.error || '儲存失敗') }
    } catch { setError('網路錯誤') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

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
              <label className="label">內容（中文）</label>
              <textarea value={form.contentZh} onChange={e => setForm({ ...form, contentZh: e.target.value })} rows={8} className="input resize-none" required />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Title (English)</label>
              <input value={form.titleEn} onChange={e => setForm({ ...form, titleEn: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Content (English)</label>
              <textarea value={form.contentEn} onChange={e => setForm({ ...form, contentEn: e.target.value })} rows={8} className="input resize-none" required />
            </div>
          </div>
        )}
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">分類</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} className="rounded" />
            置頂公告
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
            立即發布
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '儲存中...' : isEdit ? '更新公告' : '建立公告'}
        </button>
        <button type="button" onClick={() => router.push('/admin/announcements')} className="btn-ghost">
          取消
        </button>
      </div>
    </form>
  )
}
