'use client'

const categoryColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-700',
  complaint: 'bg-red-100 text-red-700',
  order: 'bg-green-100 text-green-700',
  support: 'bg-yellow-100 text-yellow-700',
  spam: 'bg-gray-100 text-gray-500',
  other: 'bg-purple-100 text-purple-700',
}

const urgencyDots: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Nu'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}t`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

interface Email {
  id: string
  from_address: string
  from_name: string | null
  subject: string | null
  received_at: string | null
  is_read: boolean
  is_replied: boolean
  category: string | null
  urgency: string | null
  has_suggestion: boolean
}

interface Props {
  emails: Email[]
  onSelect: (id: string) => void
  selectedId?: string
}

export default function InboxList({ emails, onSelect, selectedId }: Props) {
  if (emails.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        Ingen emails fundet
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelect(email.id)}
          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
            selectedId === email.id ? 'bg-blue-50' : ''
          }`}
        >
          {/* Unread dot */}
          <div className="pt-1.5 flex-shrink-0">
            {!email.is_read ? (
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            ) : (
              <div className="w-2.5 h-2.5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                {email.from_name || email.from_address}
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {timeAgo(email.received_at)}
              </span>
            </div>

            <p className={`text-sm truncate mt-0.5 ${!email.is_read ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
              {email.subject || '(Intet emne)'}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              {email.category && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[email.category] || categoryColors.other}`}>
                  {email.category}
                </span>
              )}
              {email.urgency && (
                <div className={`w-2 h-2 rounded-full ${urgencyDots[email.urgency] || ''}`} />
              )}
              {email.has_suggestion && (
                <span className="text-xs text-blue-500">AI</span>
              )}
              {email.is_replied && (
                <span className="text-xs text-green-500">Besvaret</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
