'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Inbox, LayoutDashboard, FileText, BookOpen, Settings, Sun, Moon } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function Sidebar() {
  const pathname = usePathname()
  const { t, theme, setTheme } = useTranslation()

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/inbox', label: t('inbox'), icon: Inbox },
    { href: '/templates', label: t('templates'), icon: FileText },
    { href: '/knowledge', label: t('knowledgeBase'), icon: BookOpen },
    { href: '/settings', label: t('settings'), icon: Settings },
  ]

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex flex-col">
      <div className="px-4 py-5 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center justify-center">
          <Image
            src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
            alt="Coas"
            width={150}
            height={90}
            className="object-contain"
          />
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.06]">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === 'light' ? t('themeNight') : t('themeDay')}
        </button>
      </div>
    </aside>
  )
}
