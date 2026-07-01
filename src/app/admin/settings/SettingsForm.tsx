'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Globe, Phone, Share2, Map, FileText, CheckCircle } from 'lucide-react'

const TABS = [
  { id: 'basic', label: '基本資訊', icon: FileText },
  { id: 'contact', label: '聯絡資訊', icon: Phone },
  { id: 'social', label: '社群媒體', icon: Share2 },
  { id: 'map', label: 'Google Maps', icon: Map },
  { id: 'footer', label: '頁尾設定', icon: Globe },
] as const

type TabId = (typeof TABS)[number]['id']

interface Props {
  initialSettings: Record<string, string>
}

export default function SettingsForm({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit } = useForm<Record<string, string>>({
    defaultValues: initialSettings,
  })

  async function onSubmit(data: Record<string, string>) {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('儲存失敗')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : '儲存失敗')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex flex-shrink-0 items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Basic Info */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">網站名稱</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">中文名稱</label>
                  <input {...register('site_name_zh')} className="input" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">English Name</label>
                  <input {...register('site_name_en')} className="input" />
                </div>
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">網站描述（SEO）</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">中文描述</label>
                  <textarea {...register('site_description_zh')} className="input" rows={3} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">English Description</label>
                  <textarea {...register('site_description_en')} className="input" rows={3} />
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">電子信箱</label>
                <input {...register('contact_email')} type="email" className="input" placeholder="info@school.edu.tw" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">電話</label>
                <input {...register('contact_phone')} className="input" placeholder="(02) 1234-5678" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">中文地址</label>
                  <input {...register('contact_address_zh')} className="input" placeholder="台北市..." />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">English Address</label>
                  <input {...register('contact_address_en')} className="input" placeholder="100 School Rd..." />
                </div>
              </div>
            </div>
          )}

          {/* Social Media */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              {[
                { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/...' },
                { key: 'line_url', label: 'LINE 官方帳號', placeholder: 'https://line.me/...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
                  <input {...register(key)} className="input" placeholder={placeholder} />
                </div>
              ))}
              <p className="text-xs text-gray-400">留空則不顯示該社群媒體連結</p>
            </div>
          )}

          {/* Google Maps */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Google Maps 嵌入 iframe 代碼
                </label>
                <textarea
                  {...register('google_maps_embed')}
                  className="input font-mono text-xs"
                  rows={6}
                  placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" ...></iframe>'
                />
                <p className="mt-1 text-xs text-gray-400">
                  至 Google Maps 搜尋學校地址 → 分享 → 嵌入地圖 → 複製 HTML 貼於此
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          {activeTab === 'footer' && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">中文版權聲明</label>
                  <input {...register('footer_copyright_zh')} className="input" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">English Copyright</label>
                  <input {...register('footer_copyright_en')} className="input" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            設定已儲存
          </span>
        )}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </form>
  )
}
