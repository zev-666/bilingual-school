'use client'
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})
type FormData = z.infer<typeof schema>

/**
 * 從後台設定的 Google Maps 內嵌碼中「只取出 src 網址」，並驗證網域。
 * 後台存的可能是整段 <iframe ...> 也可能只有一個網址，兩種都支援。
 * 只允許 google.com / google.com.tw 的 /maps/embed 路徑，其餘一律回傳空字串。
 * 這樣即使後台設定值被塞入惡意 HTML，也不會有任何東西被當成 HTML 執行。
 */
function extractSafeMapSrc(raw: string): string {
  if (!raw) return ''
  const candidate = raw.includes('<') ? (raw.match(/src=["']([^"']+)["']/i)?.[1] ?? '') : raw.trim()
  if (!candidate) return ''
  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:') return ''
    const host = url.hostname.toLowerCase()
    const allowedHost =
      host === 'www.google.com' ||
      host === 'maps.google.com' ||
      host === 'www.google.com.tw' ||
      host === 'maps.google.com.tw'
    if (!allowedHost) return ''
    if (!url.pathname.startsWith('/maps/embed')) return ''
    return url.toString()
  } catch {
    return ''
  }
}

// API 沒有回傳對應 key（尚未在後台設定過）時使用的預設值，跟 admin/settings/page.tsx 的 DEFAULT_SETTINGS 保持一致
const DEFAULT_CONTACT_SETTINGS = {
  contact_address_zh: '基隆市中正區（請填入實際地址）',
  contact_address_en: '(Please fill in actual address), Zhongzheng Dist., Keelung',
  contact_phone: '(02) 2XXX-XXXX',
  contact_email: 'info@kl-erc.edu.tw',
}

export default function ContactPage() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [mapEmbed, setMapEmbed] = useState<string>('')
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT_SETTINGS)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const mapSrc = extractSafeMapSrc(mapEmbed)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.google_maps_embed) {
            setMapEmbed(json.data.google_maps_embed)
          }
          setContactInfo((prev) => ({
            contact_address_zh: json.data.contact_address_zh || prev.contact_address_zh,
            contact_address_en: json.data.contact_address_en || prev.contact_address_en,
            contact_phone: json.data.contact_phone || prev.contact_phone,
            contact_email: json.data.contact_email || prev.contact_email,
          }))
        }
      })
      .catch(() => {
        // 讀取設定失敗就維持預設值，不影響頁面其他部分
      })
  }, [])

  const address = locale === 'en' ? contactInfo.contact_address_en : contactInfo.contact_address_zh

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) { setStatus('success'); reset() } else setStatus('error')
    } catch { setStatus('error') }
  }

  return (
    <div className="section-padding">
      <div className="container-school">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="space-y-6">
              {[
                { icon: MapPin, label: t('address'), value: address },
                { icon: Phone, label: t('phone'), value: contactInfo.contact_phone },
                { icon: Mail, label: t('email'), value: contactInfo.contact_email },
                { icon: Clock, label: t('office_hours'), value: t('office_hours_value') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="font-medium text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Maps 嵌入：由後台「網站設定 → Google Maps」貼上 iframe 代碼控制。
                ⚠️ 2026-08 資安修正：原本這裡是 dangerouslySetInnerHTML={{ __html: mapEmbed }}，
                後台設定的字串會被當成 HTML 直接插進公開頁面 —— 只要有一個 ADMIN 帳號被盜、
                或內部人員惡意填入 <script>，就是全站儲存型 XSS（可竊取其他管理員的 session）。
                現在改成只從設定值裡「取出 src 網址」，驗證網域必須是 Google 地圖，
                再用 React 自己渲染 <iframe>，完全不碰 innerHTML。 */}
            {mapSrc && (
              <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
                <iframe
                  src={mapSrc}
                  title={locale === 'en' ? 'Location map' : '中心位置地圖'}
                  className="h-[320px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {status === 'success' && <div className="p-4 bg-green-50 text-green-700 rounded-lg">{t('success')}</div>}
            {status === 'error' && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{t('error')}</div>}
            {/* 無障礙：每個欄位都要有 htmlFor/id 配對（WCAG 4.1.2），
                錯誤訊息要用 aria-describedby 掛回欄位並標 aria-invalid（WCAG 3.3.1） */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="label">
                  {t('name')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  {...register('name')}
                  className="input"
                  required
                  aria-required="true"
                  aria-invalid={errors.name ? 'true' : undefined}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                />
                {errors.name && (
                  <p id="contact-name-error" role="alert" className="mt-1 text-xs text-red-700">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="contact-email" className="label">
                  {t('email')} <span aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  {...register('email')}
                  type="email"
                  className="input"
                  required
                  aria-required="true"
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : undefined}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                />
                {errors.email && (
                  <p id="contact-email-error" role="alert" className="mt-1 text-xs text-red-700">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className="label">
                {t('subject')} <span aria-hidden="true">*</span>
              </label>
              <input
                id="contact-subject"
                {...register('subject')}
                className="input"
                required
                aria-required="true"
                aria-invalid={errors.subject ? 'true' : undefined}
                aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
              />
              {errors.subject && (
                <p id="contact-subject-error" role="alert" className="mt-1 text-xs text-red-700">
                  {errors.subject.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="contact-message" className="label">
                {t('message')} <span aria-hidden="true">*</span>
              </label>
              <textarea
                id="contact-message"
                {...register('message')}
                rows={5}
                className="input resize-none"
                required
                aria-required="true"
                aria-invalid={errors.message ? 'true' : undefined}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
              />
              {errors.message && (
                <p id="contact-message-error" role="alert" className="mt-1 text-xs text-red-700">
                  {errors.message.message}
                </p>
              )}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? '...' : t('submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
