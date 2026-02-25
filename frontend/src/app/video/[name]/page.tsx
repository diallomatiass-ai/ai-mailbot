'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { CheckCircle, ArrowRight, Play, Clock } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Indsæt dit Sendspark / Loom embed-link herunder.
//
// Sendspark personaliseret video:
//   1. Upload din video til Sendspark (app.sendspark.com)
//   2. Aktiver "Dynamic Text" og brug {name} variablen
//   3. Erstat SENDSPARK_VIDEO_ID med dit video-ID
//
// Loom:
//   1. Upload til Loom, kopier embed-URL
//   2. Erstat hele iframe src
// ─────────────────────────────────────────────────────────────────────────────
const VIDEO_EMBED_URL = '' // TODO: 'https://app.sendspark.com/embed/SENDSPARK_VIDEO_ID'

interface Props {
  params: { name: string }
}

export default function VideoPage({ params }: Props) {
  const { theme } = useTranslation()

  // Dekod URL-encoded navn og kapitaliser hvert ord
  const displayName = decodeURIComponent(params.name)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-indigo-500/8 blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-center px-6 py-5">
        <Image
          src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
          alt="Coas"
          width={120}
          height={36}
          className="object-contain"
          priority
        />
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8 animate-slideUp">
        {/* Personaliseret hilsen */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            90 sekunder · Lavet specielt til dig
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-zinc-100">
            Hej {displayName} 👋
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
            Jeg viser dig præcis, hvordan Coas kan spare dig{' '}
            <span className="font-semibold text-slate-800 dark:text-zinc-200">50 minutter om dagen</span>{' '}
            på kundemails.
          </p>
        </div>

        {/* Video embed */}
        <div className="glass-card overflow-hidden mb-8 shadow-lg">
          {VIDEO_EMBED_URL ? (
            <iframe
              src={`${VIDEO_EMBED_URL}?name=${encodeURIComponent(displayName)}`}
              className="w-full aspect-video border-0"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            // Placeholder — vises indtil VIDEO_EMBED_URL er sat
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-700 shadow-lg flex items-center justify-center">
                <Play className="w-7 h-7 text-indigo-600 dark:text-indigo-400 ml-1" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                  Video til {displayName}
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-600 mt-1">
                  Indsæt VIDEO_EMBED_URL i <code className="font-mono">video/[name]/page.tsx</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hvad du så i videoen */}
        <div className="glass-card p-6 mb-6">
          <h2 className="font-semibold text-slate-800 dark:text-zinc-200 mb-4 text-sm uppercase tracking-wide">
            Det du lige så:
          </h2>
          <ul className="space-y-3">
            {[
              'AI læser alle indgående mails automatisk — ingen manuel sortering',
              'Klassificerer dem i kategorier: tilbud, booking, reklamation, faktura',
              'Skriver et svarforslag i din tone på under 3 sekunder',
              'Du godkender med ét klik — eller redigerer frit inden afsendelse',
              'Al data forbliver lokalt — 100% GDPR-venlig, ingen cloud',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-zinc-400">
                <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Priser */}
        <div className="glass-card p-5 mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              Starter-pakke
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
              1 bruger · 1 mailkonto · Fuld adgang
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
              499 <span className="text-base font-normal">kr/md</span>
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              De første 14 dage er gratis
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <Link
            href="/gratis"
            className="inline-flex items-center gap-2 px-8 py-4 btn-primary font-semibold rounded-xl text-lg w-full justify-center"
          >
            Start din gratis prøveperiode
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-slate-400 dark:text-zinc-600">
            14 dage gratis · Ingen kreditkort · Annullér når som helst
          </p>
        </div>

        {/* Svar-garanti */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-zinc-600">
            Spørgsmål? Skriv direkte til{' '}
            <a
              href="mailto:hej@ahmes.dk"
              className="text-indigo-500 hover:underline"
            >
              hej@ahmes.dk
            </a>{' '}
            — vi svarer inden for 24 timer.
          </p>
        </div>
      </main>
    </div>
  )
}
