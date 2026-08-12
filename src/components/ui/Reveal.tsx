'use client'
// src/components/ui/Reveal.tsx
// 可重用的「滾動進入可視範圍才淡入」包裝元件。
// 首頁 Hero 用的是「一進頁面就播放」的 CSS animation（globals.css 的 fadeInUp keyframe），
// 這支元件則是給 Hero 以外、通常在折線以下的區塊用——用 framer-motion 的 whileInView
// 偵測捲動位置，符合使用者實際會體驗到動畫的時機，而不是還沒捲到就播完。
// 沿用專案既有的 framer-motion 依賴（StatsSection.tsx 已經在用 useInView），不新增套件。
import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** 延遲秒數，用來讓同一區塊內的多個子項目做出交錯（stagger）效果 */
  delay?: number
  /** 額外的 className，會直接放在包裝的 div 上 */
  className?: string
}

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  // 尊重「減少動態效果」系統設定：直接顯示，不套動畫
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}