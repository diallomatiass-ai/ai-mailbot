'use client'

import { useTranslation } from '@/lib/i18n'

interface Email { from_address: string; from_name: string | null; to_address: string; subject: string | null; received_at: string | null; body_text: string | null; body_html: string | null }
interface Props { email: Email }

export default function EmailDetail({ email }: Props) {
  const { t, locale } = useTranslation()
  const date = email.received_at
    ? new Date(email.received_at).toLocaleString(locale === 'da' ? 'da-DK' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div>
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-3">{email.subject || t('noSubject')}</h2>
        <div className="space-y-1.5 text-sm">
          <p className="text-slate-500 dark:text-zinc-400">
            <span className="font-medium text-slate-700 dark:text-zinc-300">{t('from')}</span>{' '}
            {email.from_name ? `${email.from_name} <${email.from_address}>` : email.from_address}
          </p>
          <p className="text-slate-500 dark:text-zinc-400">
            <span className="font-medium text-slate-700 dark:text-zinc-300">{t('to')}</span> {email.to_address}
          </p>
          <p className="text-slate-500 dark:text-zinc-400">
            <span className="font-medium text-slate-700 dark:text-zinc-300">{t('date')}</span> {date}
          </p>
        </div>
      </div>
      <div className="text-slate-700 dark:text-zinc-300">
        {email.body_text ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{email.body_text}</pre>
        ) : email.body_html ? (
          <div className="text-sm prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: email.body_html }} />
        ) : (
          <p className="text-slate-400 dark:text-zinc-600 italic">{t('noContent')}</p>
        )}
      </div>
    </div>
  )
}
