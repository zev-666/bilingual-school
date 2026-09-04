import Reveal from '@/components/ui/Reveal'

interface CoolEnglishSectionProps {
  locale: string
  coolEnglishUrl?: string
}

export default function CoolEnglishSection({ locale, coolEnglishUrl }: CoolEnglishSectionProps) {
  if (!coolEnglishUrl || coolEnglishUrl.trim() === '') {
    return null
  }
  const isEn = locale === 'en'

  return (
    <section className="bg-creamSoft pb-[88px]">
      <div className="container-school">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] border border-[#BBE4CE] bg-gradient-to-br from-[#DFF3E8] to-[#C4E9D6] p-[34px_40px] shadow-card">
            <span
              className="pointer-events-none absolute -bottom-[30px] -right-[10px] select-none text-[7rem] opacity-[0.12]"
              aria-hidden="true"
            >
              📚
            </span>
            <div className="grid items-center gap-[26px] md:grid-cols-[auto_1fr_auto]">
              <div className="flex h-[74px] w-[74px] flex-shrink-0 items-center justify-center rounded-[24px] bg-white text-[2.1rem] shadow-[0_8px_20px_rgba(78,158,125,0.22)]">
                📖
              </div>
              <div>
                <p className="mb-1 text-[0.78rem] font-bold tracking-[0.18em] text-mintDark">COOL ENGLISH</p>
                <h3 className="text-[1.5rem] font-extrabold text-[#1E4A36]">
                  {isEn ? 'Cool English Learning Platform' : 'Cool English 線上學習資源'}
                </h3>
                <span className="mt-1.5 block text-[0.9rem] leading-[1.8] text-[#3F6B57]">
                  {isEn
                    ? "The MOE's free English platform for listening, speaking, reading and writing practice"
                    : '教育部建置的免費英語學習平台，提供聽力、口說、閱讀、寫作全方位練習資源'}
                </span>
              </div>
              <a
                href={coolEnglishUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-mintDark px-6 py-3 text-[0.92rem] font-bold text-white shadow-[0_8px_18px_rgba(78,158,125,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(78,158,125,0.38)]"
              >
                {isEn ? 'Visit Site' : '前往學習'} <span>↗</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
