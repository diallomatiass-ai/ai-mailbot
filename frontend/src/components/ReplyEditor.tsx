'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Props {
  initialText: string
  onSave: (text: string) => void
  onCancel: () => void
}

export default function ReplyEditor({ initialText, onSave, onCancel }: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState(initialText)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="input-dark resize-y"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-zinc-600">
          {wordCount} {t('words')} / {text.length} {t('chars')}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-all"
          >
            {t('cancel')}
          </button>
          <button
            onClick={() => onSave(text)}
            className="btn-primary px-3 py-1.5 text-sm"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
