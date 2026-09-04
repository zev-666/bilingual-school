'use client'
import { useTranslations } from 'next-intl'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

function Counter({ end, duration = 1600 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (!isInView) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic，與預覽稿一致
      setCount(Math.floor(eased * end))
      if (progress === 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, end, duration])
  return <span ref={ref}>{count.toLocaleString()}</span>
}

interface StatsSectionProps {
  locale: string
  schoolsCount?: number
  teachersCount?: number
}

export default function StatsSection({ locale, schoolsCount = 50, teachersCount = 300 }: StatsSectionProps) {
  const t = useTranslations('home.stats')
  const stats = [
    { icon: '🏫', value: schoolsCount, suffix: '+', label: t('schools') },
    { icon: '🧑‍🏫', value: teachersCount, suffix: '+', label: t('teachers_served') },
    { icon: '🗓️', value: 2024, suffix: '年', label: locale === 'zh-TW' ? '成立揭牌' : 'Founded' },
  ]
  return (
    <section className="border-b border-line bg-white">
      <div className="container-school grid gap-6 py-2 md:grid-cols-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-[28px] border border-[#F6E7CE] bg-gradient-to-b from-[#FFFAF0] to-[#FFF4E6] px-3 py-[30px] text-center"
          >
            <div className="mb-2 text-[1.7rem]">{stat.icon}</div>
            <p className="font-heading text-[2.6rem] font-extrabold leading-[1.1] text-orangeDeep">
              <Counter end={stat.value} />
              {stat.suffix && <small className="text-[1.4rem]">{stat.suffix}</small>}
            </p>
            <p className="mt-1.5 text-[0.9rem] font-semibold tracking-[0.04em] text-inkSoft">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
