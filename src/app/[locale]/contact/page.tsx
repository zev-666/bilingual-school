'use client'

// src/app/[locale]/contact/page.tsx
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  phone:   z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const isZh = locale === 'zh-TW'

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  const INFO = [
    { icon: MapPin, label: t('info.address'), value: t('info.addressValue') },
    { icon: Phone,  label: t('info.phone'),   value: t('info.phoneValue'),   href: `tel:${t('info.phoneValue').replace(/\D/g,'')}` },
    { icon: Mail,   label: t('info.email'),   value: t('info.emailValue'),   href: `mailto:${t('info.emailValue')}` },
    { icon: Clock,  label: t('info.hours'),   value: t('info.hoursValue') },
  ]

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white py-16">
        <div className="container-school text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-white/80 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-school py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {isZh ? '聯絡資訊' : 'Contact Information'}
            </h2>
            <ul className="space-y-5 mb-8">
              {INFO.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} className="text-primary-600" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-gray-700 hover:text-primary-600 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-gray-700">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Map embed placeholder */}
            <div className="rounded-2xl overflow-hidden h-52 bg-gray-100 flex items-center justify-center border border-gray-200">
              <span className="text-gray-400 text-sm">Google Maps</span>
            </div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="card p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {isZh ? '傳送訊息' : 'Send a Message'}
              </h2>

              {status === 'success' && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200
                  text-green-700 rounded-xl p-4 mb-6">
                  <CheckCircle size={20} aria-hidden="true" />
                  {t('form.success')}
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200
                  text-red-700 rounded-xl p-4 mb-6">
                  <AlertCircle size={20} aria-hidden="true" />
                  {t('form.error')}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('form.name')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register('name')}
                      className={cn('input', errors.name && 'border-red-300 focus:ring-red-500')}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-xs text-red-600" role="alert">
                        {isZh ? '請填寫姓名' : 'Name is required'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('form.email')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={cn('input', errors.email && 'border-red-300 focus:ring-red-500')}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600" role="alert">
                        {isZh ? '請填寫有效的電子郵件' : 'Valid email is required'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('form.phone')}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('form.subject')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      {...register('subject')}
                      className={cn('input', errors.subject && 'border-red-300 focus:ring-red-500')}
                      aria-invalid={!!errors.subject}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('form.message')} <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register('message')}
                    className={cn('input resize-none', errors.message && 'border-red-300 focus:ring-red-500')}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600" role="alert">
                      {isZh ? '請填寫訊息內容' : 'Message is required'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full sm:w-auto"
                >
                  {status === 'loading' ? t('form.submitting') : t('form.submit')}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
