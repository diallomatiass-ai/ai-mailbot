'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Settings, Mail, Trash2, LogOut } from 'lucide-react'

interface Account {
  id: string
  provider: string
  email_address: string
  is_active: boolean
  created_at: string
}

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const fetchAccounts = async () => {
    try {
      const data = await api.listAccounts()
      setAccounts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAccounts() }, [])

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    setConnecting(true)
    try {
      const fn = provider === 'gmail' ? api.connectGmail : api.connectOutlook
      const data = await fn()
      window.open(data.auth_url, '_blank')
    } catch (err) {
      console.error(err)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async (id: string) => {
    if (!confirm('Fjern denne mailkonto?')) return
    await api.disconnectAccount(id)
    fetchAccounts()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Indstillinger</h1>
      </div>

      {/* Connected accounts */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Mailkonti</h2>
          <p className="text-sm text-gray-500 mt-1">Forbind dine mailkonti for at modtage og sende emails.</p>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-400 text-sm">Indlaeser...</p>
          ) : (
            <>
              {accounts.length > 0 && (
                <div className="space-y-3 mb-6">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{acc.email_address}</p>
                          <p className="text-xs text-gray-500 capitalize">{acc.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${acc.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <button
                          onClick={() => handleDisconnect(acc.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleConnect('gmail')}
                  disabled={connecting}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
                  Forbind Gmail
                </button>
                <button
                  onClick={() => handleConnect('outlook')}
                  disabled={connecting}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.58a.782.782 0 0 1-.578.236h-8.307v-8.16l1.87 1.358a.327.327 0 0 0 .39 0l6.863-4.973V7.387Zm-9.123-1.39h8.307c.224 0 .414.076.57.228.155.152.236.34.246.564l-7.286 5.282-1.837-1.334V5.997ZM13.543 3v18L0 18.246V2.754L13.543 3Z"/><ellipse cx="6.772" cy="11.641" fill="#0078D4" rx="3.5" ry="4.5"/></svg>
                  Forbind Outlook
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" /> Log ud
        </button>
      </div>
    </div>
  )
}
