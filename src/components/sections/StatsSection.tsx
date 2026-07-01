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

export default function StatsSection({ locale }: { locale: string }) {
  const t = useTranslations('home.stats')
  const stats = [
    { value: 1200, label: t('students'), suffix: '+' },
    { value: 80, label: t('teachers'), suffix: '+' },
    { value: 15, label: t('years'), suffix: '' },
    { value: 30, label: t('programs'), suffix: '+' },
  ]

  return (
    <section className="bg-primary-600 py-12">
      <div className="container-school">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center text-white">
              <div className="text-4xl font-bold mb-1">
                <Counter end={stat.value} />{stat.suffix}
              </div>
              <div className="text-primary-100 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
