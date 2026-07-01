// src/app/[locale]/admission/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CheckCircle, FileText, ChevronDown, Phone, Mail } from 'lucide-react'

interface Props { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'admission' })
  return { title: t('title') }
}

const STEP_COLORS = [
  'bg-primary-600',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-pink-500',
]

const TUITION_DATA = {
  elementary: [
    { key: 'tuition',  zh: '新台幣 45,000 元', en: 'NT$ 45,000' },
    { key: 'activity', zh: '新台幣 5,000 元',  en: 'NT$ 5,000'  },
    { key: 'lunch',    zh: '新台幣 8,000 元',  en: 'NT$ 8,000'  },
    { key: 'total',    zh: '新台幣 58,000 元', en: 'NT$ 58,000', bold: true },
  ],
  junior: [
    { key: 'tuition',  zh: '新台幣 55,000 元', en: 'NT$ 55,000' },
    { key: 'activity', zh: '新台幣 6,000 元',  en: 'NT$ 6,000'  },
    { key: 'lunch',    zh: '新台幣 8,000 元',  en: 'NT$ 8,000'  },
    { key: 'total',    zh: '新台幣 69,000 元', en: 'NT$ 69,000', bold: true },
  ],
}

export default async function AdmissionPage({ params: { locale } }: Props) {
  const t    = await getTranslations({ locale, namespace: 'admission' })
  const tc   = await getTranslations({ locale, namespace: 'contact'   })
  const isZh = locale === 'zh-TW'

  const steps = [
    t('steps.step1'), t('steps.step2'), t('steps.step3'),
    t('steps.step4'), t('steps.step5'),
  ]
  const faqItems       = t.raw('faq.items')       as { q: string; a: string }[]
  const reqElementary  = t.raw('requirements.elementary.items') as string[]
  const reqJunior      = t.raw('requirements.junior.items')     as string[]

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-primary-600 to-primary-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-white rounded-full -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-white rounded-full translate-y-1/2" />
        </div>
        <div className="container-school relative text-center">
          <span className="inline-block bg-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {t('title')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('subtitle')}</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">{t('intro.content')}</p>
          <div className="mt-8">
            <Link href={`/${locale}/contact`} className="btn-primary bg-white text-primary-700 hover:bg-gray-50 px-8 py-3 text-base">
              {t('contact.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Application steps */}
      <section className="container-school py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('steps.title')}</h2>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full" />
        </div>
        <div className="flex flex-col md:flex-row items-start gap-4 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center text-center">
              {/* Number circle */}
              <div className={`w-14 h-14 rounded-full ${STEP_COLORS[i]} text-white flex items-center justify-center text-xl font-bold shadow-lg mb-4`}>
                {i + 1}
              </div>
              <p className="text-sm font-medium text-gray-700 leading-snug">{step}</p>
              {/* Arrow between steps (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute mt-6 translate-x-[calc(100%+0.5rem)]">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-gray-50 py-20">
        <div className="container-school">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('requirements.title')}</h2>
            <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              { label: t('requirements.elementary.label'), items: reqElementary },
              { label: t('requirements.junior.label'),     items: reqJunior     },
            ].map(({ label, items }) => (
              <div key={label} className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-primary-600" />
                  {label}
                </h3>
                <ul className="space-y-2.5">
                  {items.map((item: string) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tuition */}
      <section className="container-school py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('tuition.title')}</h2>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full" />
          <p className="text-sm text-gray-400 mt-4">{t('tuition.note')}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {(['elementary', 'junior'] as const).map((level) => (
            <div key={level} className="card overflow-hidden">
              <div className="bg-primary-600 text-white px-5 py-3 font-semibold">
                {t(`tuition.${level}`)}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {TUITION_DATA[level].map((row) => (
                    <tr key={row.key} className="border-b border-gray-50 last:border-0">
                      <td className={`px-5 py-3 text-gray-600 ${row.bold ? 'font-semibold text-gray-900' : ''}`}>
                        {t(`tuition.items.${row.key}`)}
                      </td>
                      <td className={`px-5 py-3 text-right text-gray-800 ${row.bold ? 'font-bold text-primary-600' : ''}`}>
                        {isZh ? row.zh : row.en}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* Scholarship */}
      <section className="bg-primary-50 py-16">
        <div className="container-school max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('scholarship.title')}</h2>
          <p className="text-gray-600 leading-relaxed">{t('scholarship.content')}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-school py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('faq.title')}</h2>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full" />
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="card group">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-medium text-gray-900 hover:text-primary-600 transition-colors">
                {item.q}
                <ChevronDown size={18} className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA contact */}
      <section className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white py-16">
        <div className="container-school text-center">
          <h2 className="text-2xl font-bold mb-4">{t('contact.title')}</h2>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80 mb-8">
            <span className="flex items-center gap-2"><Phone size={15} /> 02-1234-5678</span>
            <span className="flex items-center gap-2"><Mail size={15} /> admission@school.edu.tw</span>
          </div>
          <Link href={`/${locale}/contact`} className="btn-primary bg-white text-primary-700 hover:bg-gray-50 px-8 py-3 text-base">
            {t('contact.cta')}
          </Link>
        </div>
      </section>
    </div>
  )
}
