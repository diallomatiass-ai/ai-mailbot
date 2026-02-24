'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import InboxList from '@/components/InboxList'
import { useTranslation } from '@/lib/i18n'

const categories = ['inquiry', 'complaint', 'order', 'support', 'spam', 'other']
const urgencies = ['high', 'medium', 'low']

export default function InboxPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeUrgency, setActiveUrgency] = useState<string | null>(null)

  const categoryLabels: Record<string, string> = {
    inquiry: t('inquiry'), complaint: t('complaint'), order: t('order'),
    support: t('support'), spam: t('spam'), other: t('other'),
  }
  const urgencyLabels: Record<string, string> = { high: t('high'), medium: t('medium'), low: t('low') }

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (activeCategory) params.category = activeCategory
      if (activeUrgency) params.urgency = activeUrgency
      const data = await api.listEmails(params)
      setEmails(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEmails() }, [activeCategory, activeUrgency])

  const pillClass = (active: boolean) =>
    `px-3 py-1 text-xs font-medium rounded-full border transition-all ${
      active
        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30'
        : 'bg-transparent text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-700 dark:hover:text-zinc-300'
    }`

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-3">{t('inbox')}</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveCategory(null)} className={pillClass(!activeCategory)}>{t('all')}</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={pillClass(activeCategory === cat)}>
              {categoryLabels[cat] || cat}
            </button>
          ))}
          <div className="w-px bg-slate-200 dark:bg-zinc-800 mx-1" />
          {urgencies.map((urg) => (
            <button key={urg} onClick={() => setActiveUrgency(activeUrgency === urg ? null : urg)} className={pillClass(activeUrgency === urg)}>
              {urgencyLabels[urg]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400 dark:text-zinc-600">{t('loading')}</div>
        ) : (
          <InboxList emails={emails} onSelect={(id) => router.push(`/inbox/${id}`)} />
        )}
      </div>
    </div>
  )
}
