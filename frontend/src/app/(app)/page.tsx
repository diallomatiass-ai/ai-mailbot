'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Mail, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface Stats {
  total: number
  unread: number
  categories: Record<string, number>
  urgency: Record<string, number>
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.getEmailStats().then(setStats).catch(console.error)
  }, [])

  if (!stats) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-6">{t('dashboard')}</h1>
        <p className="text-slate-500 dark:text-zinc-500">{t('loading')}</p>
      </div>
    )
  }

  const urgencyConfig: Record<string, { iconColor: string; glow: string; icon: typeof AlertTriangle }> = {
    high: { iconColor: 'text-red-500 dark:text-red-400', glow: 'bg-red-50 dark:bg-red-500/10', icon: AlertTriangle },
    medium: { iconColor: 'text-amber-500 dark:text-amber-400', glow: 'bg-amber-50 dark:bg-amber-500/10', icon: Clock },
    low: { iconColor: 'text-green-500 dark:text-green-400', glow: 'bg-green-50 dark:bg-green-500/10', icon: CheckCircle },
  }

  const urgencyLabels: Record<string, string> = { high: t('high'), medium: t('medium'), low: t('low') }

  return (
    <div className="p-8 animate-fadeIn">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-6 group hover:border-indigo-300 dark:hover:border-indigo-500/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-zinc-500">{t('totalEmails')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 group hover:border-amber-300 dark:hover:border-amber-500/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-zinc-500">{t('unread')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{stats.unread}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 group hover:border-green-300 dark:hover:border-green-500/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-zinc-500">{t('processed')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{stats.total - stats.unread}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4">{t('categories')}</h2>
          <div className="space-y-3">
            {Object.entries(stats.categories).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-zinc-400 capitalize">{cat}</span>
                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium text-slate-700 dark:text-zinc-300">{count}</span>
              </div>
            ))}
            {Object.keys(stats.categories).length === 0 && (
              <p className="text-sm text-slate-400 dark:text-zinc-600">{t('noData')}</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4">{t('priority')}</h2>
          <div className="space-y-3">
            {['high', 'medium', 'low'].map((level) => {
              const config = urgencyConfig[level]
              const Icon = config.icon
              const count = stats.urgency[level] || 0
              return (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1 rounded ${config.glow}`}>
                      <Icon className={`w-4 h-4 ${config.iconColor}`} />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-zinc-400">{urgencyLabels[level]}</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium text-slate-700 dark:text-zinc-300">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
