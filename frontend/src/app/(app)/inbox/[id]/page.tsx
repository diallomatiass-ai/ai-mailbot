'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import EmailDetail from '@/components/EmailDetail'
import AiSuggestionCard from '@/components/AiSuggestionCard'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function EmailPage() {
  const params = useParams()
  const id = params.id as string
  const { t } = useTranslation()
  const [email, setEmail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEmail = async () => {
    try { const data = await api.getEmail(id); setEmail(data) }
    catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEmail() }, [id])

  const handleAction = async (suggestionId: string, action: string, editedText?: string) => {
    await api.actionSuggestion(suggestionId, action, editedText); await fetchEmail()
  }
  const handleSend = async (suggestionId: string) => {
    await api.sendSuggestion(suggestionId); await fetchEmail()
  }

  if (loading) return <div className="p-8 text-slate-400 dark:text-zinc-600">{t('loading')}</div>

  if (error || !email) {
    return (
      <div className="p-8">
        <p className="text-red-500 dark:text-red-400">{error || t('emailNotFound')}</p>
        <Link href="/inbox" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-sm mt-2 inline-block transition-colors">
          {t('backToInbox')}
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      <div className="p-4 border-b border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <Link href="/inbox" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </Link>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          <div className="lg:col-span-2 glass-card p-6">
            <EmailDetail email={email} />
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">{t('aiSuggestions')}</h3>
            {email.suggestions && email.suggestions.length > 0 ? (
              email.suggestions.map((s: any) => (
                <AiSuggestionCard key={s.id} suggestion={s} onAction={handleAction} onSend={handleSend} />
              ))
            ) : (
              <div className="glass-card p-4 text-sm text-slate-400 dark:text-zinc-600">
                {email.processed ? t('noSuggestions') : t('awaitingAi')}
              </div>
            )}
            {email.category && (
              <div className="glass-card p-4">
                <h4 className="text-sm font-medium text-slate-600 dark:text-zinc-400 mb-3">{t('classification')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-600">{t('category')}</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300 capitalize">{email.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-zinc-600">{t('priority')}</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300 capitalize">{email.urgency}</span>
                  </div>
                  {email.topic && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-zinc-600">{t('topic')}</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{email.topic}</span>
                    </div>
                  )}
                  {email.confidence != null && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-zinc-600">{t('confidence')}</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">{Math.round(email.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
