'use client';

import { useState } from 'react';
import { CampShell } from '@/components/camp/CampShell';
import { StatusCard } from '@/components/camp/StatusCard';
import { participants } from '@/lib/camp/mockData';

export default function ProfilePage() {
  const participant = participants[0];
  const [selectedAvatar, setSelectedAvatar] = useState('A1');
  const [notificationsEnabled, setNotificationsEnabled] = useState(participant.notificationEnabled);

  return (
    <CampShell title="Perfil" kicker="Identidade do app" activePath="/app/profile">
      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard title="Nome" value={participant.displayName} detail={participant.fullName} />
        <StatusCard title="Login" value="Telefone" detail="A identidade final sera ligada ao telefone da inscricao, com email como recuperacao." />
        <StatusCard
          title="Notificacoes"
          value={notificationsEnabled ? 'Ativas' : 'Pendente'}
          detail="Mock local para testar a experiencia antes do push real."
        >
          <button
            type="button"
            onClick={() => setNotificationsEnabled((current) => !current)}
            className="font-black uppercase underline"
          >
            {notificationsEnabled ? 'Desativar mock' : 'Ativar mock'}
          </button>
        </StatusCard>
      </section>
      <section className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">Avatar escolhido: {selectedAvatar}</p>
        <h2 className="mt-2 text-3xl font-black uppercase">Escolha entre 3 opcoes</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {['A1', 'A2', 'A3'].map((label) => (
            <button
              type="button"
              key={label}
              onClick={() => setSelectedAvatar(label)}
              className={`grid aspect-square place-items-center rounded-lg border-4 border-black text-5xl font-black shadow-[4px_4px_0_#000] ${
                selectedAvatar === label ? 'bg-[#FFD200]' : 'bg-[#FFFDF5]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </CampShell>
  );
}
