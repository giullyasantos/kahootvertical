'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import logo from '@/app/images/verticallogo.png';

function WatchLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { room, loading: roomLoading } = useRealtimeRoom(code);
  const { players } = useRealtimePlayers(room?.id || null);
  const { teams } = useRealtimeTeams(room?.id || null);

  useEffect(() => {
    if (!roomLoading && !room) {
      router.push('/watch');
    }
  }, [room, roomLoading, router]);

  useEffect(() => {
    if (!room) return;

    // Redirect when game starts
    if (room.status === 'active') {
      if (room.phase === 'onthespot') {
        router.push(`/watch/roulette?code=${code}`);
      } else {
        router.push(`/watch/game?code=${code}`);
      }
    }
  }, [room, router, code]);

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

      {/* Watcher Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="brutal-card bg-purple-500 text-white px-6 py-3">
          <p className="text-lg font-black uppercase">👁️ assistindo</p>
        </div>
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

        {/* Info Message */}
        <div className="text-center flex-shrink-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="brutal-card bg-purple-100 p-6 max-w-2xl mx-auto"
          >
            <p className="text-xl md:text-2xl font-black text-black uppercase">
              esperando o host iniciar o jogo...
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function WatchLobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-black text-3xl font-black uppercase">Carregando...</div>
        </div>
      }
    >
      <WatchLobbyContent />
    </Suspense>
  );
}
