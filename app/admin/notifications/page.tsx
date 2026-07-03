'use client';

import { FormEvent, useState } from 'react';
import { AdminShell } from '@/components/camp/AdminShell';
import { StatusCard } from '@/components/camp/StatusCard';

interface SentNotice {
  id: string;
  audience: string;
  title: string;
  body: string;
}

export default function NotificationsAdminPage() {
  const [audience, setAudience] = useState('all');
  const [title, setTitle] = useState('Leia isso hoje');
  const [body, setBody] = useState('A keyword de hoje aparece no texto enviado pela lideranca.');
  const [sent, setSent] = useState<SentNotice[]>([]);

  function sendNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSent((current) => [
      { id: `notice-${Date.now()}`, audience, title: title.trim(), body: body.trim() },
      ...current,
    ]);
  }

  return (
    <AdminShell title="Avisos" activePath="/admin/notifications">
      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard title="Publico" value="Todos/time/capitaes" detail="Segmentacao planejada para notificacoes push." />
        <StatusCard title="Enviados mock" value={`${sent.length}`} detail="Lista local desta sessao." />
        <StatusCard title="Agenda" value="Pre-camp" detail="Leituras, keywords, reveal e lembretes de menu." />
      </section>

      <form onSubmit={sendNotice} className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <h2 className="text-2xl font-black uppercase">Compor aviso</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
          <label className="block">
            <span className="text-xs font-black uppercase text-black/60">Publico</span>
            <select value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-2 w-full rounded-md border-2 border-black bg-[#FFFDF5] px-3 py-3 font-bold">
              <option value="all">Todos</option>
              <option value="captains">Capitaes</option>
              <option value="team-a">Time A</option>
              <option value="admins">Admins</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase text-black/60">Titulo</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-md border-2 border-black bg-[#FFFDF5] px-3 py-3 font-bold" />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="text-xs font-black uppercase text-black/60">Mensagem</span>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 min-h-28 w-full rounded-md border-2 border-black bg-[#FFFDF5] px-3 py-3 font-bold" />
        </label>
        <button type="submit" className="mt-4 rounded-md border-2 border-black bg-[#FFD200] px-4 py-3 font-black uppercase">
          Enviar aviso mock
        </button>
      </form>

      <section className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <h2 className="text-2xl font-black uppercase">Historico local</h2>
        <div className="mt-4 space-y-3" aria-live="polite">
          {sent.length === 0 && <p className="font-bold text-black/65">Nenhum aviso enviado nesta sessao.</p>}
          {sent.map((notice) => (
            <article key={notice.id} className="rounded-md border-2 border-black bg-[#FFFDF5] p-4">
              <p className="text-xs font-black uppercase text-black/55">{notice.audience}</p>
              <h3 className="text-lg font-black uppercase">{notice.title}</h3>
              <p className="text-sm font-bold text-black/70">{notice.body}</p>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
