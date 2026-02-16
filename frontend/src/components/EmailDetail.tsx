'use client'

interface Email {
  from_address: string
  from_name: string | null
  to_address: string
  subject: string | null
  received_at: string | null
  body_text: string | null
  body_html: string | null
}

interface Props {
  email: Email
}

export default function EmailDetail({ email }: Props) {
  const date = email.received_at
    ? new Date(email.received_at).toLocaleString('da-DK', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : ''

  return (
    <div>
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {email.subject || '(Intet emne)'}
        </h2>
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-700">Fra:</span>{' '}
            {email.from_name ? `${email.from_name} <${email.from_address}>` : email.from_address}
          </p>
          <p>
            <span className="font-medium text-gray-700">Til:</span> {email.to_address}
          </p>
          <p>
            <span className="font-medium text-gray-700">Dato:</span> {date}
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700">
        {email.body_text ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {email.body_text}
          </pre>
        ) : email.body_html ? (
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: email.body_html }}
          />
        ) : (
          <p className="text-gray-400 italic">Ingen indhold</p>
        )}
      </div>
    </div>
  )
}
