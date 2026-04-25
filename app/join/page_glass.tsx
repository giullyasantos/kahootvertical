'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { Room } from '@/types';

const EMOJI_OPTIONS = ['⚡', '🔥', '💎', '🌟', '🎯', '🦁', '🐉', '👑', '🚀', '💪'];

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
        setError('Sala não encontrada. Verifique o código.');
        setLoading(false);
        return;
      }

      if (roomData.status !== 'waiting') {
        setError('Esta sala já iniciou o jogo.');
        setLoading(false);
        return;
      }

      setRoom(roomData);
      setStep('select-team');
      setLoading(false);
    } catch (err) {
      console.error('Error finding room:', err);
      setError('Erro ao buscar sala. Tente novamente.');
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
        setError('Erro ao criar time. Tente novamente.');
        setLoading(false);
        return;
      }

      await joinTeam(team.id, true);
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Erro ao criar time. Tente novamente.');
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
        setError('Erro ao entrar no time. Tente novamente.');
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
      setError('Erro ao entrar no time. Tente novamente.');
      setLoading(false);
    }
  }

  if (step === 'enter-code') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold gradient-text">Entrar no Jogo</h1>
              <p className="text-gray-400">Digite o código da sala e seu nome</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-2xl shake"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="· · · ·"
                  maxLength={4}
                  className="w-full glass text-white text-center text-5xl font-bold px-6 py-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 tracking-[0.5em] transition-all"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  maxLength={20}
                  className="w-full glass text-white text-xl px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !code.trim() || !name.trim() || code.length !== 4}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-full text-xl transition-all shadow-lg disabled:shadow-none"
              >
                {loading ? (
                  <span className="shimmer">Entrando...</span>
                ) : (
                  'Continuar'
                )}
              </motion.button>
            </form>

            <div className="pt-4 text-center">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">
                ← Voltar
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="glass rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Escolha seu Time</h1>
            <p className="text-gray-400">Olá, <span className="text-purple-400 font-semibold">{name}</span>!</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-2xl"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {teams.length === 0 && !isCreatingTeam && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-center"
            >
              <p className="text-gray-300 text-lg">Nenhum time criado ainda. Seja o primeiro!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreatingTeam(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-full text-xl shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Criar Time
              </motion.button>
            </motion.div>
          )}

          {teams.length > 0 && !isCreatingTeam && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team, index) => (
                  <motion.button
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => joinTeam(team.id)}
                    disabled={loading}
                    className="glass hover:bg-white/10 disabled:opacity-50 text-white p-6 rounded-2xl transition-all border-2 border-transparent hover:border-purple-500"
                  >
                    <span className="text-6xl mb-3 block">{team.emoji}</span>
                    <div className="text-left">
                      <p className="font-bold text-2xl mb-1">{team.name}</p>
                      <p className="text-sm text-gray-400">Entrar neste time</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {teams.length < 2 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreatingTeam(true)}
                  disabled={loading}
                  className="w-full border-2 border-purple-500 text-white font-bold py-4 px-6 rounded-full text-lg transition-all hover:bg-purple-500/10"
                >
                  Criar Novo Time
                </motion.button>
              )}
            </div>
          )}

          {isCreatingTeam && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 glass p-6 rounded-2xl border border-purple-500/30"
            >
              <h3 className="text-2xl font-bold text-white">Criar Time</h3>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">Nome do Time</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Ex: Guerreiros de Deus"
                  maxLength={20}
                  className="w-full glass text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-3 text-sm font-medium">Escolha um Emoji</label>
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-4xl p-4 rounded-xl transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 scale-110 shadow-lg shadow-purple-500/50'
                          : 'glass hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTeam}
                  disabled={loading || !newTeamName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg"
                >
                  {loading ? 'Criando...' : 'Criar e Entrar'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreatingTeam(false)}
                  disabled={loading}
                  className="glass hover:bg-white/10 text-white font-bold py-3 px-6 rounded-full transition-all"
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
