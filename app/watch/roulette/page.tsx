'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { Player, Difficulty } from '@/types';
import logo from '@/app/images/verticallogo.png';

type RoulettePhase =
  | 'name-roulette'
  | 'waiting-difficulty'
  | 'difficulty-revealed'
  | 'question-revealed'
  | 'final-results';

function WatchRouletteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { room, loading: roomLoading } = useRealtimeRoom(code);
  const { players } = useRealtimePlayers(room?.id || null);
  const { teams } = useRealtimeTeams(room?.id || null);

  const [phase, setPhase] = useState<RoulettePhase>('name-roulette');
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');

  useEffect(() => {
    if (!roomLoading && !room) {
      router.push('/watch');
    }
  }, [room, roomLoading, router]);

  useEffect(() => {
    if (room?.phase !== 'onthespot') {
      router.push(`/watch/game?code=${code}`);
    }
  }, [room?.phase, router, code]);

  useEffect(() => {
    if (!room) return;

    const supabase = createClient();
    const channel = supabase.channel(`roulette:${room.id}`)
      .on('broadcast', { event: 'difficulty_result' }, (payload: any) => {
        setDifficulty(payload.payload?.difficulty);
        setPhase('difficulty-revealed');
        setTimeout(() => {
          setPhase('question-revealed');
        }, 2000);
      })
      .on('broadcast', { event: 'name_result' }, (payload: any) => {
        const player = players.find(p => p.id === payload.payload?.playerId);
        if (player) {
          setSelectedPlayer(player);
          setPhase('waiting-difficulty');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room, players]);


  if (roomLoading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black text-3xl font-black uppercase">carregando...</div>
      </div>
    );
  }

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const availablePlayers = players.filter((p) => !p.has_played_roulette);
  const currentTeam = teams[currentTeamIndex % teams.length];

  if (phase === 'final-results') {
    const winningTeam = sortedTeams[0];
    const winningPlayers = players
      .filter((p) => p.team_id === winningTeam?.id)
      .sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="absolute top-4 left-4 opacity-50">
          <Image src={logo} alt="Logo" width={50} height={50} />
        </div>
        <div className="absolute top-4 right-4 z-10">
          <div className="brutal-card px-4 py-2 bg-purple-500">
            <p className="text-white font-black uppercase text-sm">👁️ assistindo</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-5xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <h1 className="text-7xl md:text-9xl font-black text-black uppercase mb-8">
              🏆 TIME VENCEDOR
            </h1>

            {winningTeam && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="brutal-card bg-gradient-to-br from-yellow-400 to-yellow-500 p-12 md:p-20"
              >
                <div className="text-9xl md:text-[12rem] mb-8 animate-bounce">
                  {winningTeam.emoji}
                </div>
                <h3 className="text-6xl md:text-8xl font-black text-black uppercase mb-8">
                  {winningTeam.name}
                </h3>
                <div className="text-9xl md:text-[10rem] font-black text-black mb-10">
                  {winningTeam.score}
                </div>
                <p className="text-4xl md:text-5xl font-black text-black uppercase mb-10">
                  PONTOS TOTAIS
                </p>

                <div className="brutal-border bg-white p-8 rounded-2xl space-y-4 max-w-3xl mx-auto">
                  <p className="text-3xl font-black text-black uppercase mb-6">🍕 NÃO PAGAM A PIZZA</p>
                  {winningPlayers.map((player, idx) => (
                    <div key={player.id} className="flex items-center justify-between gap-4 p-4 bg-yellow-100 rounded-xl">
                      <div className="flex items-center gap-4 flex-1">
                        {idx === 0 && <span className="text-4xl">👑</span>}
                        <span className="text-2xl md:text-3xl font-black text-black uppercase">
                          {player.name}
                        </span>
                      </div>
                      <span className="text-3xl md:text-4xl font-black text-black">
                        {player.score}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 md:p-12 relative">
      <div className="absolute top-4 left-4 opacity-50 z-10">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </div>
      <div className="absolute top-4 right-4 z-10">
        <div className="brutal-card px-4 py-2 bg-purple-500">
          <p className="text-white font-black uppercase text-sm">👁️ assistindo</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Team Headers */}
        <div className="flex justify-center gap-8 flex-wrap">
          {sortedTeams.map((team) => {
            return (
              <div
                key={team.id}
                className="brutal-card px-12 py-8 flex items-center gap-5"
              >
                <span className="text-6xl md:text-7xl">{team.emoji}</span>
                <div>
                  <p className="text-3xl md:text-4xl font-black uppercase text-black">
                    {team.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Name Roulette */}
        {phase === 'name-roulette' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10"
          >
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase">
              vez do time: {currentTeam?.emoji} {currentTeam?.name}
            </h2>

            <div className="brutal-card p-16 md:p-20 min-h-48 flex items-center justify-center">
              <div className="text-7xl md:text-8xl font-black text-black">
                {selectedPlayer ? selectedPlayer.name.toUpperCase() : '?'}
              </div>
            </div>

            <p className="text-2xl md:text-3xl font-bold text-black uppercase mt-6">
              {availablePlayers.length} {availablePlayers.length === 1 ? 'jogador restante' : 'jogadores restantes'}
            </p>
          </motion.div>
        )}

        {/* Waiting for Difficulty */}
        {phase === 'waiting-difficulty' && selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="brutal-card p-16 text-center space-y-8"
          >
            <h2 className="text-4xl font-black text-black uppercase">jogador selecionado:</h2>
            <div className="text-8xl font-black text-black">{selectedPlayer.name.toUpperCase()}</div>
            <p className="text-3xl font-bold text-black">aguardando a roleta de dificuldade no celular...</p>
          </motion.div>
        )}

        {/* Difficulty Revealed */}
        {phase === 'difficulty-revealed' && difficulty && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="brutal-card p-16 text-center"
          >
            <h2 className="text-4xl font-black text-black uppercase mb-8">dificuldade:</h2>
            <div className={`text-9xl font-black ${
              difficulty === 'easy' ? 'text-green-600' :
              difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {difficulty === 'easy' && '🟢 FÁCIL'}
              {difficulty === 'medium' && '🟡 MÉDIO'}
              {difficulty === 'hard' && '🔴 DIFÍCIL'}
            </div>
          </motion.div>
        )}

        {/* Question Revealed */}
        {phase === 'question-revealed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="brutal-card p-10">
              <h2 className="text-4xl font-black text-black mb-6 uppercase">pergunta:</h2>
              <p className="text-4xl font-bold text-black leading-tight">{currentQuestion}</p>
              <p className="text-xl font-bold text-black mt-8 uppercase">o jogador responde verbalmente</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function WatchRoulettePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-black text-3xl font-black uppercase">carregando...</div>
        </div>
      }
    >
      <WatchRouletteContent />
    </Suspense>
  );
}
