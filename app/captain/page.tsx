'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { CampShell } from '@/components/camp/CampShell';
import { ModeBeacon } from '@/components/camp/ModeBeacon';
import { StatusCard } from '@/components/camp/StatusCard';
import { activeMode } from '@/lib/camp/mockData';

export default function CaptainPage() {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('Aguardando resposta do capitao.');
  const [videoName, setVideoName] = useState('Nenhum video enviado.');

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = answer.trim().toLowerCase();
    if (!normalized) {
      setFeedback('Digite uma resposta antes de enviar.');
      return;
    }
    setFeedback(normalized.includes('desperta') ? 'Resposta aceita. Time avancou para a proxima pista.' : 'Ainda nao. Tente conectar a pista ao tema DESPERTA.');
  }

  function onVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setVideoName(file ? `Video mockado anexado: ${file.name}` : 'Nenhum video enviado.');
  }

  return (
    <CampShell title="Capitao" kicker="Controles do time" activePath="/app">
      <ModeBeacon mode={activeMode} role="captain" eyebrow="Acesso do capitao" />
      <section className="grid gap-4 md:grid-cols-2">
        <StatusCard
          title="Pista atual"
          value="Pista 3"
          detail="Leia para o time: quando a luz acende, ninguem fica parado."
        />
        <StatusCard
          title="Envios"
          value="Video do time"
          detail={videoName}
        />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={submitAnswer} className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
          <label className="text-xs font-black uppercase tracking-[0.18em] text-black/55" htmlFor="captain-answer">
            Resposta da pista
          </label>
          <input
            id="captain-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="mt-3 w-full rounded-md border-4 border-black bg-[#FFFDF5] px-4 py-3 text-lg font-bold"
            placeholder="Digite a resposta do time"
          />
          <button type="submit" className="mt-4 rounded-md border-2 border-black bg-[#FFD200] px-4 py-3 font-black uppercase">
            Enviar resposta
          </button>
          <p className="mt-3 rounded-md border-2 border-black bg-[#FFFDF5] p-3 text-sm font-black uppercase" aria-live="polite">
            {feedback}
          </p>
        </form>

        <section className="rounded-lg border-4 border-black bg-black p-5 text-white shadow-[6px_6px_0_#000]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Upload mockado</p>
          <h2 className="mt-2 text-3xl font-black uppercase">Enviar video do time</h2>
          <label className="mt-4 block rounded-md border-2 border-white/40 bg-white/10 p-4 font-black uppercase">
            Escolher arquivo
            <input type="file" accept="video/*" className="mt-3 block w-full text-sm" onChange={onVideoChange} />
          </label>
          <p className="mt-3 text-sm font-bold text-white/75">{videoName}</p>
        </section>
      </section>
    </CampShell>
  );
}
