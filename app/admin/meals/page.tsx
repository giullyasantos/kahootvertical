'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/camp/AdminShell';
import { StatusCard } from '@/components/camp/StatusCard';
import { campTeams, mealAssignments, mealPlans } from '@/lib/camp/mockData';

const completionActions = [
  ['foodServedAt', 'Food served'],
  ['decorationReadyAt', 'Decoration ready'],
  ['serviceCompleteAt', 'Service complete'],
  ['cleaningCompleteAt', 'Cleaning complete'],
] as const;

export default function MealsAdminPage() {
  const meal = mealAssignments[0];
  const [completion, setCompletion] = useState<Record<string, string>>({});
  const cookingTeam = campTeams.find((team) => team.id === meal.cookingTeamId);
  const decorationTeam = campTeams.find((team) => team.id === meal.decorationTeamId);
  const cleaningTeam = campTeams.find((team) => team.id === meal.cleaningTeamId);

  function markComplete(key: string) {
    const time = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/New_York',
    }).format(new Date());
    setCompletion((current) => ({ ...current, [key]: time }));
  }

  return (
    <AdminShell title="Refeicoes" activePath="/admin/meals">
      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard title="Cozinha" value={cookingTeam?.name ?? 'Time'} detail="Registrar comida servida e julgar comida." />
        <StatusCard title="Decora/serve" value={decorationTeam?.name ?? 'Time'} detail="Registrar decoracao pronta e servico." />
        <StatusCard title="Limpeza" value={cleaningTeam?.name ?? 'Time'} detail="Registrar limpeza completa depois da refeicao." />
      </section>
      <section className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <div className="grid gap-3 md:grid-cols-4">
          {completionActions.map(([key, label]) => (
            <button key={key} type="button" onClick={() => markComplete(key)} className="rounded-md border-2 border-black bg-[#FFD200] px-3 py-4 text-sm font-black uppercase">
              {completion[key] ? `Saved ${completion[key]}` : label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {mealPlans.map((plan) => (
            <div key={plan.id} className="rounded-md border-2 border-black bg-[#FFFDF5] p-4">
              <p className="text-xs font-black uppercase text-black/55">{plan.teamFunction}</p>
              <h2 className="mt-2 text-xl font-black uppercase">{plan.menu ?? plan.decorationPlan}</h2>
              <p className="mt-2 text-sm font-bold text-black/70">{plan.budgetNote}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
