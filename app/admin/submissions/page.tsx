'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/camp/AdminShell';
import { StatusCard } from '@/components/camp/StatusCard';
import { campTeams } from '@/lib/camp/mockData';

export default function SubmissionsAdminPage() {
  const [uploadedTeams, setUploadedTeams] = useState<Record<string, boolean>>({ 'team-a': true });
  const [instagramVotes, setInstagramVotes] = useState('0');
  const [judgeMessage, setJudgeMessage] = useState('Aguardando julgamento.');

  function toggleUpload(teamId: string) {
    setUploadedTeams((current) => ({ ...current, [teamId]: !current[teamId] }));
  }

  const uploadedCount = campTeams.filter((team) => uploadedTeams[team.id]).length;

  return (
    <AdminShell title="Envios" activePath="/admin/submissions">
      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard title="Videos" value={`${uploadedCount}/${campTeams.length}`} detail="Capitaes enviarao o arquivo original pelo app." />
        <StatusCard title="Menus" value="2/3" detail="Planos de comida para aprovacao antes de 25 de julho." />
        <StatusCard title="Instagram" value={`${instagramVotes} votos`} detail="Bonus publico entra separado do julgamento admin." />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
          <h2 className="text-2xl font-black uppercase">Status de video</h2>
          <div className="mt-4 space-y-3">
            {campTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => toggleUpload(team.id)}
                className={`w-full rounded-md border-2 border-black p-4 text-left font-black uppercase ${
                  uploadedTeams[team.id] ? 'bg-[#84CC16]' : 'bg-[#FFFDF5]'
                }`}
              >
                {team.name}: {uploadedTeams[team.id] ? 'uploaded' : 'pendente'}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border-4 border-black bg-[#FFD200] p-5 shadow-[6px_6px_0_#000]">
          <h2 className="text-2xl font-black uppercase">Julgamento e bonus</h2>
          <label className="mt-4 block">
            <span className="text-xs font-black uppercase text-black/60">Votos Instagram</span>
            <input value={instagramVotes} onChange={(event) => setInstagramVotes(event.target.value)} type="number" className="mt-2 w-full rounded-md border-2 border-black bg-white px-3 py-3 font-bold" />
          </label>
          <button type="button" onClick={() => setJudgeMessage(`Bonus salvo com ${instagramVotes || 0} votos.`)} className="mt-4 rounded-md border-2 border-black bg-black px-4 py-3 font-black uppercase text-white">
            Salvar bonus
          </button>
          <button type="button" onClick={() => setJudgeMessage('Julgamento admin marcado como completo no mock.')} className="ml-0 mt-3 rounded-md border-2 border-black bg-white px-4 py-3 font-black uppercase text-black sm:ml-3">
            Concluir julgamento
          </button>
          <p className="mt-4 rounded-md border-2 border-black bg-white p-3 text-sm font-black uppercase" aria-live="polite">{judgeMessage}</p>
        </div>
      </section>
    </AdminShell>
  );
}
