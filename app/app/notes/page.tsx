'use client';

import { FormEvent, useState } from 'react';
import { CampShell } from '@/components/camp/CampShell';
import { StatusCard } from '@/components/camp/StatusCard';

export default function NotesPage() {
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('Anote aqui durante a mensagem...');
  const [scope, setScope] = useState<'private' | 'team'>('private');

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedNote(note.trim() || 'Nota vazia salva para teste.');
  }

  return (
    <CampShell title="Notas" kicker="Mensagem e conversa" activePath="/app/notes">
      <section className="grid gap-4 md:grid-cols-2">
        <StatusCard
          title="Minhas notas"
          value={scope === 'private' ? 'Privado' : 'Time'}
          detail="Use o seletor para simular se a nota fica so com voce ou compartilhada com o time."
        />
        <StatusCard
          title="Ultima nota salva"
          value="Salvo local"
          detail={savedNote}
        />
      </section>
      <form onSubmit={saveNote} className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="text-xs font-black uppercase tracking-[0.18em] text-black/55" htmlFor="note-preview">
            Editor de notas
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['private', 'team'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setScope(item)}
                className={`rounded-md border-2 border-black px-3 py-2 text-xs font-black uppercase ${
                  scope === item ? 'bg-black text-white' : 'bg-[#FFFDF5] text-black'
                }`}
              >
                {item === 'private' ? 'Privado' : 'Time'}
              </button>
            ))}
          </div>
        </div>
        <textarea
          id="note-preview"
          className="mt-3 min-h-48 w-full rounded-lg border-4 border-black bg-[#FFFDF5] p-4 text-lg font-bold outline-none"
          placeholder="Anote aqui durante a mensagem..."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <button type="submit" className="mt-4 rounded-md border-2 border-black bg-[#FFD200] px-4 py-3 font-black uppercase">
          Salvar nota
        </button>
      </form>
    </CampShell>
  );
}
