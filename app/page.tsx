import Link from 'next/link';
import { activeMode, campTeams, pointLedger } from '@/lib/camp/mockData';

const roleEntries = [
  {
    href: '/register',
    eyebrow: 'Novo participante',
    label: 'Inscrever',
    detail: 'Foto, talentos e pagamento',
    bg: 'bg-[#FFD200]',
    text: 'text-black',
    border: 'border-black',
    shadow: 'shadow-[6px_6px_0_#000]',
    accent: 'bg-black text-[#FFD200]',
    size: 'md:col-span-1',
  },
  {
    href: '/onboarding',
    eyebrow: 'Participante',
    label: 'Entrar no camp',
    detail: 'Avatar, tela inicial, avisos',
    bg: 'bg-[#123F7A]',
    text: 'text-white',
    border: 'border-[#FFD200]',
    shadow: 'shadow-[6px_6px_0_#FFD200]',
    accent: 'bg-[#FFD200] text-black',
    size: 'md:col-span-1',
  },
  {
    href: '/admin',
    eyebrow: 'Operação',
    label: 'Painel admin',
    detail: 'Times, modos, pontos, notificações',
    bg: 'bg-black',
    text: 'text-[#FFD200]',
    border: 'border-[#FFD200]',
    shadow: 'shadow-[6px_6px_0_#FFD200]',
    accent: 'bg-[#FFD200] text-black',
    size: 'md:col-span-1',
  },
  {
    href: '/presenter',
    eyebrow: 'Telão público',
    label: 'Abrir telão',
    detail: 'Leaderboard e progresso ao vivo',
    bg: 'bg-white',
    text: 'text-black',
    border: 'border-black',
    shadow: 'shadow-[6px_6px_0_#000]',
    accent: 'bg-[#123F7A] text-white',
    size: 'md:col-span-1',
  },
];

const legacyActions = [
  { href: '/host', label: 'Host Kahoot' },
  { href: '/join', label: 'Entrar no quiz' },
  { href: '/watch', label: 'Assistir quiz' },
];

export default function Home() {
  const totalPoints = pointLedger.reduce((sum, entry) => sum + entry.points, 0);

  return (
    <main className="min-h-screen bg-[#123F7A] text-white overflow-x-hidden">
      {/* Hero stripe */}
      <div className="relative border-b-4 border-[#FFD200] bg-[#061D3F] px-5 py-10 md:px-12 md:py-16 overflow-hidden">
        {/* Decorative grid lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #FFD200 0px, #FFD200 1px, transparent 1px, transparent 60px), repeating-linear-gradient(180deg, #FFD200 0px, #FFD200 1px, transparent 1px, transparent 60px)',
          }}
        />

        <div className="relative mx-auto max-w-6xl">
          <p className="text-[11px] font-black uppercase tracking-[0.38em] text-[#FFD200]/70">
            Acampadentro 2026 · Jul 31 – Ago 2
          </p>

          <h1
            className="mt-2 font-black uppercase leading-[0.82] text-[#FFD200]"
            style={{ fontSize: 'clamp(3.5rem, 14vw, 9rem)' }}
          >
            DESPERTA!
          </h1>

          <p className="mt-4 max-w-xl text-base font-bold text-white/60 md:text-lg">
            Inscrição, times, gincanas, refeições, pontuação e telão — tudo num só lugar.
          </p>

          {/* Live mode pill */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border-2 border-[#FFD200]/40 bg-white/5 px-5 py-2.5 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFD200] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FFD200]" />
            </span>
            <span className="text-sm font-black uppercase tracking-wide text-[#FFD200]">
              {activeMode.title}
            </span>
            <span className="text-xs font-bold uppercase text-white/40">ao vivo</span>
          </div>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="border-b-4 border-black bg-[#FFD200]">
        <div className="mx-auto flex max-w-6xl divide-x-4 divide-black">
          {[
            { label: 'Times', value: campTeams.length },
            { label: 'Pontos totais', value: totalPoints },
            { label: 'Modo', value: activeMode.status },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 px-5 py-4 text-black">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-55">{stat.label}</p>
              <p className="mt-0.5 text-2xl font-black uppercase leading-none">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role entry grid */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <p className="mb-5 text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
          Escolha seu acesso
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {roleEntries.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className={`group relative flex flex-col justify-between rounded-xl border-4 ${entry.border} ${entry.bg} ${entry.text} ${entry.shadow} p-6 transition-transform duration-100 hover:-translate-y-1 active:translate-y-0`}
            >
              <div>
                <span
                  className={`inline-block rounded-full border-2 border-current/20 ${entry.accent} px-2.5 py-1 text-[10px] font-black uppercase tracking-widest`}
                >
                  {entry.eyebrow}
                </span>
                <h2 className="mt-4 text-3xl font-black uppercase leading-none">{entry.label}</h2>
                <p className="mt-2 text-sm font-bold opacity-60">{entry.detail}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase opacity-50 group-hover:opacity-100">
                Abrir <span className="text-base">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Legacy Kahoot section */}
      <div className="mx-auto max-w-6xl border-t-4 border-white/10 px-4 pb-10 pt-6 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/30">
              Ferramentas antigas
            </p>
            <p className="mt-1 text-lg font-black uppercase text-white/50">Kahoot ainda está aqui</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {legacyActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-md border-2 border-white/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/50 transition hover:border-white/40 hover:bg-white/10 hover:text-white/80"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
