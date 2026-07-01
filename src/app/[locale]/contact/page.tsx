'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
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

export default function ContactPage() {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

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
                { icon: MapPin, label: t('address'), value: '台北市信義區教育路1號' },
                { icon: Phone, label: t('phone'), value: '02-1234-5678' },
                { icon: Mail, label: t('email'), value: 'info@school.edu.tw' },
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
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {status === 'success' && <div className="p-4 bg-green-50 text-green-700 rounded-lg">{t('success')}</div>}
            {status === 'error' && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{t('error')}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('name')}</label>
                <input {...register('name')} className="input" />
              </div>
              <div>
                <label className="label">{t('email')}</label>
                <input {...register('email')} type="email" className="input" />
              </div>
            </div>
            <div>
              <label className="label">{t('subject')}</label>
              <input {...register('subject')} className="input" />
            </div>
            <div>
              <label className="label">{t('message')}</label>
              <textarea {...register('message')} rows={5} className="input resize-none" />
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
