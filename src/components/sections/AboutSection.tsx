import { Link } from '@/i18n/routing'
import Reveal from '@/components/ui/Reveal'

interface AboutSectionProps {
  locale: string
}

const TILE_STYLES = [
  { bg: 'bg-[#FFF3DF] border-[#F6DDB2]' },
  { bg: 'bg-[#E7F7EE] border-[#CDEBDD]' },
  { bg: 'bg-[#FFF6CE] border-[#F0E3A8]' },
]

const TILE_POS = [
  'left-0 top-0 w-[200px] max-lg:w-[170px]',
  'right-0 top-[90px] w-[230px] max-lg:w-[190px]',
  'bottom-0 left-[60px] w-[200px] max-lg:w-[170px]',
]

const TILES = [
  { icon: '📚', titleZh: '教學資源共享', titleEn: 'Shared Resources', descZh: '全市共備教材、評量與課程模組', descEn: 'Co-planned materials citywide' },
  { icon: '🌍', titleZh: '外師交流合作', titleEn: 'Foreign Teachers', descZh: 'TFETP、ELTA 外師協同教學計畫', descEn: 'TFETP & ELTA programs' },
  { icon: '💡', titleZh: '專業研習支持', titleEn: 'Teacher Training', descZh: '工作坊、研習與專業成長支持', descEn: 'Workshops & training' },
]

const FEATURES = [
  { icon: '🎓', titleZh: '教學資源共享', titleEn: 'Shared Teaching Resources', subZh: '共備教材 × 評量工具 × 課程模組', subEn: 'Materials · Assessment · Course modules', iconBg: 'bg-[#FFE8D6]' },
  { icon: '🤝', titleZh: '外師交流合作', titleEn: 'Foreign Teacher Collaboration', subZh: 'TFETP、ELTA 外師協同教學計畫', subEn: 'TFETP & ELTA co-teaching programs', iconBg: 'bg-[#DDF2E7]' },
  { icon: '❤️', titleZh: '專業研習支持', titleEn: 'Professional Development', subZh: '工作坊 × 研習 × 教師專業成長', subEn: 'Workshops · Training · Growth', iconBg: 'bg-[#FFF0B8]' },
]

export default function AboutSection({ locale }: AboutSectionProps) {
  const isEn = locale === 'en'

  return (
    <section className="bg-cream py-[88px]">
      <div className="container-school grid items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <div className="relative h-[460px] max-lg:h-[400px]" aria-hidden="true">
            {TILES.map((tile, i) => (
              <div
                key={i}
                className={`absolute rounded-[32px] border bg-white p-[26px_28px] shadow-card max-lg:p-[20px_22px] ${TILE_POS[i]} ${TILE_STYLES[i].bg}`}
              >
                <div className="mb-2.5 text-[1.9rem]">{tile.icon}</div>
                <h3 className="text-[1.05rem] font-bold text-ink">{isEn ? tile.titleEn : tile.titleZh}</h3>
                <p className="mt-1 text-[0.83rem] text-inkSoft">{isEn ? tile.descEn : tile.descZh}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FBDCB3] bg-[#FFF1E0] px-4 py-1.5 text-[0.78rem] font-bold tracking-[0.14em] text-orangeDeep">
              ABOUT US · 關於本中心
            </span>
            <h2 className="mt-3.5 text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold leading-tight text-ink">
              {isEn ? (
                <>
                  Turn the city into a classroom,
                  <br />
                  bring learning back to life.
                </>
              ) : (
                <>
                  把城市變成教室，
                  <br />
                  把學習帶回生活。
                </>
              )}
            </h2>
            <p className="mt-4 leading-[2] text-inkSoft">
              {isEn
                ? 'Established under the supervision of the Department of Education, Keelung City Government, the Center coordinates English and bilingual education across all municipal elementary and junior high schools—with foreign teaching consultants supporting TFETP and ELTA programs.'
                : '本中心由基隆市政府教育處督導設置，統籌全市國民中小學英語與雙語教育推動事務，遴選召集人、副召集人與專業工作人員，並徵選外籍英語教學顧問，攜手全市 50 所國中小推展雙語教育。'}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-[14px] rounded-[18px] border border-line bg-white p-[14px_18px] shadow-[0_4px_12px_rgba(178,122,66,0.06)] transition duration-200 hover:-translate-y-[3px] hover:shadow-card"
                >
                  <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xl ${f.iconBg}`}>
                    {f.icon}
                  </span>
                  <span>
                    <strong className="block text-[0.98rem] text-ink">{isEn ? f.titleEn : f.titleZh}</strong>
                    <span className="text-[0.8rem] text-inkSoft">{isEn ? f.subEn : f.subZh}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3.5">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[0.95rem] font-bold text-orangeDeep transition-all hover:gap-3"
              >
                {isEn ? 'Learn more' : '了解更多'} <span>→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
