'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { Room } from '@/types';
import { AuthGate } from '@/components/AuthGate';
import { useAuthSession } from '@/hooks/useAuthSession';
import logo from '@/app/images/verticallogo.png';

const EMOJI_OPTIONS = [
  '🗿', '💀', '🔥', '😈', '🐺',
  '🦅', '🗣️', '💅', '🤌', '😤',
  '🐐', '👁️', '🫡', '🤯', '😮‍💨',
  '🦁', '👑', '⚡', '🎯', '🧠',
  '🫀', '🪖', '🐉', '💎', '🚀',
  '🐒'];
type Step = 'enter-code' | 'select-team';

export default function JoinPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuthSession();
  const [step, setStep] = useState<Step>('enter-code');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const { teams } = useRealtimeTeams(room?.id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.trim())
        .single();

      if (roomError || !roomData) {
        setError('sala não encontrada, confere o código aí');
        setLoading(false);
        return;
      }

      if (roomData.status !== 'waiting') {
        setError('essa sala já começou, chegou atrasado 😬');
        setLoading(false);
        return;
      }

      setRoom(roomData);
      setStep('select-team');
      setLoading(false);
    } catch (err) {
      console.error('Error finding room:', err);
      setError('erro ao buscar sala, tenta de novo');
      setLoading(false);
    }
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim() || !room) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          room_id: room.id,
          name: newTeamName.trim(),
          emoji: selectedEmoji,
          score: 0,
        })
        .select()
        .single();

      if (teamError || !team) {
        setError('erro ao criar time, tenta de novo');
        setLoading(false);
        return;
      }

      await joinTeam(team.id, true);
    } catch (err) {
      console.error('Error creating team:', err);
      setError('erro ao criar time, tenta de novo');
      setLoading(false);
    }
  }

  async function joinTeam(teamId: string, isCaptain: boolean = false) {
    if (!room || !user) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: existingPlayer, error: existingError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingError) {
        setError('erro ao conferir seu jogador, tenta de novo');
        setLoading(false);
        return;
      }

      if (existingPlayer) {
        router.push(`/play?code=${code.trim()}&playerId=${existingPlayer.id}`);
        return;
      }

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          name: name.trim(),
          score: 0,
          team_id: teamId,
          user_id: user.id,
        })
        .select()
        .single();

      if (playerError || !player) {
        setError('erro ao entrar no time, tenta de novo');
        setLoading(false);
        return;
      }

      if (isCaptain) {
        await supabase
          .from('teams')
          .update({ captain_id: player.id })
          .eq('id', teamId);
      }

      router.push(`/play?code=${code.trim()}&playerId=${player.id}`);
    } catch (err) {
      console.error('Error joining team:', err);
      setError('erro ao entrar no time, tenta de novo');
      setLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#123F7A] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#FFD200]/60">
              Acampadentro 2026
            </p>
            <h1
              className="font-black uppercase leading-none text-[#FFD200]"
              style={{ fontSize: 'clamp(3rem, 12vw, 5.5rem)' }}
            >
              DESPERTA!
            </h1>
          </div>
          <AuthGate
            title="ENTRAR NO JOGO"
            subtitle="entra com Google pra evitar resposta duplicada"
            loading={authLoading}
            onSignIn={signInWithGoogle}
          />
        </div>
      </div>
    );
  }

  if (step === 'enter-code') {
    return (
      <div className="min-h-screen bg-[#123F7A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #FFD200 0px, #FFD200 1px, transparent 1px, transparent 50px), repeating-linear-gradient(180deg, #FFD200 0px, #FFD200 1px, transparent 1px, transparent 50px)',
          }}
        />

        <div className="absolute top-5 left-5 opacity-30">
          <Image src={logo} alt="Logo" width={36} height={36} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full max-w-sm"
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FFD200]/50">
              Acampadentro 2026
            </p>
            <h1
              className="font-black uppercase leading-none text-[#FFD200]"
              style={{ fontSize: 'clamp(2.8rem, 11vw, 5rem)' }}
            >
              ENTRAR
            </h1>
            <p className="mt-1 text-base font-bold text-white/50">
              coloca o código da sala e seu nome
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border-4 border-[#FFD200] bg-white shadow-[8px_8px_0_#FFD200] p-7">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="mb-5 rounded-lg border-3 border-red-400 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shake"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-black/40">
                  Código da sala
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  maxLength={4}
                  className="brutal-input w-full rounded-xl px-4 py-5 text-center text-6xl font-black tracking-[0.4em] text-black"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-black/40">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="SEU NOME"
                  maxLength={20}
                  className="brutal-input w-full rounded-xl px-5 py-4 text-xl font-black uppercase text-black placeholder:text-black/30"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || !code.trim() || !name.trim() || code.length !== 4}
                className="brutal-btn w-full rounded-xl bg-[#123F7A] py-5 text-xl font-black uppercase text-[#FFD200]"
              >
                {loading ? 'entrando...' : 'Entrar no camp →'}
              </motion.button>
            </form>

            <div className="mt-5 flex items-center justify-between">
              <Link href="/" className="text-xs font-bold uppercase text-black/40 hover:text-black/70">
                ← voltar
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="text-xs font-bold uppercase text-black/30 hover:text-black/60"
              >
                sair ({user.email?.split('@')[0]})
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step: select-team
  return (
    <div className="min-h-screen bg-[#123F7A] flex flex-col items-center justify-start p-6 pt-10 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #FFD200 0px, #FFD200 1px, transparent 1px, transparent 50px), repeating-linear-gradient(180deg, #FFD200 0px, #FFD200 1px, transparent 1px, transparent 50px)',
        }}
      />

      <div className="absolute top-5 left-5 opacity-30">
        <Image src={logo} alt="Logo" width={36} height={36} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full max-w-lg"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FFD200]/50">
            Sala {code} · {name.toUpperCase()}
          </p>
          <h1
            className="font-black uppercase leading-none text-[#FFD200]"
            style={{ fontSize: 'clamp(2.2rem, 9vw, 4rem)' }}
          >
            ESCOLHA<br />SEU TIME
          </h1>
          <p className="mt-2 text-sm font-bold text-white/40">
            Escolha seu lado — o camp começa agora
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-lg border-3 border-red-400 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {teams.length === 0 && !isCreatingTeam && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-4 border-[#FFD200] bg-white p-8 text-center shadow-[8px_8px_0_#FFD200]"
          >
            <p className="text-xl font-black uppercase text-black">
              Nenhum time ainda
            </p>
            <p className="mt-1 text-sm font-bold text-black/50">
              Seja o primeiro — crie o seu time
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreatingTeam(true)}
              className="brutal-btn mt-6 w-full rounded-xl bg-black py-5 text-lg font-black uppercase text-[#FFD200]"
            >
              Criar time
            </motion.button>
          </motion.div>
        )}

        {teams.length > 0 && !isCreatingTeam && (
          <div className="space-y-3">
            {teams.map((team, index) => (
              <motion.button
                key={team.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => joinTeam(team.id)}
                disabled={loading}
                className="brutal-btn w-full rounded-xl border-4 border-black bg-white p-5 text-left shadow-[5px_5px_0_#000] transition-colors hover:bg-[#FFD200]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl leading-none">{team.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-black uppercase text-black leading-none">{team.name}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-black/40">
                      Entrar nesse time →
                    </p>
                  </div>
                  <span className="text-3xl text-black/20">→</span>
                </div>
              </motion.button>
            ))}

            {teams.length < 2 && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreatingTeam(true)}
                disabled={loading}
                className="w-full rounded-xl border-3 border-white/20 bg-white/10 py-4 text-sm font-black uppercase tracking-wide text-white/50 transition hover:border-white/40 hover:bg-white/20 hover:text-white/80"
              >
                + Criar outro time
              </motion.button>
            )}
          </div>
        )}

        {isCreatingTeam && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-4 border-[#FFD200] bg-white shadow-[8px_8px_0_#FFD200] p-7 space-y-5"
          >
            <h3 className="text-2xl font-black uppercase text-black">Criar time</h3>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-black/40">
                Nome do time
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="GUERREIROS DE DEUS"
                maxLength={20}
                className="brutal-input w-full rounded-xl px-5 py-4 text-lg font-black uppercase text-black placeholder:text-black/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-black/40">
                Emoji do time
              </label>
              <div className="relative">
                <select
                  value={selectedEmoji}
                  onChange={(e) => setSelectedEmoji(e.target.value)}
                  className="brutal-input w-full rounded-xl px-5 py-4 text-3xl font-bold uppercase appearance-none cursor-pointer bg-white"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.5rem',
                    paddingRight: '3.5rem',
                  }}
                >
                  {EMOJI_OPTIONS.map((emoji) => (
                    <option key={emoji} value={emoji} className="text-3xl bg-white">
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateTeam}
                disabled={loading || !newTeamName.trim()}
                className="brutal-btn w-full rounded-xl bg-black py-4 text-base font-black uppercase text-[#FFD200]"
              >
                {loading ? 'criando...' : 'Criar e entrar'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreatingTeam(false)}
                disabled={loading}
                className="brutal-btn w-full rounded-xl border-2 border-black bg-white py-4 text-base font-black uppercase text-black"
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
