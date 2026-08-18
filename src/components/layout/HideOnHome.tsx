'use client'

// 首頁改成「互動整合門戶」之後，門戶自帶 Header／分頁導覽／Footer，
// 若再套一層全站 Navbar + Breadcrumb + Footer 會變成兩個頁首兩個頁尾。
// 這個元件只做一件事：在首頁（路徑為 "/"）時把包住的內容隱藏起來，其他頁面照常顯示。

import { usePathname } from '@/i18n/routing'

export default function HideOnHome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/') return null
  return <>{children}</>
}
