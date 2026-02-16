'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import InboxList from '@/components/InboxList'
import { Search } from 'lucide-react'

const categories = ['inquiry', 'complaint', 'order', 'support', 'spam', 'other']
const urgencies = ['high', 'medium', 'low']

const categoryLabels: Record<string, string> = {
  inquiry: 'Foresp.',
  complaint: 'Klage',
  order: 'Ordre',
  support: 'Support',
  spam: 'Spam',
  other: 'Andet',
}

export default function InboxPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeUrgency, setActiveUrgency] = useState<string | null>(null)

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (activeCategory) params.category = activeCategory
      if (activeUrgency) params.urgency = activeUrgency
      const data = await api.listEmails(params)
      setEmails(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [activeCategory, activeUrgency])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Indbakke</h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              !activeCategory ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                activeCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}

          <div className="w-px bg-gray-300 mx-1" />

          {urgencies.map((urg) => (
            <button
              key={urg}
              onClick={() => setActiveUrgency(activeUrgency === urg ? null : urg)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                activeUrgency === urg ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {urg === 'high' ? 'Hoej' : urg === 'medium' ? 'Medium' : 'Lav'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Indlaeser...</div>
        ) : (
          <InboxList
            emails={emails}
            onSelect={(id) => router.push(`/inbox/${id}`)}
          />
        )}
      </div>
    </div>
  )
}
