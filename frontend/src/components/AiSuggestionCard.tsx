'use client'

import { useState } from 'react'
import { Bot, Check, Pencil, X, Send, MessageSquare, Loader2, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import ReplyEditor from './ReplyEditor'
import { useTranslation } from '@/lib/i18n'

interface Suggestion { id: string; suggested_text: string; status: string; edited_text: string | null; sent_at: string | null }
interface Props { suggestion: Suggestion; onAction: (id: string, action: string, editedText?: string) => Promise<void>; onSend: (id: string) => Promise<void> }

export default function AiSuggestionCard({ suggestion, onAction, onSend }: Props) {
  const { t, locale } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState('')
  const [refining, setRefining] = useState(false)
  const [refinedText, setRefinedText] = useState<string | null>(null)

  const statusBadge: Record<string, string> = {
    pending: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
    approved: 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400',
    edited: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
    rejected: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400',
  }
  const statusLabel: Record<string, string> = { pending: t('pending'), approved: t('approved'), edited: t('edited'), rejected: t('rejected') }

  const handleAction = async (action: string, editedText?: string) => {
    setLoading(true)
    try { await onAction(suggestion.id, action, editedText); setEditing(false) } finally { setLoading(false) }
  }
  const handleSend = async () => { setLoading(true); try { await onSend(suggestion.id) } finally { setLoading(false) } }
  const handleRefine = async () => {
    if (!chatPrompt.trim()) return
    setRefining(true)
    try {
      const currentText = refinedText || suggestion.edited_text || suggestion.suggested_text
      const res = await api.refineSuggestion(suggestion.id, chatPrompt.trim(), currentText)
      setRefinedText(res.refined_text); setChatPrompt('')
    } catch (err) { console.error('Refine failed:', err) }
    finally { setRefining(false) }
  }
  const handleApplyRefined = async () => { if (!refinedText) return; await handleAction('edit', refinedText); setRefinedText(null); setChatOpen(false) }

  const displayText = refinedText || suggestion.edited_text || suggestion.suggested_text

  return (
    <div className="gradient-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-teal-50 dark:bg-accent/10">
            <Bot className="w-4 h-4 text-brand-navy dark:text-accent" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">{t('aiSuggestion')}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[suggestion.status] || ''}`}>
          {statusLabel[suggestion.status] || suggestion.status}
        </span>
      </div>

      {editing ? (
        <ReplyEditor initialText={suggestion.suggested_text} onSave={(text) => handleAction('edit', text)} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg p-3 mb-3 border border-slate-100 dark:border-white/[0.04]">
            <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">{displayText}</p>
          </div>

          <div className="flex flex-col gap-2">
            {suggestion.status === 'pending' && (
              <>
                <div className="flex gap-2">
                  <button onClick={() => handleAction('approve')} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 disabled:opacity-50 transition-all">
                    <Check className="w-3.5 h-3.5" /> {t('approve')}
                  </button>
                  <button onClick={() => setEditing(true)} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-brand-navy dark:text-accent bg-teal-50 dark:bg-accent/10 border border-accent/30 dark:border-accent/20 rounded-lg hover:bg-teal-100 dark:hover:bg-accent/20 disabled:opacity-50 transition-all">
                    <Pencil className="w-3.5 h-3.5" /> {t('edit')}
                  </button>
                  <button onClick={() => handleAction('reject')} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 transition-all">
                    <X className="w-3.5 h-3.5" /> {t('reject')}
                  </button>
                </div>
                <button onClick={() => setChatOpen(!chatOpen)} disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-brand-navy dark:text-accent bg-teal-50 dark:bg-accent/10 border border-accent/20 dark:border-accent/20 rounded-lg hover:bg-accent/10 dark:hover:bg-accent/20 disabled:opacity-50 transition-all">
                  <MessageSquare className="w-3.5 h-3.5" /> {t('refineWithAi')}
                </button>
              </>
            )}
            {(suggestion.status === 'approved' || suggestion.status === 'edited') && !suggestion.sent_at && (
              <button onClick={handleSend} disabled={loading} className="w-full flex items-center justify-center gap-1.5 btn-primary px-4 py-2 text-sm">
                <Send className="w-4 h-4" /> {t('sendReply')}
              </button>
            )}
            {suggestion.sent_at && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium text-center">
                {t('sent')} {new Date(suggestion.sent_at).toLocaleString(locale === 'da' ? 'da-DK' : 'en-US')}
              </span>
            )}
          </div>

          {chatOpen && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-navy dark:text-accent" />
                <span className="text-xs font-medium text-brand-navy dark:text-accent">{t('refineTitle')}</span>
              </div>
              {refinedText && (
                <div className="bg-teal-50 dark:bg-brand-teal/10 border border-accent/20 dark:border-accent/15 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">{refinedText}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleApplyRefined} disabled={loading}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-md hover:bg-green-100 dark:hover:bg-green-500/20 transition-all">
                      <Check className="w-3 h-3" /> {t('apply')}
                    </button>
                    <button onClick={() => setRefinedText(null)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all">
                      <X className="w-3 h-3" /> {t('discard')}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input type="text" value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleRefine()}
                  placeholder={t('refinePlaceholder')} disabled={refining}
                  className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-accent/60 dark:focus:border-accent/40 focus:ring-1 focus:ring-accent/20 dark:focus:ring-accent/20 disabled:opacity-50 transition-all" />
                <button onClick={handleRefine} disabled={refining || !chatPrompt.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-brand-navy dark:text-accent bg-teal-50 dark:bg-accent/15 border border-accent/20 dark:border-accent/25 rounded-lg hover:bg-accent/10 dark:hover:bg-accent/25 disabled:opacity-50 transition-all">
                  {refining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-600 mt-1.5">{t('refineHint')}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
