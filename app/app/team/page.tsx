import { CampShell } from '@/components/camp/CampShell';
import { TeamAvatarStack } from '@/components/camp/TeamAvatarStack';
import { campTeams, getParticipantsByTeam } from '@/lib/camp/mockData';

export default function TeamPage() {
  const sortedTeams = [...campTeams].sort((a, b) => b.score - a.score);
  const topScore = sortedTeams[0]?.score ?? 1;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <CampShell title="Times" kicker="DESPERTA! 2026" activePath="/app/team">
      <div className="mx-auto max-w-[420px] space-y-3 px-4 pt-5">
        {sortedTeams.map((team, rank) => {
          const members = getParticipantsByTeam(team.id);
          const barPct = Math.round((team.score / topScore) * 100);

          return (
            <article
              key={team.id}
              className="overflow-hidden rounded-2xl"
              style={{
                background: '#0d1f3c',
                border: `2px solid ${team.color}40`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Color stripe */}
              <div className="h-1 w-full" style={{ backgroundColor: team.color }} />

              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Color swatch */}
                    <div
                      className="h-10 w-10 flex-shrink-0 rounded-xl"
                      style={{ backgroundColor: team.color, boxShadow: `0 0 16px ${team.color}50` }}
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: `${team.color}99` }}>
                        {rank + 1}º lugar {medals[rank]}
                      </p>
                      <h2 className="text-2xl font-black uppercase leading-tight text-white">
                        {team.name}
                      </h2>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">pontos</p>
                    <p className="text-2xl font-black tabular-nums" style={{ color: team.color }}>
                      {team.score.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barPct}%`, backgroundColor: team.color }}
                  />
                </div>

                {/* Members */}
                <div className="mt-4">
                  <TeamAvatarStack participants={members} />

                  {/* Name list */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {members.map((m) => {
                      const isCaptain = team.captainParticipantId === m.id;
                      return (
                        <span
                          key={m.id}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                          style={{
                            background: isCaptain ? `${team.color}22` : 'rgba(255,255,255,0.07)',
                            color: isCaptain ? team.color : 'rgba(255,255,255,0.6)',
                            border: `1px solid ${isCaptain ? team.color + '55' : 'rgba(255,255,255,0.1)'}`,
                          }}
                        >
                          {isCaptain && (
                            <span className="text-[10px]">★</span>
                          )}
                          {m.displayName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </CampShell>
  );
}
