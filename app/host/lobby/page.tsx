'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import logo from '@/app/images/verticallogo.png';

function HostLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { room, loading: roomLoading } = useRealtimeRoom(code);
  const { players } = useRealtimePlayers(room?.id || null);
  const { teams } = useRealtimeTeams(room?.id || null);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removingPlayer, setRemovingPlayer] = useState<string | null>(null);

  useEffect(() => {
    if (!roomLoading && !room) {
      router.push('/host');
    }
  }, [room, roomLoading, router]);

  async function startGame() {
    if (!room || players.length === 0) return;

    setStarting(true);
    try {
      const supabase = createClient();
      await supabase
        .from('rooms')
        .update({ status: 'active' })
        .eq('id', room.id);

      router.push(`/host/game?code=${code}`);
    } catch (err) {
      console.error('Error starting game:', err);
      setStarting(false);
    }
  }

  async function skipToRoulette() {
    if (!room) return;

    try {
      const supabase = createClient();
      await supabase
        .from('rooms')
        .update({ phase: 'onthespot', status: 'active' })
        .eq('id', room.id);

      router.push(`/host/roulette?code=${code}`);
    } catch (err) {
      console.error('Error skipping to roulette:', err);
    }
  }

  async function removePlayer(playerId: string, teamId: string) {
    console.log('removePlayer called with:', { playerId, teamId });

    if (!room) {
      console.log('No room found');
      return;
    }

    if (!confirm('Remover este jogador?')) {
      return;
    }

    setRemovingPlayer(playerId);

    try {
      const supabase = createClient();

      console.log('Checking if player is captain...');
      // Check if player is captain
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('captain_id')
        .eq('id', teamId)
        .single();

      console.log('Team data:', team, 'Error:', teamError);

      if (teamError) {
        console.error('Error fetching team:', teamError);
      }

      // If player is captain, clear captain_id first
      if (team?.captain_id === playerId) {
        console.log('Player is captain, clearing captain_id...');
        const { error: updateError } = await supabase
          .from('teams')
          .update({ captain_id: null })
          .eq('id', teamId);

        console.log('Captain update error:', updateError);
      }

      console.log('Deleting player...');
      // Delete player (answers should cascade automatically)
      const { error: deleteError, data: deleteData } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .select();

      console.log('Delete result:', { deleteData, deleteError });

      if (deleteError) {
        console.error('Error deleting player:', deleteError);
        alert('Erro ao remover jogador: ' + deleteError.message);
      } else {
        console.log('Player deleted successfully!');
      }

      setRemovingPlayer(null);
    } catch (err) {
      console.error('Caught error removing player:', err);
      alert('Erro ao remover jogador: ' + String(err));
      setRemovingPlayer(null);
    }
  }

  function copyCode() {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (roomLoading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black text-3xl font-black uppercase">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-6 md:p-8 relative">
      <div className="absolute top-4 left-4 opacity-50 z-10">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </div>
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full gap-6 md:gap-8">
        {/* Room Code Display */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex-shrink-0"
        >
          <h1 className="text-3xl md:text-5xl font-black text-black uppercase mb-4">
            SALA DE ESPERA
          </h1>

          <div className="brutal-card inline-block p-6 md:p-8">
            <p className="text-sm md:text-lg font-bold text-black uppercase mb-3">CÓDIGO DA SALA</p>
            <div className="text-5xl md:text-6xl font-black text-black tracking-widest">
              {code}
            </div>
          </div>

          <p className="text-sm md:text-base font-bold text-black uppercase mt-3">
            manda esse código pro grupo 👇
          </p>
        </motion.div>

        {/* Teams Display */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-4">
              {teams.map((team, teamIndex) => {
                const teamPlayers = players.filter((p) => p.team_id === team.id);
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: teamIndex * 0.1 }}
                    className="brutal-card p-6 md:p-8 flex flex-col"
                  >
                    <div className="flex items-center gap-4 pb-4 border-b-4 border-black">
                      <span className="text-4xl md:text-5xl">{team.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-black text-black uppercase truncate">{team.name}</h3>
                        <p className="text-sm md:text-base font-bold text-black/70 uppercase">
                          {teamPlayers.length} {teamPlayers.length === 1 ? 'jogador' : 'jogadores'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4 flex-1 overflow-y-auto">
                      <AnimatePresence>
                        {teamPlayers.map((player, playerIndex) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: playerIndex * 0.05 }}
                            className="brutal-border bg-white p-3 rounded-xl flex items-center gap-3"
                          >
                            <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                            <span className="text-base md:text-lg font-bold text-black uppercase flex-1 truncate">
                              {player.name}
                            </span>
                            {player.id === team.captain_id && (
                              <span className="text-xl md:text-2xl flex-shrink-0">👑</span>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removePlayer(player.id, team.id)}
                              disabled={removingPlayer === player.id}
                              className="text-red-600 hover:text-red-800 font-black text-lg flex-shrink-0 disabled:opacity-50"
                              title="Remover jogador"
                            >
                              ✕
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {teamPlayers.length === 0 && (
                        <div className="text-center py-6 text-black/50 text-sm font-bold uppercase">
                          esperando jogadores...
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="brutal-card p-12 text-center"
            >
              <p className="text-2xl md:text-3xl font-black text-black uppercase">
                esperando os times serem criados...
              </p>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-2xl mx-auto w-full flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startGame}
            disabled={players.length === 0 || teams.length === 0 || starting}
            className="brutal-btn w-full bg-black text-white font-black py-5 md:py-6 px-8 rounded-xl text-xl md:text-2xl uppercase"
          >
            {starting
              ? 'iniciando...'
              : teams.length === 0
              ? 'esperando os times...'
              : players.length === 0
              ? 'esperando jogadores...'
              : `INICIAR O CAOS 🔥 (${players.length} jogadores)`}
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/host')}
              className="brutal-btn flex-1 bg-white text-black font-black py-4 px-4 rounded-xl text-base md:text-lg uppercase"
            >
              cancelar
            </motion.button>

            {/* TEST BUTTON */}
            {teams.length > 0 && players.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={skipToRoulette}
                className="brutal-btn flex-1 bg-purple-500 text-white font-black py-4 px-4 rounded-xl text-sm md:text-base uppercase border-purple-700"
              >
                🎯 pular pra roleta (teste)
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HostLobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-black text-3xl font-black uppercase">Carregando...</div>
        </div>
      }
    >
      <HostLobbyContent />
    </Suspense>
  );
}
