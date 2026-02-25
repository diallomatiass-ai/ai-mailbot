'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import InboxList from '@/components/InboxList'
import EmailDetail from '@/components/EmailDetail'
import AiSuggestionCard from '@/components/AiSuggestionCard'
import { useTranslation } from '@/lib/i18n'
import { Sparkles, Loader2, Mail } from 'lucide-react'

const categories = ['tilbud', 'booking', 'reklamation', 'faktura', 'leverandor', 'intern', 'spam', 'andet']
const urgencies = ['high', 'medium', 'low']

export default function InboxPage() {
  const { t } = useTranslation()
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeUrgency, setActiveUrgency] = useState<string | null>(null)

  const categoryLabels: Record<string, string> = {
    tilbud: t('tilbud'), booking: t('booking'), reklamation: t('reklamation'),
    faktura: t('faktura'), leverandor: t('leverandor'), intern: t('intern'),
    spam: t('spam'), andet: t('andet'),
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

  const fetchSelected = async (id: string) => {
    setLoadingEmail(true)
    try {
      const data = await api.getEmail(id)
      setSelectedEmail(data)
    } catch (err) { console.error(err) }
    finally { setLoadingEmail(false) }
  }

  useEffect(() => { fetchEmails() }, [activeCategory, activeUrgency])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    fetchSelected(id)
    // Mark as read in list optimistically
    setEmails(prev => prev.map(e => e.id === id ? { ...e, is_read: true } : e))
  }

  const handleAction = async (suggestionId: string, action: string, editedText?: string) => {
    await api.actionSuggestion(suggestionId, action, editedText)
    if (selectedId) fetchSelected(selectedId)
  }

  const handleSend = async (suggestionId: string) => {
    await api.sendSuggestion(suggestionId)
    if (selectedId) fetchSelected(selectedId)
  }

  const handleGenerate = async () => {
    if (!selectedId) return
    setGenerating(true)
    try {
      await api.generateSuggestion(selectedId)
      fetchSelected(selectedId)
    } catch (err: any) { alert(err.message) }
    finally { setGenerating(false) }
  }

  const pillClass = (active: boolean) =>
    `px-3 py-1 text-xs font-medium rounded-full border transition-all ${
      active
        ? 'bg-teal-50 dark:bg-accent/15 text-brand-navy dark:text-accent border-accent/30 dark:border-accent/30'
        : 'bg-transparent text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:text-slate-700 dark:hover:text-zinc-300'
    }`

  const hasSuggestions = selectedEmail?.suggestions?.length > 0

  return (
    <div className="h-full flex flex-col">
      {/* Filter-bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex-shrink-0">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setActiveCategory(null)} className={pillClass(!activeCategory)}>{t('all')}</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={pillClass(activeCategory === cat)}>
              {categoryLabels[cat] || cat}
            </button>
          ))}
          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />
          {urgencies.map(urg => (
            <button key={urg} onClick={() => setActiveUrgency(activeUrgency === urg ? null : urg)} className={pillClass(activeUrgency === urg)}>
              {urgencyLabels[urg]}
            </button>
          ))}
        </div>
      </div>

      {/* Split-pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Venstre: email-liste */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-white/[0.06] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-slate-400 dark:text-zinc-600 text-sm">{t('loading')}</div>
          ) : (
            <InboxList emails={emails} onSelect={handleSelect} selectedId={selectedId ?? undefined} />
          )}
        </div>

        {/* Højre: email + AI */}
        <div className="flex-1 flex overflow-hidden">
          {selectedEmail ? (
            <>
              {/* Email-indhold */}
              <div className="flex-1 overflow-y-auto p-6">
                <EmailDetail email={selectedEmail} />
              </div>

              {/* AI-panel */}
              <div className="w-96 flex-shrink-0 border-l border-slate-200 dark:border-white/[0.06] overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-zinc-900/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('aiSuggestions')}</h3>
                  {!hasSuggestions && (
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-brand-navy hover:bg-brand-navy-hover text-white disabled:opacity-50 transition-colors"
                    >
                      {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {generating ? 'Genererer...' : 'Generer'}
                    </button>
                  )}
                </div>

                {loadingEmail ? (
                  <div className="text-sm text-slate-400 dark:text-zinc-600">{t('loading')}</div>
                ) : hasSuggestions ? (
                  selectedEmail.suggestions.map((s: any) => (
                    <AiSuggestionCard key={s.id} suggestion={s} onAction={handleAction} onSend={handleSend} />
                  ))
                ) : (
                  <div className="glass-card p-4 text-sm text-slate-400 dark:text-zinc-600">
                    <p className="mb-3">{t('awaitingAi')}</p>
                  </div>
                )}

                {selectedEmail.category && (
                  <div className="glass-card p-4">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3">{t('classification')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-zinc-600">{t('category')}</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300 capitalize">{selectedEmail.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-zinc-600">{t('priority')}</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300 capitalize">{selectedEmail.urgency}</span>
                      </div>
                      {selectedEmail.topic && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 dark:text-zinc-600">{t('topic')}</span>
                          <span className="font-medium text-slate-700 dark:text-zinc-300 text-right max-w-[60%]">{selectedEmail.topic}</span>
                        </div>
                      )}
                      {selectedEmail.confidence != null && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 dark:text-zinc-600">{t('confidence')}</span>
                          <span className="font-medium text-brand-navy dark:text-accent">{Math.round(selectedEmail.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 gap-3">
              <Mail className="w-12 h-12 opacity-20" />
              <p className="text-sm">Vælg en email for at læse den</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
