'use client'

import { useState } from 'react'
import { Bot, Check, Pencil, X, Send } from 'lucide-react'
import ReplyEditor from './ReplyEditor'

interface Suggestion {
  id: string
  suggested_text: string
  status: string
  edited_text: string | null
  sent_at: string | null
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  edited: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
}

const statusLabel: Record<string, string> = {
  pending: 'Afventer',
  approved: 'Godkendt',
  edited: 'Redigeret',
  rejected: 'Afvist',
}

interface Props {
  suggestion: Suggestion
  onAction: (id: string, action: string, editedText?: string) => Promise<void>
  onSend: (id: string) => Promise<void>
}

export default function AiSuggestionCard({ suggestion, onAction, onSend }: Props) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: string, editedText?: string) => {
    setLoading(true)
    try {
      await onAction(suggestion.id, action, editedText)
      setEditing(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    setLoading(true)
    try {
      await onSend(suggestion.id)
    } finally {
      setLoading(false)
    }
  }

  const displayText = suggestion.edited_text || suggestion.suggested_text

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">AI-forslag</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[suggestion.status] || ''}`}>
          {statusLabel[suggestion.status] || suggestion.status}
        </span>
      </div>

      {editing ? (
        <ReplyEditor
          initialText={suggestion.suggested_text}
          onSave={(text) => handleAction('edit', text)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{displayText}</p>
          </div>

          <div className="flex items-center gap-2">
            {suggestion.status === 'pending' && (
              <>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Godkend
                </button>
                <button
                  onClick={() => setEditing(true)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                >
                  <Pencil className="w-4 h-4" /> Rediger
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Afvis
                </button>
              </>
            )}

            {(suggestion.status === 'approved' || suggestion.status === 'edited') && !suggestion.sent_at && (
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Send svar
              </button>
            )}

            {suggestion.sent_at && (
              <span className="text-sm text-green-600 font-medium">
                Sendt {new Date(suggestion.sent_at).toLocaleString('da-DK')}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
