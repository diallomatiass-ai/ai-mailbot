'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { CheckCircle, MailX } from 'lucide-react'

// Denne side håndterer GDPR-unsubscribe fra email-kampagner.
// URL-format: /afmeld?email=martin%40jensens-vvs.dk
//
// TODO: Tilslut til dit email-system (Instantly.ai webhook eller egen liste)
// Instantly.ai unsubscribe webhook:
//   POST https://api.instantly.ai/api/v1/lead/unsubscribe
//   Body: { api_key, email }

export default function AfmeldPage() {
  const { theme } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [])

  const handleUnsubscribe = async () => {
    if (!email) return
    setStatus('loading')

    try {
      // TODO: Erstat med dit faktiske unsubscribe-endpoint
      // Eks. Instantly.ai:
      // await fetch('https://api.instantly.ai/api/v1/lead/unsubscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ api_key: process.env.NEXT_PUBLIC_INSTANTLY_KEY, email }),
      // })

      // Simuler API-kald indtil endpoint er sat op
      await new Promise((r) => setTimeout(r, 800))
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] flex flex-col items-center justify-center px-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-accent/6 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slideUp">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
            alt="Coas"
            width={160}
            height={124}
            className="object-contain h-10 w-auto opacity-60"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-lg dark:shadow-none backdrop-blur-xl p-8 text-center">
          {status === 'done' ? (
            <>
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
                Du er afmeldt
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">
                <span className="font-medium text-slate-700 dark:text-zinc-300">{email}</span> modtager
                ikke flere emails fra Coas. Det kan tage op til 48 timer.
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-600 mt-4">
                Fortryder du?{' '}
                <a href="mailto:hej@ahmes.dk" className="text-accent hover:underline">
                  Skriv til os
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <MailX className="w-7 h-7 text-slate-500 dark:text-zinc-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
                Afmeld emails fra Coas
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6 leading-relaxed">
                {email
                  ? <>Vi sender ikke flere emails til <span className="font-medium text-slate-700 dark:text-zinc-300">{email}</span>.</>
                  : 'Bekræft din email-adresse for at afmelde.'}
              </p>

              {!email && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.dk"
                  className="input-dark mb-4"
                />
              )}

              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                  Noget gik galt. Prøv igen eller skriv til hej@ahmes.dk.
                </div>
              )}

              <button
                onClick={handleUnsubscribe}
                disabled={!email || status === 'loading'}
                className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-sm font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    Afmelder...
                  </>
                ) : (
                  'Bekræft afmelding'
                )}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-zinc-600 mt-6">
          Coas · GDPR-venlig dansk tjeneste ·{' '}
          <a href="mailto:hej@ahmes.dk" className="hover:text-accent transition-colors">
            hej@ahmes.dk
          </a>
        </p>
      </div>
    </div>
  )
}
