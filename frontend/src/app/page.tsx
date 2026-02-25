'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import {
  Mail, Zap, Shield, ArrowRight, CheckCircle,
  Clock, Sparkles, ChevronRight,
} from 'lucide-react'

export default function LandingPage() {
  const { theme } = useTranslation()

  // Hvis brugeren allerede er logget ind, send til dashboard
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) window.location.replace('/dashboard')
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b]">
      {/* Baggrunds-effekter */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-indigo-500/8 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-purple-500/5 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,100,100,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.2) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-slate-200/60 dark:border-white/[0.05] bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image
            src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
            alt="Coas"
            width={110}
            height={33}
            className="object-contain"
            priority
          />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              Log ind
            </Link>
            <Link
              href="/gratis"
              className="px-4 py-2 btn-primary text-sm font-medium rounded-lg flex items-center gap-1.5"
            >
              Prøv gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center animate-slideUp">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            GDPR-venlig AI til danske virksomheder
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-zinc-50 leading-[1.1] mb-6 max-w-3xl mx-auto">
            Stop med at bruge
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              en time om dagen på mails
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            Coas læser, klassificerer og foreslår svar på dine kundemails.
            Du godkender med ét klik. Al data forbliver lokalt.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/gratis"
              className="px-7 py-3.5 btn-primary font-semibold rounded-xl text-base flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start 14 dages gratis prøve
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
            >
              Har du en konto? Log ind →
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-slate-500 dark:text-zinc-500">
            {['Ingen kreditkort', 'Fungerer med Gmail og Outlook', 'Annullér når som helst'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-500" />
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                title: 'Automatisk klassificering',
                desc: 'Tilbud, bookinger, reklamationer, fakturaer — sorteres automatisk når mailen lander i indbakken.',
              },
              {
                icon: Zap,
                color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
                title: 'Svarforslag på 3 sekunder',
                desc: 'AI skriver et udkast i din tone baseret på din videnbase og dine tidligere svar.',
              },
              {
                icon: Shield,
                color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                title: 'Du bestemmer — altid',
                desc: 'Intet sendes uden din godkendelse. Rediger, afvis eller godkend med ét enkelt klik.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="glass-card p-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sådan virker det */}
        <section className="border-t border-slate-200 dark:border-white/[0.05] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-3">
                Klar på under 10 minutter
              </h2>
              <p className="text-slate-500 dark:text-zinc-500">
                Fra tilmelding til første AI-svarforslag.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  icon: Clock,
                  title: 'Tilslut din mailkonto',
                  desc: 'Forbind Gmail eller Outlook sikkert via OAuth. Vi gemmer aldrig din adgangskode.',
                },
                {
                  step: '2',
                  icon: Sparkles,
                  title: 'AI læser og kategoriserer',
                  desc: 'Indgående mails analyseres automatisk og sorteres i kategorier.',
                },
                {
                  step: '3',
                  icon: CheckCircle,
                  title: 'Godkend med ét klik',
                  desc: 'AI foreslår svaret. Du godkender, tilretter eller afviser. Intet sendes uden din accept.',
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="flex gap-5">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {step}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Priser */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-3">
                Enkel prissætning
              </h2>
              <p className="text-slate-500 dark:text-zinc-500">
                Ingen skjulte gebyrer. Annullér når som helst.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Starter',
                  price: '499',
                  desc: '1 bruger · 1 mailkonto',
                  features: ['AI klassificering', 'Svarforslag', 'Skabeloner', 'Videnbase'],
                  highlight: false,
                },
                {
                  name: 'Pro',
                  price: '999',
                  desc: '5 brugere · 3 mailkonti',
                  features: ['Alt i Starter', 'Prioriteret AI', 'Analytics', 'E-mail support'],
                  highlight: true,
                },
                {
                  name: 'Business',
                  price: '2.499',
                  desc: '20 brugere · 10 mailkonti',
                  features: ['Alt i Pro', 'Dedikeret support', 'Custom prompts', 'SLA'],
                  highlight: false,
                },
              ].map(({ name, price, desc, features, highlight }) => (
                <div
                  key={name}
                  className={`glass-card p-6 flex flex-col ${highlight ? 'ring-2 ring-indigo-500/50 dark:ring-indigo-400/40' : ''}`}
                >
                  {highlight && (
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-3">
                      Mest populær
                    </div>
                  )}
                  <h3 className="font-bold text-lg text-slate-800 dark:text-zinc-200">{name}</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-500 mt-0.5 mb-4">{desc}</p>
                  <div className="mb-5">
                    <span className="text-3xl font-bold text-slate-900 dark:text-zinc-100">{price}</span>
                    <span className="text-slate-500 dark:text-zinc-500 text-sm"> kr/md</span>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/gratis"
                    className={`w-full py-2.5 rounded-lg text-sm font-medium text-center transition-all ${
                      highlight
                        ? 'btn-primary'
                        : 'border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Kom i gang
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-zinc-500 mt-6">
              Alle pakker inkluderer 14 dages gratis prøveperiode.
            </p>
          </div>
        </section>

        {/* Bundlinje CTA */}
        <section className="border-t border-slate-200 dark:border-white/[0.05] py-24">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-4">
              Klar til at spare tid?
            </h2>
            <p className="text-slate-500 dark:text-zinc-500 mb-8">
              Tilmeld dig gratis og se selv — det tager under 2 minutter.
            </p>
            <Link
              href="/gratis"
              className="inline-flex items-center gap-2 px-8 py-4 btn-primary font-semibold rounded-xl text-lg"
            >
              Start din gratis prøveperiode
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-zinc-600">
          <span>© {new Date().getFullYear()} Coas — Din AI-assistent</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-indigo-500 transition-colors">Privatlivspolitik</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Vilkår</a>
            <a href="/afmeld" className="hover:text-indigo-500 transition-colors">Afmeld emails</a>
            <a href="mailto:hej@ahmes.dk" className="hover:text-indigo-500 transition-colors">hej@ahmes.dk</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
