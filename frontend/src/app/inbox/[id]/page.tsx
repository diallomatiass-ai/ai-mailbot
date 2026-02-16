'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import EmailDetail from '@/components/EmailDetail'
import AiSuggestionCard from '@/components/AiSuggestionCard'
import { ArrowLeft } from 'lucide-react'

export default function EmailPage() {
  const params = useParams()
  const id = params.id as string
  const [email, setEmail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEmail = async () => {
    try {
      const data = await api.getEmail(id)
      setEmail(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmail()
  }, [id])

  const handleAction = async (suggestionId: string, action: string, editedText?: string) => {
    await api.actionSuggestion(suggestionId, action, editedText)
    await fetchEmail()
  }

  const handleSend = async (suggestionId: string) => {
    await api.sendSuggestion(suggestionId)
    await fetchEmail()
  }

  if (loading) {
    return <div className="p-8 text-gray-400">Indlaeser...</div>
  }

  if (error || !email) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || 'Email ikke fundet'}</p>
        <Link href="/inbox" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Tilbage til indbakke
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <Link href="/inbox" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Tilbage
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
          {/* Email content */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <EmailDetail email={email} />
          </div>

          {/* AI suggestions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              AI-forslag
            </h3>
            {email.suggestions && email.suggestions.length > 0 ? (
              email.suggestions.map((s: any) => (
                <AiSuggestionCard
                  key={s.id}
                  suggestion={s}
                  onAction={handleAction}
                  onSend={handleSend}
                />
              ))
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-400">
                {email.processed ? 'Ingen forslag genereret' : 'Afventer AI-behandling...'}
              </div>
            )}

            {/* Classification info */}
            {email.category && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Klassificering</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kategori</span>
                    <span className="font-medium text-gray-700 capitalize">{email.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prioritet</span>
                    <span className="font-medium text-gray-700 capitalize">{email.urgency}</span>
                  </div>
                  {email.topic && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Emne</span>
                      <span className="font-medium text-gray-700">{email.topic}</span>
                    </div>
                  )}
                  {email.confidence != null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sikkerhed</span>
                      <span className="font-medium text-gray-700">{Math.round(email.confidence * 100)}%</span>
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
