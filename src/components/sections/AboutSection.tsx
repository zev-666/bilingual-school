import { Link } from '@/i18n/routing'
import { Compass, Library, Globe2, Lightbulb, GraduationCap, Users, HeartHandshake, ArrowRight } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'

interface AboutSectionProps {
  locale: string
}

const TILE_STYLES = [
  { bg: 'bg-[#FFF3DF] border-[#F6DDB2]', icon: 'text-orangeDeep' },
  { bg: 'bg-[#E7F7EE] border-[#CDEBDD]', icon: 'text-mintDark' },
  { bg: 'bg-[#FFF6CE] border-[#F0E3A8]', icon: 'text-[#9A7B12]' },
]

const TILE_POS = [
  'left-0 top-0 w-[200px] max-lg:w-[170px]',
  'right-0 top-[90px] w-[230px] max-lg:w-[190px]',
  'bottom-0 left-[60px] w-[200px] max-lg:w-[170px]',
]

// 圖示一律使用 Lucide 線條圖示（原本是 emoji），維持全站單一圖示語言。
const TILES = [
  { Icon: Library, titleZh: '教學資源共享', titleEn: 'Shared Resources', descZh: '全市共備教材、評量與課程模組', descEn: 'Co-planned materials citywide' },
  { Icon: Globe2, titleZh: '外師交流合作', titleEn: 'Foreign Teachers', descZh: 'TFETP、ELTA 外師協同教學計畫', descEn: 'TFETP & ELTA programs' },
  { Icon: Lightbulb, titleZh: '專業研習支持', titleEn: 'Teacher Training', descZh: '工作坊、研習與專業成長支持', descEn: 'Workshops & training' },
]

const FEATURES = [
  { Icon: GraduationCap, titleZh: '教學資源共享', titleEn: 'Shared Teaching Resources', subZh: '共備教材 × 評量工具 × 課程模組', subEn: 'Materials · Assessment · Course modules', iconBg: 'bg-[#FFE8D6]', iconColor: 'text-orangeDeep' },
  { Icon: Users, titleZh: '外師交流合作', titleEn: 'Foreign Teacher Collaboration', subZh: 'TFETP、ELTA 外師協同教學計畫', subEn: 'TFETP & ELTA co-teaching programs', iconBg: 'bg-[#DDF2E7]', iconColor: 'text-mintDark' },
  { Icon: HeartHandshake, titleZh: '專業研習支持', titleEn: 'Professional Development', subZh: '工作坊 × 研習 × 教師專業成長', subEn: 'Workshops · Training · Growth', iconBg: 'bg-[#FFF0B8]', iconColor: 'text-[#9A7B12]' },
]

export default function AboutSection({ locale }: AboutSectionProps) {
  const isEn = locale === 'en'

  return (
    <section className="bg-cream py-[88px]">
      <div className="container-school grid items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <div className="relative h-[460px] max-lg:h-[400px]" aria-hidden="true">
            {TILES.map((tile, i) => {
              const Icon = tile.Icon
              return (
                <div
                  key={i}
                  className={`absolute rounded-[32px] border bg-white p-[26px_28px] shadow-card max-lg:p-[20px_22px] ${TILE_POS[i]} ${TILE_STYLES[i].bg}`}
                >
                  <Icon size={30} strokeWidth={1.7} className={`mb-2.5 ${TILE_STYLES[i].icon}`} />
                  <h3 className="text-[1.05rem] font-bold text-ink">{isEn ? tile.titleEn : tile.titleZh}</h3>
                  <p className="mt-1 text-[0.83rem] text-inkSoft">{isEn ? tile.descEn : tile.descZh}</p>
                </div>
              )
            })}
          </div>
        </Reveal>

        <Reveal>
          <div>
            <SectionHeading
              eyebrow="ABOUT US · 關於本中心"
              icon={Compass}
              title={
                isEn ? (
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
                )
              }
            />
            <p className="mt-4 leading-[2] text-inkSoft">
              {isEn
                ? 'Established under the supervision of the Department of Education, Keelung City Government, the Center coordinates English and bilingual education across all municipal elementary and junior high schools—with foreign teaching consultants supporting TFETP and ELTA programs.'
                : '本中心由基隆市政府教育處督導設置，統籌全市國民中小學英語與雙語教育推動事務，遴選召集人、副召集人與專業工作人員，並徵選外籍英語教學顧問，攜手全市 50 所國中小推展雙語教育。'}
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {FEATURES.map((f, i) => {
                const Icon = f.Icon
                return (
                  <div
                    key={i}
                    className="flex items-center gap-[14px] rounded-[18px] border border-line bg-white p-[14px_18px] shadow-[0_4px_12px_rgba(178,122,66,0.06)] transition duration-200 hover:-translate-y-[3px] hover:shadow-card"
                  >
                    <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${f.iconBg} ${f.iconColor}`}>
                      <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span>
                      <strong className="block text-[0.98rem] text-ink">{isEn ? f.titleEn : f.titleZh}</strong>
                      <span className="text-[0.8rem] text-inkSoft">{isEn ? f.subEn : f.subZh}</span>
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-5">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-[0.95rem] font-bold text-orangeDeep transition-all hover:gap-3"
              >
                {isEn ? 'Learn more' : '了解更多'}
                <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
