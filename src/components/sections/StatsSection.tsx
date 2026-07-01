'use client'

// src/components/sections/StatsSection.tsx
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useInView } from 'react-intersection-observer'
import { Users, BookOpen, Award, Clock } from 'lucide-react'

const STATS = [
  { key: 'students', icon: Users,     value: 1200, suffix: '+' },
  { key: 'teachers', icon: BookOpen,  value: 80,   suffix: '+' },
  { key: 'years',    icon: Clock,     value: 25,   suffix: '' },
  { key: 'awards',   icon: Award,     value: 150,  suffix: '+' },
]

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true })
  const frameRef = useRef<number>()

  useEffect(() => {
    if (!inView) return
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

interface StatsSectionProps {
  locale: string
}

export default function StatsSection({ locale }: StatsSectionProps) {
  const t = useTranslations('home.stats')
  const isZh = locale === 'zh-TW'

  return (
    <section className="bg-primary-600 py-16" aria-label={isZh ? '學校數據' : 'School statistics'}>
      <div className="container-school">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ key, icon: Icon, value, suffix }) => (
            <div
              key={key}
              className="text-center text-white"
            >
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Icon size={24} aria-hidden="true" />
                </div>
              </div>
              <div className="text-4xl font-bold mb-1">
                <CountUp target={value} />
                {suffix}
                <span className="text-xl ml-1 font-normal opacity-80">
                  {t(`unit.${key}`)}
                </span>
              </div>
              <p className="text-white/70 text-sm">{t(key)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
