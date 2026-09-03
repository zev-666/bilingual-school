// src/app/admin/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ 2026-08 資安修正：這一層是後台的「第二道防線」（defence in depth）。
//
// 原本後台的權限完全只靠 middleware 把關，而後台頁面本身（例如
// /admin/contacts、/admin/users）都是 Server Component，直接用 prisma 撈資料
// 渲染、自己不做任何檢查。只要 middleware 出現任何閃失（設定被改、matcher
// 漏掉某條路徑、Edge 驗證出錯），未經授權的人就能直接讀到全部聯絡訊息與
// 使用者清單。政府網站的個資風險太高，所以在 layout 這層再驗一次。
//
// 這個檔案是 Server Component，會在伺服器端驗證 JWT 簽章與角色，
// 通過之後才把畫面交給純 UI 的 <AdminShell>（Client Component）。
// ─────────────────────────────────────────────────────────────────────────────

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthUser, hasPermission } from '@/lib/auth'
import AdminShell from '@/components/admin/AdminShell'
import '../globals.css'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // middleware 會把目前路徑寫進 x-pathname，登入頁要跳過權限檢查
  const pathname = headers().get('x-pathname') ?? ''
  if (pathname === '/admin/login') {
    return <main id="main-content">{children}</main>
  }

  const user = await getAuthUser()
  if (!user) {
    redirect(`/admin/login?from=${encodeURIComponent(pathname || '/admin/dashboard')}`)
  }
  if (!hasPermission(user.role, 'ADMIN')) {
    redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}
