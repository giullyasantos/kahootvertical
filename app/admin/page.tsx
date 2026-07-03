import Link from 'next/link';
import { AdminShell } from '@/components/camp/AdminShell';
import { ModeBeacon } from '@/components/camp/ModeBeacon';
import { activeMode, campTeams, participants, pointLedger } from '@/lib/camp/mockData';

const stats = [
  { label: 'Inscritos', value: null, detail: 'registrados' },
  { label: 'Times', value: null, detail: 'equipes ativas' },
  { label: 'Lançamentos', value: null, detail: 'no ledger' },
  { label: 'Admins', value: '4', detail: 'simultâneos' },
];

export default function AdminOverviewPage() {
  const statValues = [
    String(participants.length),
    String(campTeams.length),
    String(pointLedger.length),
    '4',
  ];

  return (
    <AdminShell title="Controle do camp" activePath="/admin">
      {/* Active mode — top of control panel, most prominent */}
      <div className="rounded-xl border-4 border-[#FFD200] bg-black p-5 shadow-[6px_6px_0_#FFD200]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#FFD200]/60">
              Modo atual · ao vivo
            </p>
            <ModeBeacon mode={activeMode} role="admin" eyebrow="" />
          </div>
          <Link
            href="/admin/modes"
            className="flex-shrink-0 rounded-lg border-2 border-[#FFD200] bg-[#FFD200] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-black shadow-[3px_3px_0_#000] transition hover:shadow-[1px_1px_0_#000] active:shadow-none"
          >
            Trocar modo
          </Link>
        </div>
      </div>

      {/* Stat row — glanceable numbers */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statValues.map((val, i) => (
          <div
            key={stats[i].label}
            className="rounded-lg border-4 border-black bg-white p-4 shadow-[4px_4px_0_#000]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
              {stats[i].label}
            </p>
            <p className="mt-1 text-4xl font-black leading-none text-black">{val}</p>
            <p className="mt-1 text-[11px] font-bold uppercase text-black/40">{stats[i].detail}</p>
          </div>
        ))}
      </div>

      {/* Primary action buttons — big tap targets */}
      <div className="grid gap-3">
        {/* Trocar modo — highest priority, full width */}
        <Link
          href="/admin/modes"
          className="flex items-center justify-between rounded-xl border-4 border-[#FFD200] bg-[#FFD200] p-5 shadow-[6px_6px_0_#000] transition hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#000] active:translate-y-0 active:shadow-[4px_4px_0_#000]"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/50">
              Ação principal
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase text-black">Trocar modo</h2>
            <p className="mt-1 text-sm font-bold text-black/60">
              Controla o que todos veem agora
            </p>
          </div>
          <span className="text-4xl">⚡</span>
        </Link>

        {/* Secondary actions — 2 column */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/registrations"
            className="flex items-center justify-between rounded-xl border-4 border-black bg-[#123F7A] p-5 shadow-[5px_5px_0_#000] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] active:translate-y-0"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                Inscrições
              </p>
              <h2 className="mt-1 text-xl font-black uppercase text-white">Revisar inscrições</h2>
              <p className="mt-1 text-sm font-bold text-white/50">Aprovar pagamento e dados</p>
            </div>
            <span className="text-3xl opacity-70">📋</span>
          </Link>

          <Link
            href="/admin/teams"
            className="flex items-center justify-between rounded-xl border-4 border-black bg-white p-5 shadow-[5px_5px_0_#000] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#000] active:translate-y-0"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/40">
                Times
              </p>
              <h2 className="mt-1 text-xl font-black uppercase text-black">Montar times</h2>
              <p className="mt-1 text-sm font-bold text-black/60">Mover pessoas e revelar equipes</p>
            </div>
            <span className="text-3xl opacity-70">🏆</span>
          </Link>
        </div>
      </div>

      {/* Team scores — quick monitoring */}
      {campTeams.length > 0 && (
        <div className="rounded-xl border-4 border-black bg-[#FFFDF5] shadow-[4px_4px_0_#000]">
          <div className="border-b-4 border-black px-5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/40">
              Pontuação ao vivo
            </p>
          </div>
          <div className="divide-y-2 divide-black/10">
            {[...campTeams]
              .sort((a, b) => b.score - a.score)
              .map((team, i) => (
                <div key={team.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-black/30">#{i + 1}</span>
                    <span
                    className="h-5 w-5 rounded-full border-2 border-black/20 flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                    <span className="text-base font-black uppercase text-black">{team.name}</span>
                  </div>
                  <span className="text-2xl font-black text-black">{team.score}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
