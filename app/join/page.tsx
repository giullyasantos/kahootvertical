'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { Room } from '@/types';
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
    if (!room) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          name: name.trim(),
          score: 0,
          team_id: teamId,
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

  if (step === 'enter-code') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-12 relative">
        <div className="absolute top-4 left-4 opacity-50">
          <Image src={logo} alt="Logo" width={50} height={50} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="brutal-card p-12 md:p-16 space-y-10">
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-black text-black uppercase">ENTRAR NO JOGO</h1>
              <p className="text-xl md:text-2xl font-bold text-black">coloca o código e o nome, vai</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="brutal-border bg-red-100 text-black px-8 py-5 rounded-xl font-bold shake"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleCodeSubmit} className="space-y-8">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="XXXX"
                  maxLength={4}
                  className="brutal-input w-full text-center text-5xl sm:text-6xl md:text-7xl font-black px-4 sm:px-6 md:px-8 py-6 md:py-8 rounded-xl tracking-[0.3em] sm:tracking-widest uppercase"
                  style={{ minHeight: '80px' }}
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="seu nome aqui"
                  maxLength={20}
                  className="brutal-input w-full text-2xl md:text-3xl font-bold px-8 py-7 rounded-xl uppercase placeholder:text-black/40"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !code.trim() || !name.trim() || code.length !== 4}
                className="brutal-btn w-full bg-black text-white font-black py-7 px-10 rounded-xl text-2xl md:text-3xl uppercase"
              >
                {loading ? 'entrando...' : 'Bora'}
              </motion.button>
            </form>

            <div className="pt-6 text-center">
              <a href="/" className="text-black font-bold text-xl hover:underline uppercase">
                ← voltar
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-12 relative">
      <div className="absolute top-4 left-4 opacity-50">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl"
      >
        <div className="brutal-card p-12 md:p-16 space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-black uppercase">ESCOLHE SEU TIME</h1>
            <p className="text-xl md:text-2xl font-bold text-black">
              E aí, <span className="underline decoration-4">{name.toUpperCase()}</span>! 👋
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="brutal-border bg-red-100 text-black px-6 py-4 rounded-xl font-bold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {teams.length === 0 && !isCreatingTeam && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center py-8"
            >
              <p className="text-2xl font-bold text-black uppercase">
                nenhum time ainda, cria o primeiro!
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreatingTeam(true)}
                className="brutal-btn bg-black text-white font-black py-6 px-10 rounded-xl text-2xl uppercase"
              >
                Criar Time
              </motion.button>
            </motion.div>
          )}

          {teams.length > 0 && !isCreatingTeam && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team, index) => (
                  <motion.button
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => joinTeam(team.id)}
                    disabled={loading}
                    className="brutal-card p-8 text-left hover:bg-[#F7D043] transition-colors"
                  >
                    <span className="text-7xl mb-4 block">{team.emoji}</span>
                    <p className="font-black text-3xl mb-2 uppercase">{team.name}</p>
                    <p className="text-lg font-bold text-black/70 uppercase">entrar nesse →</p>
                  </motion.button>
                ))}
              </div>

              {teams.length < 2 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreatingTeam(true)}
                  disabled={loading}
                  className="brutal-btn w-full bg-white text-black font-black py-5 px-8 rounded-xl text-xl uppercase"
                >
                  + criar mais um time
                </motion.button>
              )}
            </div>
          )}

          {isCreatingTeam && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-6 border-t-4 border-black"
            >
              <h3 className="text-3xl font-black text-black uppercase">CRIAR TIME</h3>

              <div>
                <label className="block text-black mb-3 text-lg font-bold uppercase">
                  nome do time
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="GUERREIROS DE DEUS"
                  maxLength={20}
                  className="brutal-input w-full text-xl font-bold px-6 py-4 rounded-xl uppercase placeholder:text-black/40"
                />
              </div>

              <div>
                <label className="block text-black mb-3 text-lg font-bold uppercase">
                  escolhe um emoji
                </label>
                <div className="relative">
                  <select
                    value={selectedEmoji}
                    onChange={(e) => setSelectedEmoji(e.target.value)}
                    className="brutal-input w-full text-4xl font-bold px-6 py-5 rounded-xl uppercase appearance-none cursor-pointer bg-white"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5rem',
                      paddingRight: '3.5rem'
                    }}
                  >
                    {EMOJI_OPTIONS.map((emoji) => (
                      <option key={emoji} value={emoji} className="text-4xl bg-white">
                        {emoji}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hidden">
                <div className="grid grid-cols-5 gap-3">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-5xl p-6 rounded-xl transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-black brutal-shadow scale-110'
                          : 'bg-white brutal-border hover:bg-[#F7D043]'
                      }`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTeam}
                  disabled={loading || !newTeamName.trim()}
                  className="brutal-btn w-full bg-black text-white font-black py-5 px-6 rounded-xl text-lg uppercase"
                >
                  {loading ? 'criando...' : 'criar e entrar'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreatingTeam(false)}
                  disabled={loading}
                  className="brutal-btn w-full bg-white text-black font-black py-5 px-6 rounded-xl text-lg uppercase"
                >
                  cancela
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
