'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, LayoutDashboard, FileText, BookOpen, Settings, Bot } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inbox', label: 'Indbakke', icon: Inbox },
  { href: '/templates', label: 'Skabeloner', icon: FileText },
  { href: '/knowledge', label: 'Videnbase', icon: BookOpen },
  { href: '/settings', label: 'Indstillinger', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">AI Mailbot</h1>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
