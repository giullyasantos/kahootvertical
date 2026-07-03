import Link from 'next/link';
import { CampShell } from '@/components/camp/CampShell';
import { ModeBeacon } from '@/components/camp/ModeBeacon';
import { StatusCard } from '@/components/camp/StatusCard';
import { activeMode, campTeams, criteriaSets, mealAssignments, treasureProgress } from '@/lib/camp/mockData';

export default function ParticipantHomePage() {
  const nextMeal = mealAssignments[0];
  const currentCriteria = criteriaSets.filter((criteria) => criteria.unlocked);

  return (
    <CampShell title="Acampadentro" kicker="DESPERTA! 2026" activePath="/app">
      <ModeBeacon mode={activeMode} role="participant" />

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Seu proximo passo"
          value="Fique com o time"
          detail="As pistas principais aparecem no celular do capitao durante a caca ao tesouro."
        />
        <StatusCard
          title="Times revelados"
          value={`${campTeams.length} times`}
          detail="Veja seu time, capitao, avatares e responsabilidades."
        >
          <Link href="/app/team" className="font-black uppercase underline">
            Ver time
          </Link>
        </StatusCard>
        <StatusCard
          title="Criterios liberados"
          value={`${currentCriteria.length}`}
          detail="Criterios futuros continuam trancados ate o modo comecar."
        >
          <Link href="/app/criteria" className="font-black uppercase underline">
            Abrir criterios
          </Link>
        </StatusCard>
      </section>

      <section className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">Progresso publico</p>
            <h2 className="mt-1 text-3xl font-black uppercase">Caca ao tesouro</h2>
          </div>
          <p className="rounded-md border-2 border-black bg-[#FFF5C2] px-3 py-2 text-sm font-black uppercase">
            Telao acompanha em tempo real
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {treasureProgress.map((progress) => {
            const team = campTeams.find((item) => item.id === progress.teamId);
            return (
              <div key={progress.teamId} className="rounded-lg border-2 border-black bg-[#FFFDF5] p-4">
                <p className="text-sm font-black uppercase">{team?.name}</p>
                <p className="mt-2 text-4xl font-black">{progress.percent}%</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <StatusCard
          title="Refeicao"
          value="Cafe da manha"
          detail={`Pronto as ${new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/New_York',
          }).format(new Date(nextMeal.readyAt))}. A pontuacao usa a hora real de entrega.`}
        />
        <StatusCard
          title="Notificacoes"
          value="Ative no app"
          detail="Os avisos de leitura, keyword, time revelado e modo ativo dependem da permissao no telefone."
        >
          <Link href="/app/profile" className="font-black uppercase underline">
            Abrir perfil
          </Link>
        </StatusCard>
      </section>

      <section className="rounded-lg border-4 border-black bg-black p-5 text-white shadow-[6px_6px_0_#000]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Atalho de papel</p>
        <h2 className="mt-2 text-3xl font-black uppercase">Se voce for capitao, use o controle do time</h2>
        <Link href="/captain" className="mt-4 inline-flex rounded-md border-2 border-white bg-[#FFD200] px-4 py-3 font-black uppercase text-black">
          Abrir modo capitao
        </Link>
      </section>
    </CampShell>
  );
}
