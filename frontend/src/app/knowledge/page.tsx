'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'

interface KnowledgeEntry {
  id: string
  entry_type: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

const typeLabels: Record<string, string> = {
  faq: 'FAQ',
  pricing: 'Priser',
  hours: 'Aab.tider',
  tone: 'Tone',
}

const allTypes = ['faq', 'pricing', 'hours', 'tone']

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<string>('faq')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ entry_type: 'faq', title: '', content: '' })

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const data = await api.listKnowledge(activeType)
      setEntries(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEntries() }, [activeType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.updateKnowledge(editId, form)
      } else {
        await api.createKnowledge(form)
      }
      setForm({ entry_type: activeType, title: '', content: '' })
      setShowForm(false)
      setEditId(null)
      fetchEntries()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (entry: KnowledgeEntry) => {
    setForm({ entry_type: entry.entry_type, title: entry.title, content: entry.content })
    setEditId(entry.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Slet denne post?')) return
    await api.deleteKnowledge(id)
    fetchEntries()
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Videnbase</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ entry_type: activeType, title: '', content: '' }) }}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Ny post
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Tilfoej virksomhedsinfo som AI'en bruger til at generere bedre svar.
      </p>

      {/* Type tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {allTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeType === type
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editId ? 'Rediger post' : 'Ny post'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.entry_type}
                onChange={(e) => setForm({ ...form, entry_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                {allTypes.map((t) => (
                  <option key={t} value={t}>{typeLabels[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indhold</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-y"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              {editId ? 'Gem' : 'Opret'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuller
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Indlaeser...</p>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
          Ingen {typeLabels[activeType]?.toLowerCase()}-poster endnu.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{entry.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{entry.content}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => handleEdit(entry)} className="p-1.5 text-gray-400 hover:text-blue-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
