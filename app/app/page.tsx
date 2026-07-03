import Link from 'next/link';
import { activeMode, campTeams } from '@/lib/camp/mockData';
import { CampShell } from '@/components/camp/CampShell';

// ── Per-mode skin config ──────────────────────────────────────────────────────
const modeSkins: Record<string, {
  bg: string;
  accent: string;
  icon: string;
  label: string;
  instruction: string;
  lockNote?: string;
}> = {
  treasure_hunt: {
    bg: 'linear-gradient(135deg, #1a0533 0%, #2e1065 50%, #123F7A 100%)',
    accent: '#7C3AED',
    icon: '🔒',
    label: 'Caça ao Tesouro',
    instruction: 'As pistas estão com seu capitão.',
    lockNote: 'Fique com o time e siga o capitão.',
  },
  conversation: {
    bg: 'linear-gradient(135deg, #431407 0%, #9a3412 100%)',
    accent: '#F97316',
    icon: '💬',
    label: 'Roda de Conversa',
    instruction: 'Participe com atenção.',
    lockNote: 'Mais pessoas falando bem = mais pontos pro time.',
  },
  meal: {
    bg: 'linear-gradient(135deg, #1c1408 0%, #854d0e 100%)',
    accent: '#FFB703',
    icon: '🍳',
    label: 'Refeição',
    instruction: 'Veja a função do seu time.',
  },
  message: {
    bg: 'linear-gradient(135deg, #0f1f0a 0%, #166534 100%)',
    accent: '#84CC16',
    icon: '📖',
    label: 'Mensagem',
    instruction: 'Presta atenção e anota o que precisar.',
  },
  pie_quiz: {
    bg: 'linear-gradient(135deg, #1e0a0a 0%, #991b1b 100%)',
    accent: '#EF4444',
    icon: '🥧',
    label: 'Quiz da Torta',
    instruction: 'Presta atenção — pode ser você.',
  },
  video_challenge: {
    bg: 'linear-gradient(135deg, #030712 0%, #1e3a5f 100%)',
    accent: '#38BDF8',
    icon: '🎬',
    label: 'Desafio em Vídeo',
    instruction: 'Veja os critérios e ajude o time.',
  },
  arrival: {
    bg: 'linear-gradient(135deg, #0c0a1e 0%, #1e1b4b 100%)',
    accent: '#6366F1',
    icon: '🚪',
    label: 'Chegada',
    instruction: 'Chegue antes do limite e evite perder pontos.',
  },
  closing: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    accent: '#FFD200',
    icon: '🏆',
    label: 'Encerramento',
    instruction: 'O camp chegou ao fim. Veja o placar final.',
  },
};

const fallbackSkin = {
  bg: 'linear-gradient(135deg, #061D3F 0%, #123F7A 100%)',
  accent: '#FFD200',
  icon: '⚡',
  label: activeMode.title,
  instruction: activeMode.participantSummary ?? 'Fique atento ao próximo aviso.',
};

export default function ParticipantHomePage() {
  const skin = modeSkins[activeMode.type] ?? fallbackSkin;
  const sortedTeams = [...campTeams].sort((a, b) => b.score - a.score);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <CampShell title="Agora" kicker="DESPERTA! 2026" activePath="/app">
      <div className="mx-auto max-w-[420px] px-4 pt-5">

        {/* ── Status eyebrow ── */}
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFD200] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FFD200]" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.32em] text-[#FFD200]/60">
            DESPERTA! · ao vivo
          </span>
        </div>

        {/* ── Mode hero card ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: skin.bg,
            border: `2px solid ${skin.accent}30`,
            boxShadow: `0 0 40px ${skin.accent}20, 0 8px 32px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Glow orb */}
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${skin.accent}, transparent 70%)` }}
          />
          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 28px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 28px)',
            }}
          />

          <div className="relative p-6 pb-7">
            {/* Mode label */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ background: `${skin.accent}22`, color: skin.accent, border: `1px solid ${skin.accent}44` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: skin.accent }} />
              {activeMode.type.replace('_', ' ')}
            </div>

            {/* Big icon */}
            <div className="mb-3 text-5xl leading-none">{skin.icon}</div>

            {/* Mode title */}
            <h2
              className="font-black uppercase leading-[0.88] text-white"
              style={{ fontSize: 'clamp(2rem, 9vw, 2.75rem)' }}
            >
              {skin.label}
            </h2>

            {/* Main instruction */}
            <p
              className="mt-3 text-base font-bold leading-snug"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              {skin.instruction}
            </p>

            {/* Lock note */}
            {skin.lockNote && (
              <div
                className="mt-4 rounded-xl px-4 py-3 text-sm font-bold"
                style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {skin.lockNote}
              </div>
            )}
          </div>
        </div>

        {/* ── Leaderboard ── */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
              Placar
            </span>
            <Link
              href="/app/team"
              className="text-[10px] font-black uppercase tracking-wide text-[#FFD200]/50 active:text-[#FFD200]"
            >
              Ver times →
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {sortedTeams.map((team, i) => (
              <Link
                key={team.id}
                href="/app/team"
                className="flex items-center gap-3 px-4 py-3 transition-colors active:bg-white/5"
                style={{
                  borderBottom: i < sortedTeams.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  background: i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
              >
                {/* Rank */}
                <span className="w-6 text-center text-lg leading-none">{medals[i]}</span>

                {/* Color dot */}
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: team.color, boxShadow: `0 0 8px ${team.color}80` }}
                />

                {/* Name */}
                <span className="flex-1 text-sm font-black uppercase text-white/80">
                  {team.name}
                </span>

                {/* Score */}
                <span
                  className="text-lg font-black tabular-nums"
                  style={{ color: i === 0 ? '#FFD200' : 'rgba(255,255,255,0.5)' }}
                >
                  {team.score.toLocaleString('pt-BR')}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </CampShell>
  );
}
