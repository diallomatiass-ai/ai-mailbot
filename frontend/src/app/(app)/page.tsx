'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  Mail, AlertTriangle, CheckCircle, Clock,
  Inbox, Sparkles, TrendingUp, ChevronRight,
} from 'lucide-react'

interface TopEmail {
  id: string
  subject: string
  from_address: string
  urgency: string
  category: string | null
}

interface DashboardData {
  user_name: string
  unread: number
  high_priority: number
  pending_suggestions: number
  week_total: number
  top_urgent: TopEmail[]
}

interface Stats {
  total: number
  unread: number
  categories: Record<string, number>
  urgency: Record<string, number>
}

function greeting(name: string): string {
  const h = new Date().getHours()
  if (h < 10) return `God morgen, ${name}`
  if (h < 12) return `God formiddag, ${name}`
  if (h < 18) return `God eftermiddag, ${name}`
  return `God aften, ${name}`
}

const urgencyColor: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  low: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20',
}

const urgencyLabel: Record<string, string> = { high: 'Høj', medium: 'Medium', low: 'Lav' }

export default function Dashboard() {
  const [dash, setDash] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.getDashboardSummary().then(setDash).catch(console.error)
    api.getEmailStats().then(setStats).catch(console.error)
  }, [])

  return (
    <div className="p-6 md:p-8 animate-fadeIn space-y-6 max-w-none w-full">
      {/* Hilsen */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
          {dash ? greeting(dash.user_name) : 'Dashboard'}
        </h1>
        {dash && (
          <p className="text-slate-500 dark:text-zinc-500 text-sm mt-1">
            {dash.unread > 0
              ? `Du har ${dash.unread} ulæste emails — ${dash.high_priority > 0 ? `${dash.high_priority} med høj prioritet.` : 'ingen med høj prioritet.'}`
              : 'Indbakken er tom. Godt arbejde!'}
          </p>
        )}
      </div>

      {/* Stats-kort */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Mail className="w-5 h-5 text-indigo-500" />}
          bg="bg-indigo-50 dark:bg-indigo-500/10"
          label="Ulæste"
          value={dash?.unread ?? '—'}
          href="/inbox"
          accent="border-indigo-500"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          bg="bg-red-50 dark:bg-red-500/10"
          label="Høj prioritet"
          value={dash?.high_priority ?? '—'}
          href="/inbox"
          accent="border-red-500"
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5 text-purple-500" />}
          bg="bg-purple-50 dark:bg-purple-500/10"
          label="AI-forslag afventer"
          value={dash?.pending_suggestions ?? '—'}
          href="/inbox"
          accent="border-purple-500"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          bg="bg-emerald-50 dark:bg-emerald-500/10"
          label="Denne uge"
          value={dash?.week_total ?? '—'}
          href="/inbox"
          accent="border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top emails der haster */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Emails der haster
            </h2>
            <Link href="/inbox" className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Se alle →
            </Link>
          </div>
          {dash?.top_urgent && dash.top_urgent.length > 0 ? (
            <div className="space-y-2">
              {dash.top_urgent.map((e) => (
                <Link
                  key={e.id}
                  href={`/inbox/${e.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-transparent hover:border-slate-200 dark:hover:border-white/[0.08] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${urgencyColor[e.urgency] || urgencyColor.low}`}>
                      {urgencyLabel[e.urgency] || e.urgency}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 truncate">{e.subject}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-600 truncate">{e.from_address}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-zinc-700 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-zinc-600">
              <CheckCircle className="w-8 h-8 mb-2 text-emerald-400" />
              <p className="text-sm">Ingen emails kræver øjeblikkelig handling</p>
            </div>
          )}
        </div>

        {/* Højre kolonne: kategorier + prioriteter */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Kategorier
            </h2>
            <div className="space-y-2">
              {stats && Object.entries(stats.categories).length > 0 ? (
                Object.entries(stats.categories)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-zinc-400 capitalize">{cat}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-full w-16 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                            style={{ width: `${Math.min(100, (count / (stats?.total || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-zinc-500 w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-slate-400 dark:text-zinc-600">Ingen data endnu</p>
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Prioritet
            </h2>
            <div className="space-y-2">
              {[
                { key: 'high', label: 'Høj', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> },
                { key: 'medium', label: 'Medium', icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
                { key: 'low', label: 'Lav', icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" /> },
              ].map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm text-slate-600 dark:text-zinc-400">{label}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                    {stats?.urgency[key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon, bg, label, value, href, accent,
}: {
  icon: React.ReactNode
  bg: string
  label: string
  value: number | string
  href: string
  accent: string
}) {
  return (
    <Link
      href={href}
      className={`glass-card p-5 flex items-center gap-4 transition-all duration-200 group border-l-[3px] ${accent} hover:scale-[1.01]`}
    >
      <div className={`p-3 rounded-xl ${bg} flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{value}</p>
      </div>
    </Link>
  )
}
