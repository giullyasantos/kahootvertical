'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { Player, Difficulty } from '@/types';
import { getQuestionsByDifficulty } from '@/lib/questions';
import logo from '@/app/images/verticallogo.png';

type RoulettePhase =
  | 'waiting'
  | 'selected'
  | 'spin-difficulty'
  | 'question-time'
  | 'finished';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
const difficultyEmojis = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};
const difficultyLabels = {
  easy: 'FÁCIL',
  medium: 'MÉDIO',
  hard: 'DIFÍCIL',
};

function PlayRouletteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const playerId = searchParams.get('playerId');
  const { room, loading: roomLoading } = useRealtimeRoom(code);
  const { players } = useRealtimePlayers(room?.id || null);
  const { teams } = useRealtimeTeams(room?.id || null);

  const [phase, setPhase] = useState<RoulettePhase>('waiting');
  const [currentDifficultyIndex, setCurrentDifficultyIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const currentPlayer = players.find((p) => p.id === playerId);
  const currentTeam = teams.find((t) => t.id === currentPlayer?.team_id);
  const isCaptain = currentPlayer?.id === currentTeam?.captain_id;

  useEffect(() => {
    if (!playerId || !code) {
      router.push('/join');
    }
  }, [playerId, code, router]);

  useEffect(() => {
    if (!roomLoading && !room) {
      router.push('/join');
    }
  }, [room, roomLoading, router]);

  useEffect(() => {
    if (!room) return;

    // If roulette phase ended, redirect to main play page to see final results
    if (room.phase === 'finished') {
      router.push(`/play?code=${code}&playerId=${playerId}`);
      return;
    }

    if (room.phase !== 'onthespot') {
      router.push(`/play?code=${code}&playerId=${playerId}`);
      return;
    }

    if (currentPlayer?.has_played_roulette) {
      setPhase('finished');
      setIsMyTurn(false); // Reset turn state
    }
  }, [room, currentPlayer, router, code, playerId]);

  useEffect(() => {
    if (!room) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`roulette:${room.id}`)
      .on('broadcast', { event: 'name_result' }, (payload: any) => {
        if (payload.payload?.playerId === currentPlayer?.id) {
          // It's MY turn
          setIsMyTurn(true);
          setPhase('selected');
          setTimeout(() => {
            setPhase('spin-difficulty');
          }, 3000);
        } else {
          // Someone else's turn
          setIsMyTurn(false);
          setPhase('waiting');
        }
      })
      .on('broadcast', { event: 'difficulty_result' }, (payload: any) => {
        if (payload.payload?.difficulty) {
          setSelectedDifficulty(payload.payload.difficulty);
          // Only show question if it's MY turn
          if (isMyTurn) {
            setTimeout(() => {
              setPhase('question-time');
            }, 2000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room, currentPlayer]);


  async function spinDifficulty() {
    if (spinning) return;

    setSpinning(true);

    // Pick a random final index (will land on this after animation)
    const finalIndex = Math.floor(Math.random() * 3);
    const totalIterations = 20;

    let iterations = 0;
    const interval = setInterval(() => {
      iterations++;

      if (iterations >= totalIterations) {
        clearInterval(interval);
        // Set to the final index we chose
        setCurrentDifficultyIndex(finalIndex);
        const finalDifficulty = difficulties[finalIndex];
        setSelectedDifficulty(finalDifficulty);
        setSpinning(false);

        if (room) {
          const supabase = createClient();
          const channel = supabase.channel(`roulette:${room.id}`);
          channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.send({
                type: 'broadcast',
                event: 'difficulty_result',
                payload: { difficulty: finalDifficulty },
              });
            }
          });
        }
      } else {
        // Keep spinning through indices
        setCurrentDifficultyIndex((prev) => (prev + 1) % 3);
      }
    }, 100);
  }


  if (roomLoading || !room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black text-3xl font-black uppercase">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7D043] relative">
      <div className="absolute top-4 left-4 opacity-50 z-10">
        <Image src={logo} alt="Logo" width={40} height={40} />
      </div>
      {/* Header */}
      <div className="brutal-border-thick bg-white p-5 md:p-6 flex justify-between items-center gap-4">
        <div className="text-black">
          <p className="text-base md:text-lg font-bold uppercase">{currentPlayer.name}</p>
        </div>
        {currentTeam && (
          <div className="text-center">
            <p className="text-xs md:text-sm font-bold uppercase text-black">{currentTeam.name}</p>
            <p className="text-4xl md:text-5xl">{currentTeam.emoji}</p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-10">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="text-8xl bounce">⏳</div>
              <h2 className="text-4xl font-black text-black uppercase">
                {isMyTurn ? 'aguardando sua vez...' : 'aguarda a sua vez...'}
              </h2>
              <p className="text-2xl font-bold text-black">
                {isMyTurn ? 'a roleta tá girando no telão' : 'outro jogador tá respondendo'}
              </p>
            </motion.div>
          )}

          {phase === 'selected' && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg"
            >
              <div className="brutal-card p-12 text-center space-y-6 animate-pulse" style={{ borderColor: '#000' }}>
                <div className="text-8xl">🎯</div>
                <h2 className="text-5xl font-black text-black uppercase">
                  É VOCÊ! 🔥
                </h2>
                <p className="text-2xl font-bold text-black">prepara o coração</p>
              </div>
            </motion.div>
          )}

          {phase === 'spin-difficulty' && (
            <motion.div
              key="spin-difficulty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg space-y-10"
            >
              <div className="brutal-card p-12 md:p-14 text-center space-y-10">
                <h2 className="text-3xl md:text-4xl font-black text-black uppercase">
                  gira a roleta de dificuldade
                </h2>

                <div className="text-8xl md:text-9xl">
                  {difficultyEmojis[difficulties[currentDifficultyIndex]]}
                </div>

                <p className="text-4xl md:text-5xl font-black text-black uppercase">
                  {difficultyLabels[difficulties[currentDifficultyIndex]]}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={spinDifficulty}
                  disabled={spinning}
                  className="brutal-btn w-full bg-black text-white font-black py-8 px-12 rounded-xl text-3xl md:text-4xl uppercase"
                >
                  {spinning ? '🎰 escolhendo...' : '🎯 ESCOLHER'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === 'question-time' && (
            <motion.div
              key="question-time"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg"
            >
              <div className="brutal-card p-10 text-center space-y-6">
                <div className="text-8xl">🎤</div>
                <h2 className="text-3xl font-black text-black uppercase leading-tight">
                  agora é com você!
                </h2>
                <p className="text-xl font-bold text-black">
                  responde verbalmente olhando pro telão
                </p>
              </div>
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg space-y-6"
            >
              <div className="brutal-card p-10 text-center space-y-6">
                <div className="text-8xl">✅</div>
                <h2 className="text-4xl font-black text-black uppercase">
                  você já jogou!
                </h2>
                <p className="text-2xl font-bold text-black">
                  aguarda os outros
                </p>
              </div>

              {currentTeam && (
                <div className="brutal-card p-8 text-center">
                  <p className="text-4xl mb-4">{currentTeam.emoji}</p>
                  <p className="text-3xl font-black text-black uppercase mb-2">
                    {currentTeam.name}
                  </p>
                  <p className="text-xl font-bold text-black uppercase">
                    pontuações reveladas no final! 👀
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PlayRoulettePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-black text-3xl font-black uppercase">carregando...</div>
        </div>
      }
    >
      <PlayRouletteContent />
    </Suspense>
  );
}
