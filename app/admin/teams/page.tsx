'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/camp/AdminShell';
import { TeamAvatarStack } from '@/components/camp/TeamAvatarStack';
import { campTeams, getParticipantsByTeam } from '@/lib/camp/mockData';

export default function TeamsAdminPage() {
  const [revealedTeams, setRevealedTeams] = useState<Record<string, boolean>>(
    Object.fromEntries(campTeams.map((team) => [team.id, team.revealed])),
  );
  const [notice, setNotice] = useState('Nenhum reveal enviado nesta sessao.');

  function toggleReveal(teamId: string) {
    setRevealedTeams((current) => {
      const nextValue = !current[teamId];
      const team = campTeams.find((item) => item.id === teamId);
      setNotice(`${team?.name ?? 'Time'} ${nextValue ? 'revelado' : 'ocultado'} no mock.`);
      return { ...current, [teamId]: nextValue };
    });
  }

  return (
    <AdminShell title="Times" activePath="/admin/teams">
      <section className="rounded-lg border-4 border-black bg-[#FFD200] p-4 shadow-[6px_6px_0_#000]">
        <p className="text-sm font-black uppercase">{notice}</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {campTeams.map((team) => (
          <article key={team.id} className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">
                  {revealedTeams[team.id] ? 'Revelado' : 'Nao revelado'}
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase">{team.name}</h2>
              </div>
              <span
                className="h-10 w-10 rounded-md border-4 border-black"
                style={{ backgroundColor: team.color }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-5">
              <TeamAvatarStack participants={getParticipantsByTeam(team.id)} />
            </div>
            <button
              type="button"
              onClick={() => toggleReveal(team.id)}
              className="mt-5 w-full rounded-md border-2 border-black bg-[#FFD200] p-3 text-sm font-black uppercase"
            >
              {revealedTeams[team.id] ? 'Ocultar mock' : 'Revelar time'}
            </button>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
