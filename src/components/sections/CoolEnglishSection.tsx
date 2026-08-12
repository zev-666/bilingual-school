import { ExternalLink, BookOpen } from 'lucide-react'

interface CoolEnglishSectionProps {
  locale: string
  coolEnglishUrl?: string
}

export default function CoolEnglishSection({ locale, coolEnglishUrl }: CoolEnglishSectionProps) {
  if (!coolEnglishUrl || coolEnglishUrl.trim() === '') {
    return null
  }

  return (
    <section className="bg-white px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white sm:flex-row sm:gap-8 sm:p-10">
          <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full border-[28px] border-sky-500/30" aria-hidden="true" />
          <div className="relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500">
            <BookOpen size={30} className="text-slate-900" />
          </div>
          <div className="relative z-10 flex-1 text-center sm:text-left">
            <h3 className="mb-1 text-xl font-black">
              {locale === 'zh-TW' ? 'Cool English 線上學習資源' : 'Cool English Learning Platform'}
            </h3>
            <p className="text-sm text-white/60">
              {locale === 'zh-TW'
                ? '教育部建置的免費英語學習平台，提供聽力、口說、閱讀、寫作全方位練習資源'
                : "The Ministry of Education's free English learning platform for listening, speaking, reading, and writing practice"}
            </p>
          </div>
          <a
            href={coolEnglishUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex flex-shrink-0 items-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-amber-400"
          >
            {locale === 'zh-TW' ? '前往學習' : 'Visit Site'}
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
