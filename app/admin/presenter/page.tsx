'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AdminShell } from '@/components/camp/AdminShell';
import { ModeBeacon } from '@/components/camp/ModeBeacon';
import { activeMode } from '@/lib/camp/mockData';
import { PresenterState } from '@/types/camp';

const publicViews: PresenterState['publicView'][] = [
  'leaderboard',
  'treasure_progress',
  'conversation',
  'video_status',
  'meal_status',
  'quiz_matchup',
  'presentation',
  'closing',
];

export default function PresenterAdminPage() {
  const [publicView, setPublicView] = useState<PresenterState['publicView']>('treasure_progress');

  return (
    <AdminShell title="Controle do telao" activePath="/admin/presenter">
      <ModeBeacon mode={activeMode} role="admin" eyebrow="Presenter sincronizado" />
      <section className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">Estado publico mock</p>
        <h2 className="mt-2 text-3xl font-black uppercase">{publicView}</h2>
        <p className="mt-3 font-bold text-black/70">A tela publica deve ler apenas dados seguros e sem controles de admin.</p>
        <div className="mt-5 grid gap-2 md:grid-cols-4">
          {publicViews.map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setPublicView(view)}
              className={`rounded-md border-2 border-black px-3 py-3 text-xs font-black uppercase ${
                publicView === view ? 'bg-black text-white' : 'bg-[#FFD200] text-black'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
        <Link href="/presenter" className="mt-5 inline-flex rounded-md border-2 border-black bg-[#FFD200] px-4 py-3 font-black uppercase">
          Abrir telao
        </Link>
      </section>
    </AdminShell>
  );
}
