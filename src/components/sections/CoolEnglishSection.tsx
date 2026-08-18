import { ExternalLink, BookOpen } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'

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
      <Reveal>
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#B7E4CE] bg-[#E8F6EF]">
          <div className="grid items-center gap-8 px-7 py-10 md:grid-cols-[auto_1fr_auto] md:px-12 md:py-12">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-[#B7E4CE] bg-white">
              <BookOpen size={26} className="text-[#2E7A57]" />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2E7A57]">COOL ENGLISH</p>
              <h3 className="text-2xl font-bold text-[#2D241E]">
                {locale === 'zh-TW' ? 'Cool English 線上學習資源' : 'Cool English Learning Platform'}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[#6E6259]">
                {locale === 'zh-TW'
                  ? '教育部建置的免費英語學習平台，提供聽力、口說、閱讀、寫作全方位練習資源'
                  : "The Ministry of Education's free English learning platform for listening, speaking, reading, and writing practice"}
              </p>
            </div>
            <a href={coolEnglishUrl} target="_blank" rel="noopener noreferrer" className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full border border-[#52B788] bg-[#E8F6EF] px-6 py-3.5 text-sm font-semibold text-[#1F5C42] transition hover:bg-[#B7E4CE]">
              {locale === 'zh-TW' ? '前往學習' : 'Visit Site'}
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
