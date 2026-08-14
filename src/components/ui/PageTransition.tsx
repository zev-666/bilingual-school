'use client'

// src/components/ui/PageTransition.tsx
// 包住 <main> 內容，頁面切換時做淡入效果（配合 pathname 變化觸發）
// 用法：在 [locale]/layout.tsx 把 {children} 換成 <PageTransition>{children}</PageTransition>
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
