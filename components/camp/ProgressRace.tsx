import { campTeams, getTeam } from '@/lib/camp/mockData';

interface ProgressRaceProps {
  progress: Array<{
    teamId: string;
    percent: number;
    correct: number;
    wrong: number;
    attempts: number;
  }>;
  publicView?: boolean;
}

export function ProgressRace({ progress, publicView = false }: ProgressRaceProps) {
  return (
    <div className="space-y-4">
      {progress.map((item) => {
        const team = getTeam(item.teamId) ?? campTeams[0];
        return (
          <section key={item.teamId} className="rounded-lg border-4 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-6 w-6 rounded-md border-2 border-black"
                  style={{ backgroundColor: team.color }}
                  aria-hidden="true"
                />
                <h2 className="text-xl font-black uppercase">{team.name}</h2>
              </div>
              <p className="text-2xl font-black">{item.percent}%</p>
            </div>
            <div className="h-6 overflow-hidden rounded-md border-4 border-black bg-[#FFFDF5]">
              <div
                className="h-full border-r-4 border-black"
                style={{ width: `${item.percent}%`, backgroundColor: team.accentColor }}
              />
            </div>
            {!publicView && (
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black uppercase">
                <div className="rounded-md border-2 border-black bg-[#E7FFE9] p-2">
                  <dt>Acertos</dt>
                  <dd className="text-lg">{item.correct}</dd>
                </div>
                <div className="rounded-md border-2 border-black bg-[#FFE9E7] p-2">
                  <dt>Erros</dt>
                  <dd className="text-lg">{item.wrong}</dd>
                </div>
                <div className="rounded-md border-2 border-black bg-[#FFF5C2] p-2">
                  <dt>Tentativas</dt>
                  <dd className="text-lg">{item.attempts}</dd>
                </div>
              </dl>
            )}
          </section>
        );
      })}
    </div>
  );
}

