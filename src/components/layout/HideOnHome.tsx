'use client'

// 首頁改成「互動整合門戶」之後，門戶自帶 Header／分頁導覽／Footer，
// 若再套一層全站 Navbar + Breadcrumb + Footer 會變成兩個頁首兩個頁尾。
// 這個元件只做一件事：在首頁（路徑為 "/"）時把包住的內容隱藏起來，其他頁面照常顯示。

import { usePathname } from '@/i18n/routing'

export default function HideOnHome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // /home 是內容首頁（從入口頁的「英語教學／外師專區」進入），同樣不需要「首頁 > 詳細內容」麵包屑
  if (pathname === '/' || pathname === '/home') return null
  return <>{children}</>
}
