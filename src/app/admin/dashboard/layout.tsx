'use client'

// src/app/admin/dashboard/layout.tsx  (shared admin shell)
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Megaphone, Images, Video, FileText,
  Users, MessageSquare, HardDrive, Settings, LogOut,
  Menu, X, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/dashboard',      label: '儀表板',     icon: LayoutDashboard },
  { href: '/admin/announcements',  label: '公告管理',   icon: Megaphone },
  { href: '/admin/albums',         label: '相簿管理',   icon: Images },
  { href: '/admin/documents',      label: '文件管理',   icon: FileText },
  { href: '/admin/teachers',       label: '師資管理',   icon: Users },
  { href: '/admin/contacts',       label: '聯絡訊息',   icon: MessageSquare },
  { href: '/admin/media',          label: '媒體庫',     icon: HardDrive },
  { href: '/admin/users',          label: '使用者',     icon: Users },
  { href: '/admin/settings',       label: '網站設定',   icon: Settings },
] as const

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-gray-900 text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-sm">B</div>
        <div>
          <p className="font-semibold text-sm">雙語實驗學校</p>
          <p className="text-xs text-gray-400">管理後台</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" aria-hidden="true" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm
            text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut size={18} aria-hidden="true" />
          登出
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-60 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 flex flex-col">
            <Sidebar />
          </div>
          <button
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-label="關閉選單"
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 py-3 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="開啟選單"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <Link
            href="/"
            target="_blank"
            className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
          >
            預覽網站 ↗
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
