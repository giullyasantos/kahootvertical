'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/camp/AdminShell';
import { ModeBeacon } from '@/components/camp/ModeBeacon';
import { eventModes } from '@/lib/camp/mockData';

export default function ModesAdminPage() {
  const [activeModeId, setActiveModeId] = useState(eventModes.find((mode) => mode.status === 'active')?.id ?? eventModes[0].id);
  const active = eventModes.find((mode) => mode.id === activeModeId) ?? eventModes[0];

  return (
    <AdminShell title="Modos" activePath="/admin/modes">
      <ModeBeacon mode={{ ...active, status: 'active' }} role="admin" />
      <section className="grid gap-4 md:grid-cols-3">
        {eventModes.map((mode) => {
          const selected = mode.id === activeModeId;
          return (
            <article key={mode.id} className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">{mode.type}</p>
              <h2 className="mt-2 text-2xl font-black uppercase">{mode.title}</h2>
              <p className="mt-3 text-sm font-bold text-black/70">{mode.adminSummary}</p>
              <button
                type="button"
                onClick={() => setActiveModeId(mode.id)}
                className={`mt-4 w-full rounded-md border-2 border-black px-3 py-3 text-xs font-black uppercase ${
                  selected ? 'bg-black text-white' : 'bg-[#FFD200] text-black'
                }`}
              >
                {selected ? 'Ativo agora' : 'Ativar modo'}
              </button>
            </article>
          );
        })}
      </section>
    </AdminShell>
  );
}
