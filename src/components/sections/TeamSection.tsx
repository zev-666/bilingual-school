import { Users, Globe2, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/routing'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'

interface TeamSectionProps {
  locale: string
}

// 對應預覽稿「師資團隊」區塊；內容取自現有 about.orgStructure 翻譯。
// ⚠️ 頭像原本使用 emoji（🧑‍🏫 / 👩‍🎓 / 🌏）代表兩位真實校長，觀感不莊重，
// 已改為「姓氏字符徽章」；非個人的分組卡片則用 Lucide 線條圖示。
interface TeamMember {
  /** 個人成員顯示姓氏字符；與 Icon 二擇一 */
  initial?: string
  /** 非個人（分組）卡片顯示線條圖示；與 initial 二擇一 */
  Icon?: LucideIcon
  avatarBg: string
  avatarText: string
  nameZh: string
  nameEn: string
  roleZh: string
  roleEn: string
  orgZh: string
  orgEn: string
}

const TEAM: TeamMember[] = [
  {
    initial: '張',
    avatarBg: 'bg-[#FFE8D6]',
    avatarText: 'text-orangeDeep',
    nameZh: '張雁婷 校長',
    nameEn: 'Principal Chang',
    roleZh: '召集人',
    roleEn: 'Convener',
    orgZh: '碇內國中',
    orgEn: 'Dingnei Junior High',
  },
  {
    initial: '李',
    avatarBg: 'bg-[#DDF2E7]',
    avatarText: 'text-mintDark',
    nameZh: '李欣蓉 校長',
    nameEn: 'Principal Lee',
    roleZh: '副召集人',
    roleEn: 'Deputy Convener',
    orgZh: '中正國小',
    orgEn: 'Zhongzheng Elementary',
  },
  {
    Icon: Globe2,
    avatarBg: 'bg-[#FFF0B8]',
    avatarText: 'text-[#9A7B12]',
    nameZh: '外籍英語教學顧問',
    nameEn: 'Foreign Teaching Consultants',
    roleZh: '國際團隊',
    roleEn: 'International Team',
    orgZh: '支援 TFETP、ELTA 外師協同計畫',
    orgEn: 'Supporting TFETP & ELTA programs',
  },
]

export default function TeamSection({ locale }: TeamSectionProps) {
  const isEn = locale === 'en'

  return (
    <section className="bg-cream py-[88px]">
      <div className="container-school">
        <div className="mb-[52px]">
          <SectionHeading
            eyebrow="OUR TEAM"
            icon={Users}
            align="center"
            title={isEn ? 'Meet the Team' : '我們的師資團隊'}
            subtitle={
              isEn
                ? 'Professional staff and foreign teaching consultants supporting every school'
                : '專業工作人員與外籍英語教學顧問，陪伴全市教師與學生一起成長'
            }
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m, i) => {
            const Icon = m.Icon
            return (
              <Reveal key={i} delay={i * 0.1}>
                <div className="h-full rounded-[28px] border border-line bg-white p-[34px_28px_30px] text-center shadow-[0_6px_18px_rgba(178,122,66,0.08)] transition hover:-translate-y-[6px] hover:border-[#F3D79C] hover:shadow-soft">
                  <div
                    className={`mx-auto mb-4 flex h-[84px] w-[84px] items-center justify-center rounded-[32%] shadow-[0_8px_18px_rgba(178,122,66,0.16)] ${m.avatarBg} ${m.avatarText}`}
                    aria-hidden="true"
                  >
                    {Icon ? (
                      <Icon size={34} strokeWidth={1.7} />
                    ) : (
                      <span className="font-heading text-[2rem] font-extrabold leading-none">{m.initial}</span>
                    )}
                  </div>
                  <h3 className="text-[1.12rem] font-extrabold text-ink">{isEn ? m.nameEn : m.nameZh}</h3>
                  <span className="mt-2 inline-block rounded-full bg-[#FFF1E0] px-3 py-1 text-[0.76rem] font-bold text-orangeDeep">
                    {isEn ? m.roleEn : m.roleZh}
                  </span>
                  <p className="mt-1.5 text-[0.86rem] text-inkSoft">{isEn ? m.orgEn : m.orgZh}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
        <div className="mt-9 text-center">
          <Link
            href="/teachers"
            className="group inline-flex items-center gap-2 text-[0.95rem] font-bold text-orangeDeep transition-all hover:gap-3"
          >
            {isEn ? 'See the full team' : '查看完整團隊'}
            <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
