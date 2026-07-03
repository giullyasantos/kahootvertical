import { CampShell } from '@/components/camp/CampShell';
import { TeamAvatarStack } from '@/components/camp/TeamAvatarStack';
import { campTeams, getParticipantsByTeam, mealAssignments } from '@/lib/camp/mockData';

export default function TeamPage() {
  const breakfast = mealAssignments[0];

  return (
    <CampShell title="Times" kicker="Rosters e funcoes" activePath="/app/team">
      <section className="grid gap-4 lg:grid-cols-3">
        {campTeams.map((team) => {
          const members = getParticipantsByTeam(team.id);
          const functionLabel =
            breakfast.cookingTeamId === team.id
              ? 'Cozinha no cafe'
              : breakfast.decorationTeamId === team.id
                ? 'Decora e serve no cafe'
                : 'Limpa depois do cafe';

          return (
            <article key={team.id} className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">Time revelado</p>
                  <h2 className="mt-2 text-3xl font-black uppercase">{team.name}</h2>
                </div>
                <span
                  className="h-10 w-10 rounded-md border-4 border-black"
                  style={{ backgroundColor: team.color }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-5">
                <TeamAvatarStack participants={members} />
              </div>
              <dl className="mt-5 space-y-3 text-sm font-bold">
                <div className="rounded-md border-2 border-black bg-[#FFFDF5] p-3">
                  <dt className="font-black uppercase">Responsabilidade</dt>
                  <dd>{functionLabel}</dd>
                </div>
                <div className="rounded-md border-2 border-black bg-[#FFFDF5] p-3">
                  <dt className="font-black uppercase">Pontos</dt>
                  <dd>{team.score}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </section>
    </CampShell>
  );
}

