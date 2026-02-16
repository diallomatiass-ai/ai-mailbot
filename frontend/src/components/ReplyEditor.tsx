'use client'

import { useState } from 'react'

interface Props {
  initialText: string
  onSave: (text: string) => void
  onCancel: () => void
}

export default function ReplyEditor({ initialText, onSave, onCancel }: Props) {
  const [text, setText] = useState(initialText)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-y"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {wordCount} ord / {text.length} tegn
        </span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuller
          </button>
          <button
            onClick={() => onSave(text)}
            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Gem
          </button>
        </div>
      </div>
    </div>
  )
}
