'use client'
import { useTranslations } from 'next-intl'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

function Counter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (!isInView) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * end))
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

export default function StatsSection({ locale, schoolsCount = 20, teachersCount = 30 }: StatsSectionProps) {
  const t = useTranslations('home.stats')
  const stats = [
    { value: schoolsCount, label: t('schools') },
    { value: teachersCount, label: t('teachers_served') },
  ]
  return (
    <section className="border-y border-[#D7E3EF] bg-[#F7FAFD] py-8">
      <div className="container-school">
        <div className="mx-auto grid max-w-md grid-cols-2 divide-x divide-[#D7E3EF]">
          {stats.map((stat, i) => (
            <div key={i} className="px-6 text-center first:pl-0 last:pr-0">
              <p className="text-3xl font-bold text-[#185FA5]">
                <Counter end={stat.value} />+
              </p>
              <p className="mt-1 text-xs tracking-widest text-[#6B87A0]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
