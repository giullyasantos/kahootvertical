'use client';

import { useEffect, useState } from 'react';
import { CampShell } from '@/components/camp/CampShell';
import { getSession, clearSession } from '@/lib/session';
import { useRouter } from 'next/navigation';

const PLACEHOLDER_AVATARS = [
  { id: 'av1', bg: '#FFD200', icon: '🦁' },
  { id: 'av2', bg: '#123F7A', icon: '🐉' },
  { id: 'av3', bg: '#0c0c0c', icon: '🦅' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('av1');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    setFirstName(session.firstName || '');
    setFullName(session.fullName || '');
    setSelectedAvatar(session.selectedAvatarId || 'av1');

    // Check real notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  function handleSignOut() {
    clearSession();
    router.replace('/register');
  }

  return (
    <CampShell title="Perfil" kicker="DESPERTA! 2026" activePath="/app/profile">
      <div className="mx-auto max-w-[420px] space-y-4 px-4 pt-5">

        {/* Identity card */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#FFD200]/50">
            Logado como
          </p>
          <h2 className="mt-1 text-3xl font-black uppercase leading-none text-white">
            {firstName || '—'}
          </h2>
          {fullName && (
            <p className="mt-1 text-sm font-bold text-white/40">{fullName}</p>
          )}
        </div>

        {/* Avatar */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-[#FFD200]/50">
            Seu avatar
          </p>
          <div className="flex gap-3">
            {PLACEHOLDER_AVATARS.map((av) => {
              const active = selectedAvatar === av.id;
              return (
                <div
                  key={av.id}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{
                    background: av.bg,
                    border: active ? '3px solid #fff' : '3px solid transparent',
                    outline: active ? '3px solid #FFD200' : '3px solid transparent',
                    outlineOffset: 2,
                    opacity: active ? 1 : 0.35,
                  }}
                >
                  {av.icon}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs font-bold text-white/25">
            Avatares gerados pela foto chegam em breve.
          </p>
        </div>

        {/* Notifications */}
        <div
          className="flex items-center justify-between rounded-2xl p-5"
          style={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#FFD200]/50">
              Notificações
            </p>
            <p className="mt-1 text-base font-black uppercase text-white">
              {notificationsEnabled ? 'Ativas ✓' : 'Desativadas'}
            </p>
          </div>
          {!notificationsEnabled && (
            <button
              type="button"
              onClick={async () => {
                const result = await Notification.requestPermission();
                setNotificationsEnabled(result === 'granted');
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-black uppercase text-black"
              style={{ background: '#FFD200', border: '2px solid #000' }}
            >
              Ativar
            </button>
          )}
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-2xl py-4 text-sm font-black uppercase tracking-wide text-white/30 transition active:text-white/60"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Sair da conta
        </button>

      </div>
    </CampShell>
  );
}
