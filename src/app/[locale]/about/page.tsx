// src/app/[locale]/about/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Globe, BookOpen, Lightbulb, Heart, CheckCircle } from 'lucide-react'

interface Props { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('title') }
}

const VALUE_ICONS = {
  bilingual:  <Globe      size={28} className="text-primary-600" />,
  culture:    <BookOpen   size={28} className="text-indigo-600"  />,
  innovation: <Lightbulb  size={28} className="text-amber-500"   />,
  character:  <Heart      size={28} className="text-rose-500"    />,
}

const VALUE_BG = {
  bilingual:  'bg-primary-50 border-primary-100',
  culture:    'bg-indigo-50 border-indigo-100',
  innovation: 'bg-amber-50 border-amber-100',
  character:  'bg-rose-50 border-rose-100',
}

const FACILITY_IMAGES = [
  'https://Image.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
  'https://Image.unsplash.com/photo-1532094349884-543559c17a05?w=600&q=80',
  'https://Image.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80',
  'https://Image.unsplash.com/photo-1562774053-701939374585?w=600&q=80',
  'https://Image.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80',
  'https://Image.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80',
]

export default async function AboutPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'about' })

  const historyEvents = t.raw('history.events') as { year: string; title: string; desc: string }[]
  const facilities    = t.raw('facilities.items') as { name: string; desc: string }[]
  const values        = ['bilingual', 'culture', 'innovation', 'character'] as const

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="container-school relative text-center">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {t('title')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{t('subtitle')}</h1>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="container-school py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {(['vision', 'mission'] as const).map((key) => (
            <div key={key} className="card p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-600 rounded-full inline-block" />
                {t(`${key}.title`)}
              </h2>
              <p className="text-gray-600 leading-relaxed">{t(`${key}.content`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary-600 text-white py-12">
        <div className="container-school">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '2001', label: t('stats.founded') },
              { value: '1,200+', label: t('stats.students') },
              { value: '80+', label: t('stats.teachers') },
              { value: '100+', label: t('stats.awards') },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-bold mb-1">{value}</p>
                <p className="text-white/80 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="container-school py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('values.title')}</h2>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((key) => (
            <div key={key} className={`rounded-2xl border p-6 ${VALUE_BG[key]}`}>
              <div className="mb-4">{VALUE_ICONS[key]}</div>
              <h3 className="font-bold text-gray-900 mb-2">{t(`values.${key}.title`)}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t(`values.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* History timeline */}
      <section className="bg-gray-50 py-20">
        <div className="container-school">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('history.title')}</h2>
            <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full" />
          </div>
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-[calc(50%-1px)] top-0 bottom-0 w-0.5 bg-primary-200 hidden md:block" />

            <div className="space-y-8">
              {historyEvents.map((event, i) => (
                <div
                  key={event.year}
                  className={`flex items-start gap-6 md:gap-0 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 card p-5 ${i % 2 === 0 ? 'md:mr-10' : 'md:ml-10'}`}>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                      {event.year}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-2 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{event.desc}</p>
                  </div>

                  {/* Dot (desktop) */}
                  <div className="hidden md:flex w-8 shrink-0 items-center justify-center relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow" />
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="container-school py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('facilities.title')}</h2>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((item, i) => (
            <div key={item.name} className="card overflow-hidden group">
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <Image
                  src={FACILITY_IMAGES[i % FACILITY_IMAGES.length]}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary-600 shrink-0" />
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
