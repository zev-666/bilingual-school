'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Megaphone, Images, FileText, Users, Settings, MessageSquare, LogOut, Video, Library, GraduationCap } from 'lucide-react'
import '../globals.css'

const navItems = [
  { href: '/admin/dashboard', label: '儀表板', icon: LayoutDashboard },
  { href: '/admin/announcements', label: '公告管理', icon: Megaphone },
  { href: '/admin/albums', label: '相簿管理', icon: Images },
  { href: '/admin/teachers', label: '師資管理', icon: GraduationCap },
  { href: '/admin/documents', label: '文件管理', icon: FileText },
  { href: '/admin/media', label: '媒體庫', icon: Library },
  { href: '/admin/contacts', label: '聯絡訊息', icon: MessageSquare },
  { href: '/admin/users', label: '使用者管理', icon: Users },
  { href: '/admin/settings', label: '網站設定', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') return <>{children}</>

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">雙</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">後台管理系統</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={16} /> 登出
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  )
}
