'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  category: string | null
  body: string
  usage_count: number
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', category: '', body: '' })

  const fetchTemplates = async () => {
    try {
      const data = await api.listTemplates()
      setTemplates(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.updateTemplate(editId, {
          name: form.name,
          category: form.category || undefined,
          body: form.body,
        })
      } else {
        await api.createTemplate({
          name: form.name,
          category: form.category || undefined,
          body: form.body,
        })
      }
      setForm({ name: '', category: '', body: '' })
      setShowForm(false)
      setEditId(null)
      fetchTemplates()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (t: Template) => {
    setForm({ name: t.name, category: t.category || '', body: t.body })
    setEditId(t.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Slet denne skabelon?')) return
    await api.deleteTemplate(id)
    fetchTemplates()
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Skabeloner</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', category: '', body: '' }) }}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Ny skabelon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editId ? 'Rediger skabelon' : 'Ny skabelon'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="">Ingen</option>
                <option value="inquiry">Foresp.</option>
                <option value="complaint">Klage</option>
                <option value="order">Ordre</option>
                <option value="support">Support</option>
                <option value="other">Andet</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Indhold</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-y"
            />
          </div>
          <div className="flex gap-2">
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
      ) : templates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
          Ingen skabeloner endnu. Opret din foerste skabelon ovenfor.
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{t.name}</h3>
                    {t.category && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        {t.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">Brugt {t.usage_count}x</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{t.body}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => handleEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600">
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
