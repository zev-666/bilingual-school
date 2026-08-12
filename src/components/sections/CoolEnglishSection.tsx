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
    <section className="px-5 pb-20 sm:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#c7d9da] bg-[#eaf1ef]">
        <div className="grid items-center gap-8 px-7 py-10 md:grid-cols-[auto_1fr_auto] md:px-12 md:py-12">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-[#c7d9da] bg-[#FBF8F1]">
            <BookOpen size={26} className="text-[#718087]" />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#718087]">COOL ENGLISH</p>
            <h3 className="text-2xl font-bold text-[#5f6d6e]">
              {locale === 'zh-TW' ? 'Cool English 線上學習資源' : 'Cool English Learning Platform'}
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[#718087]">
              {locale === 'zh-TW'
                ? '教育部建置的免費英語學習平台，提供聽力、口說、閱讀、寫作全方位練習資源'
                : "The Ministry of Education's free English learning platform for listening, speaking, reading, and writing practice"}
            </p>
          </div>
          <a
            href={coolEnglishUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full border border-[#9ebdc4] bg-[#f5faf8] px-6 py-3.5 text-sm font-semibold text-[#637b81] transition hover:bg-[#dce9eb]"
          >
            {locale === 'zh-TW' ? '前往學習' : 'Visit Site'}
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
