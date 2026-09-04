import Reveal from '@/components/ui/Reveal'

interface TeamSectionProps {
  locale: string
}

// 對應預覽稿「師資團隊」區塊；內容取自現有 about.orgStructure 翻譯
const TEAM = [
  { avatar: '🧑‍🏫', avatarBg: 'bg-[#FFE8D6]', nameZh: '張雁婷 校長', nameEn: 'Principal Chang', roleZh: '召集人', roleEn: 'Convener', orgZh: '碇內國中', orgEn: 'Dingnei Junior High' },
  { avatar: '👩‍🎓', avatarBg: 'bg-[#DDF2E7]', nameZh: '李欣蓉 校長', nameEn: 'Principal Lee', roleZh: '副召集人', roleEn: 'Deputy Convener', orgZh: '中正國小', orgEn: 'Zhongzheng Elementary' },
  { avatar: '🌏', avatarBg: 'bg-[#FFF0B8]', nameZh: '外籍英語教學顧問', nameEn: 'Foreign Teaching Consultants', roleZh: '國際團隊', roleEn: 'International Team', orgZh: '支援 TFETP、ELTA 外師協同計畫', orgEn: 'Supporting TFETP & ELTA programs' },
]

export default function TeamSection({ locale }: TeamSectionProps) {
  const isEn = locale === 'en'

  return (
    <section className="bg-cream py-[88px]">
      <div className="container-school">
        <div className="mx-auto mb-[52px] max-w-[720px] text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FBDCB3] bg-[#FFF1E0] px-4 py-1.5 text-[0.78rem] font-bold tracking-[0.14em] text-orangeDeep">
            👩‍🏫 OUR TEAM
          </span>
          <h2 className="mt-3.5 text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold text-ink">
            {isEn ? 'Meet the Team' : '我們的師資團隊'}
          </h2>
          <p className="mx-auto mt-2 max-w-[640px] text-inkSoft">
            {isEn
              ? 'Professional staff and foreign teaching consultants supporting every school'
              : '專業工作人員與外籍英語教學顧問，陪伴全市教師與學生一起成長'}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="rounded-[28px] border border-line bg-white p-[34px_28px_30px] text-center shadow-[0_6px_18px_rgba(178,122,66,0.08)] transition hover:-translate-y-[6px] hover:shadow-soft">
                <div className={`mx-auto mb-4 flex h-[84px] w-[84px] items-center justify-center rounded-[32%] text-[2.3rem] shadow-[0_8px_18px_rgba(178,122,66,0.16)] ${m.avatarBg}`}>
                  {m.avatar}
                </div>
                <h3 className="text-[1.12rem] font-extrabold text-ink">{isEn ? m.nameEn : m.nameZh}</h3>
                <span className="mt-2 inline-block rounded-full bg-[#FFF1E0] px-3 py-1 text-[0.76rem] font-bold text-orangeDeep">
                  {isEn ? m.roleEn : m.roleZh}
                </span>
                <p className="mt-1.5 text-[0.86rem] text-inkSoft">{isEn ? m.orgEn : m.orgZh}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}