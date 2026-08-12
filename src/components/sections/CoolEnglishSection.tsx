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
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#9FE1CB] bg-[#E1F5EE]">
        <div className="grid items-center gap-8 px-7 py-10 md:grid-cols-[auto_1fr_auto] md:px-12 md:py-12">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-[#9FE1CB] bg-white">
            <BookOpen size={26} className="text-[#0F6E56]" />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F6E56]">COOL ENGLISH</p>
            <h3 className="text-2xl font-bold text-[#0F2A4A]">
              {locale === 'zh-TW' ? 'Cool English 線上學習資源' : 'Cool English Learning Platform'}
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[#33526D]">
              {locale === 'zh-TW'
                ? '教育部建置的免費英語學習平台，提供聽力、口說、閱讀、寫作全方位練習資源'
                : "The Ministry of Education's free English learning platform for listening, speaking, reading, and writing practice"}
            </p>
          </div>
          <a
            href={coolEnglishUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full border border-[#5DCAA5] bg-[#E1F5EE] px-6 py-3.5 text-sm font-semibold text-[#085041] transition hover:bg-[#9FE1CB]"
          >
            {locale === 'zh-TW' ? '前往學習' : 'Visit Site'}
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
