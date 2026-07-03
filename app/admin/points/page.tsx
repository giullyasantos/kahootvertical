'use client';

import { FormEvent, useState } from 'react';
import { AdminShell } from '@/components/camp/AdminShell';
import { campEvent, campTeams, pointLedger } from '@/lib/camp/mockData';
import { PointLedgerEntry } from '@/types/camp';

export default function PointsAdminPage() {
  const [entries, setEntries] = useState<PointLedgerEntry[]>(pointLedger);
  const [teamId, setTeamId] = useState(campTeams[0].id);
  const [label, setLabel] = useState('Bonus manual');
  const [points, setPoints] = useState('50');

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedPoints = Number.parseInt(points, 10);
    if (!label.trim() || Number.isNaN(parsedPoints)) return;
    setEntries((current) => [
      {
        id: `point-local-${Date.now()}`,
        campEventId: campEvent.id,
        teamId,
        source: 'manual',
        label: label.trim(),
        points: parsedPoints,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setLabel('Bonus manual');
    setPoints('50');
  }

  return (
    <AdminShell title="Pontos" activePath="/admin/points">
      <form onSubmit={addEntry} className="rounded-lg border-4 border-black bg-[#FFD200] p-5 shadow-[6px_6px_0_#000]">
        <h2 className="text-2xl font-black uppercase">Lancamento manual</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_140px_auto] md:items-end">
          <label className="block">
            <span className="text-xs font-black uppercase text-black/60">Time</span>
            <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className="mt-2 w-full rounded-md border-2 border-black bg-white px-3 py-3 font-bold">
              {campTeams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-black/60">Motivo</span>
            <input value={label} onChange={(event) => setLabel(event.target.value)} className="mt-2 w-full rounded-md border-2 border-black bg-white px-3 py-3 font-bold" />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-black/60">Pontos</span>
            <input value={points} onChange={(event) => setPoints(event.target.value)} type="number" className="mt-2 w-full rounded-md border-2 border-black bg-white px-3 py-3 font-bold" />
          </label>
          <button type="submit" className="rounded-md border-2 border-black bg-black px-4 py-3 font-black uppercase text-white">
            Adicionar
          </button>
        </div>
      </form>

      <section className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <h2 className="text-2xl font-black uppercase">Ledger de pontos</h2>
        <div className="mt-4 space-y-3">
          {entries.map((entry) => {
            const team = campTeams.find((item) => item.id === entry.teamId);
            return (
              <div key={entry.id} className="grid gap-2 rounded-md border-2 border-black bg-[#FFFDF5] p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="text-sm font-black uppercase">{entry.label}</p>
                  <p className="text-xs font-bold text-black/60">{team?.name} · {entry.source}</p>
                </div>
                <p className="text-2xl font-black">{entry.points > 0 ? '+' : ''}{entry.points}</p>
                <p className="text-xs font-black uppercase text-black/55">auditavel</p>
              </div>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
