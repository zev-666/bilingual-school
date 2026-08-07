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
    <section className="section-padding bg-primary-800">
      <div className="container-school">
        <div className="card bg-white/5 border-white/10 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BookOpen size={30} className="text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white mb-1">
              {locale === 'zh-TW' ? 'Cool English 線上學習資源' : 'Cool English Learning Platform'}
            </h3>
            <p className="text-primary-200 text-sm">
              {locale === 'zh-TW'
                ? '教育部建置的免費英語學習平台，提供聽力、口說、閱讀、寫作全方位練習資源'
                : "The Ministry of Education's free English learning platform for listening, speaking, reading, and writing practice"}
            </p>
          </div>
          <a href={coolEnglishUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium text-sm px-5 py-3 rounded-lg transition-colors flex-shrink-0">
            {locale === 'zh-TW' ? '前往學習' : 'Visit Site'}
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}