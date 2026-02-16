'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Mail, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface Stats {
  total: number
  unread: number
  categories: Record<string, number>
  urgency: Record<string, number>
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    api.getEmailStats().then(setStats).catch(console.error)
  }, [])

  if (!stats) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <p className="text-gray-500">Indlaeser...</p>
      </div>
    )
  }

  const urgencyConfig: Record<string, { color: string; icon: typeof AlertTriangle }> = {
    high: { color: 'text-red-600 bg-red-50', icon: AlertTriangle },
    medium: { color: 'text-yellow-600 bg-yellow-50', icon: Clock },
    low: { color: 'text-green-600 bg-green-50', icon: CheckCircle },
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total emails</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ulaeste</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Behandlede</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total - stats.unread}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategorier</h2>
          <div className="space-y-3">
            {Object.entries(stats.categories).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{cat}</span>
                <span className="px-2.5 py-0.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  {count}
                </span>
              </div>
            ))}
            {Object.keys(stats.categories).length === 0 && (
              <p className="text-sm text-gray-400">Ingen data endnu</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Prioritet</h2>
          <div className="space-y-3">
            {['high', 'medium', 'low'].map((level) => {
              const config = urgencyConfig[level]
              const Icon = config.icon
              const count = stats.urgency[level] || 0
              return (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color.split(' ')[0]}`} />
                    <span className="text-sm text-gray-600 capitalize">
                      {level === 'high' ? 'Hoej' : level === 'medium' ? 'Medium' : 'Lav'}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
