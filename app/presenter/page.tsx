import { ModeBeacon } from '@/components/camp/ModeBeacon';
import { ProgressRace } from '@/components/camp/ProgressRace';
import { activeMode, campTeams, treasureProgress } from '@/lib/camp/mockData';

const teamColors = [
  { border: 'border-[#FFD200]', bg: 'bg-[#FFD200]', text: 'text-black', rankBg: 'bg-black', rankText: 'text-[#FFD200]' },
  { border: 'border-[#F97316]', bg: 'bg-[#F97316]', text: 'text-white', rankBg: 'bg-white', rankText: 'text-[#F97316]' },
  { border: 'border-[#84CC16]', bg: 'bg-[#84CC16]', text: 'text-black', rankBg: 'bg-black', rankText: 'text-[#84CC16]' },
  { border: 'border-white', bg: 'bg-white', text: 'text-black', rankBg: 'bg-black', rankText: 'text-white' },
];

export default function PresenterPage() {
  const sortedTeams = [...campTeams].sort((a, b) => b.score - a.score);
  const topScore = sortedTeams[0]?.score ?? 1;

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#061D3F] text-white"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,210,0,0.04) 79px, rgba(255,210,0,0.04) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,210,0,0.04) 79px, rgba(255,210,0,0.04) 80px)',
      }}
    >
      {/* Top banner */}
      <div className="flex items-center justify-between border-b-4 border-[#FFD200] bg-black px-8 py-4">
        <div className="flex items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFD200] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#FFD200]" />
          </span>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD200]/70">
            Acampadentro 2026 · ao vivo
          </p>
        </div>
        <div className="text-right">
          <ModeBeacon mode={activeMode} role="presenter" eyebrow="" />
        </div>
      </div>

      <div className="flex h-[calc(100vh-68px)] flex-col gap-0 lg:flex-row">
        {/* LEFT — Leaderboard (main focus) */}
        <div className="flex flex-1 flex-col p-6 md:p-10">
          <p
            className="font-black uppercase leading-none text-[#FFD200]/25"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            PLACAR
          </p>

          <div className="mt-4 flex flex-1 flex-col gap-4">
            {sortedTeams.map((team, i) => {
              const colors = teamColors[i % teamColors.length];
              const barWidth = topScore > 0 ? Math.round((team.score / topScore) * 100) : 0;
              return (
                <div
                  key={team.id}
                  className={`flex items-center gap-5 rounded-xl border-4 ${colors.border} ${colors.bg} ${colors.text} p-5 shadow-[6px_6px_0_rgba(0,0,0,0.4)]`}
                >
                  {/* Rank */}
                  <div
                    className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border-3 border-black/20 text-3xl font-black ${colors.rankBg} ${colors.rankText}`}
                  >
                    {i + 1}
                  </div>

                  {/* Team info + bar */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <span
                        className="inline-block h-8 w-8 rounded-full border-3 border-black/30 flex-shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <span
                        className="font-black uppercase leading-none"
                        style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.8rem)' }}
                      >
                        {team.name}
                      </span>
                    </div>
                    {/* Score bar */}
                    <div className="mt-2 h-2.5 w-full rounded-full bg-black/20">
                      <div
                        className="h-2.5 rounded-full bg-black/40 transition-all duration-1000"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <p
                      className="font-black leading-none"
                      style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
                    >
                      {team.score}
                    </p>
                    <p className="text-xs font-black uppercase opacity-50">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Treasure progress */}
        <div className="flex w-full flex-col border-t-4 border-[#FFD200] bg-[#123F7A] p-6 md:p-10 lg:w-[400px] lg:border-l-4 lg:border-t-0">
          <p
            className="font-black uppercase leading-none text-white/20"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
          >
            CAÇA AO<br />TESOURO
          </p>
          <div className="mt-4 flex-1">
            <ProgressRace progress={treasureProgress} publicView />
          </div>

          {/* Bottom label */}
          <div className="mt-6 rounded-lg border-2 border-[#FFD200]/30 bg-black/30 px-4 py-3 text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD200]/60">
              DESPERTA! · Acampadentro 2026
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
