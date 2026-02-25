'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { CheckCircle, Mail, Zap, Shield, ArrowRight, Star, Lock } from 'lucide-react'

export default function GratisPage() {
  const { theme } = useTranslation()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fornavn, setFornavn] = useState('')
  const [efternavn, setEfternavn] = useState('')
  const [firma, setFirma] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.register({
        email,
        name: `${fornavn} ${efternavn}`.trim(),
        password,
        company_name: firma || undefined,
      })
      const data = await api.login(email, password)
      localStorage.setItem('token', data.access_token)
      setStep('success')
      setTimeout(() => { window.location.href = '/dashboard' }, 3000)
    } catch (err: any) {
      setError(err.message || 'Noget gik galt. Prøv igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-accent/8 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-brand-teal/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(100,100,100,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.2) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Image
          src={theme === 'dark' ? '/logo-dark.png' : '/logo.png'}
          alt="Coas"
          width={120}
          height={36}
          className="object-contain"
          priority
        />
        <Link
          href="/login"
          className="text-sm text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
        >
          Har du allerede en konto? Log ind →
        </Link>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Venstre: Marketing copy */}
          <div className="space-y-8 animate-slideUp">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-accent/10 border border-accent/30 dark:border-accent/20 text-brand-navy dark:text-accent text-sm font-medium">
              <Star className="w-3.5 h-3.5 fill-current" />
              14 dages gratis prøve · Ingen kreditkort
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-zinc-50 leading-tight">
                Spar 50 minutter
                <span className="block bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent">
                  om dagen på mails
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
                AI-assistent der læser, klassificerer og foreslår svar på dine kundemails.
                Du godkender med ét klik — al data forbliver lokalt.
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-zinc-500">
              {[
                'Fungerer med Gmail og Outlook',
                'GDPR-venlig',
                'Annullér når som helst',
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-5">
              {[
                {
                  icon: Mail,
                  title: 'AI læser og klassificerer',
                  desc: 'Tilbud, bookinger, reklamationer, fakturaer — alt sorteres automatisk når mailen lander.',
                },
                {
                  icon: Zap,
                  title: 'Svarforslag på 3 sekunder',
                  desc: 'AI skriver et udkast i din tone baseret på din videnbase og tidligere svar.',
                },
                {
                  icon: Shield,
                  title: 'Du bestemmer — altid',
                  desc: 'Intet sendes uden din godkendelse. Rediger, afvis eller godkend med ét klik.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-50 dark:bg-accent/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-navy dark:text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">{title}</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof placeholder */}
            <div className="glass-card p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-700 dark:text-zinc-300 italic">
                  "Vi brugte 1 time om dagen på mails. Nu tager det 5 minutter. Ingen eksaggration."
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-600 mt-1">
                  — Beta-bruger, VVS-firma, Aarhus
                </p>
              </div>
            </div>
          </div>

          {/* Højre: Signup-form */}
          <div className="animate-slideUp lg:sticky lg:top-8" style={{ animationDelay: '0.1s' }}>
            {step === 'success' ? (
              <SuccessState name={fornavn} />
            ) : (
              <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-none backdrop-blur-xl p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                    Start din gratis prøveperiode
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
                    Klar til brug på under 10 minutter.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                        Fornavn <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={fornavn}
                        onChange={(e) => setFornavn(e.target.value)}
                        required
                        placeholder="Martin"
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                        Efternavn <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={efternavn}
                        onChange={(e) => setEfternavn(e.target.value)}
                        required
                        placeholder="Jensen"
                        className="input-dark"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                      Firmanavn
                    </label>
                    <input
                      type="text"
                      value={firma}
                      onChange={(e) => setFirma(e.target.value)}
                      placeholder="Jensens VVS ApS"
                      className="input-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="martin@jensens-vvs.dk"
                      className="input-dark"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                      Adgangskode <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Minimum 6 tegn"
                      className="input-dark"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 btn-primary font-semibold rounded-xl text-base flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Opretter konto...
                      </>
                    ) : (
                      <>
                        Start gratis prøveperiode
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-zinc-600">
                  <Lock className="w-3 h-3" />
                  <span>
                    Sikker forbindelse · Vi deler aldrig dine data ·{' '}
                    <a href="#" className="text-accent hover:underline">Vilkår</a>
                    {' '}·{' '}
                    <a href="#" className="text-accent hover:underline">Privatlivspolitik</a>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sådan virker det */}
        <div className="mt-24 animate-fadeIn">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-zinc-100 mb-3">
            Sådan virker det
          </h2>
          <p className="text-center text-slate-500 dark:text-zinc-500 mb-12 text-sm">
            Fra tilmelding til første AI-forslag på under 10 minutter.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Tilslut din mailkonto',
                desc: 'Forbind Gmail eller Outlook sikkert via OAuth. Vi gemmer aldrig din adgangskode.',
              },
              {
                step: '2',
                title: 'AI læser og kategoriserer',
                desc: 'Indgående mails analyseres automatisk: tilbud, booking, reklamation, faktura og mere.',
              },
              {
                step: '3',
                title: 'Godkend med ét klik',
                desc: 'AI skriver svarforslaget. Du godkender, tilretter eller afviser. Intet sendes uden din accept.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-zinc-200 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-fadeIn">
          <p className="text-slate-500 dark:text-zinc-500 text-sm mb-4">
            Klar til at spare tid? Det tager under 2 minutter at oprette en konto.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 btn-primary font-semibold rounded-xl"
          >
            Kom i gang nu — det er gratis
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-zinc-800 mt-16 py-8 text-center text-xs text-slate-400 dark:text-zinc-600">
        © {new Date().getFullYear()} Coas · Din AI-assistent ·{' '}
        <a href="#" className="hover:text-accent transition-colors">Privatlivspolitik</a>
        {' '}·{' '}
        <a href="/afmeld" className="hover:text-accent transition-colors">Afmeld emails</a>
      </footer>
    </div>
  )
}

function SuccessState({ name }: { name: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-none backdrop-blur-xl p-10 text-center animate-slideUp">
      <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
        Velkommen, {name}!
      </h2>
      <p className="text-slate-500 dark:text-zinc-500 mb-6 text-sm leading-relaxed max-w-xs mx-auto">
        Din konto er oprettet. Du sendes videre til dashboardet om et øjeblik
        — tilslut din mailkonto for at komme i gang.
      </p>
      <div className="w-5 h-5 border-2 border-accent/40 border-t-brand-navy rounded-full animate-spin mx-auto" />
    </div>
  )
}
