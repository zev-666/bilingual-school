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
    { value: schoolsCount, label: t('schools'), suffix: '+' },
    { value: teachersCount, label: t('teachers_served'), suffix: '+' },
  ]
  return (
    <section className="bg-slate-900 py-14">
      <div className="container-school">
        <div className="grid max-w-md grid-cols-2 gap-8 mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center text-white">
              <div className="mb-1 text-4xl font-black tracking-tight">
                <Counter end={stat.value} />
                <span className="text-amber-400">{stat.suffix}</span>
              </div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
