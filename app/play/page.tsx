'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { questions } from '@/lib/questions';
import { calculateScore } from '@/lib/utils';
import { AnswerColor } from '@/types';
import winnerGif from '@/app/images/winner.gif';
import loserGif from '@/app/images/loser.gif';
import logo from '@/app/images/verticallogo.png';

type GameState = 'waiting' | 'playing' | 'answered' | 'result' | 'finished';

const answerColors: AnswerColor[] = ['red', 'blue', 'yellow', 'green'];

const colorClasses: Record<AnswerColor, string> = {
  red: 'bg-[#E21B3C]',
  blue: 'bg-[#1368CE]',
  yellow: 'bg-[#D89E00]',
  green: 'bg-[#26890C]',
};

const answerLabels = ['A', 'B', 'C', 'D'];

const correctMessages = [
  "CERTO! você tá abençoado hoje 🙌",
  "ERA ESSE! Deus tá do seu lado 😤",
  "ACERTOU! tá estudando a Palavra né 👀",
  "CORRETO! esse aqui sabe das coisas 👑",
  "ISSO! você é diferenciado fr fr ✨",
  "ACERTOU! a Bíblia te preparou 📖🔥",
  "CERTO! destaque da célula 🚀",
  "ERA ESSE! você tá voando hoje 🦅",
];

const incorrectMessages = [
  "ERROU! vai precisar de oração depois 🙏😭",
  "NÃO ERA ESSE... próxima você recupera 😬",
  "ERROU! tava dormindo no culto? 😴",
  "INCORRETO! isso foi difícil de ver 💀",
  "NÃO! a pizza tá escapando 🍕💨",
  "ERROU! confia no processo 😭",
  "INCORRETO! até o pastor ficou preocupado 😬",
  "NÃO ERA ESSE... lê a Bíblia essa semana 📖",
];

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const playerId = searchParams.get('playerId');
  const { room, loading: roomLoading } = useRealtimeRoom(code);
  const { players } = useRealtimePlayers(room?.id || null);
  const { teams } = useRealtimeTeams(room?.id || null);

  const [gameState, setGameState] = useState<GameState>('waiting');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    points: number;
  } | null>(null);
  const [previousQuestionIndex, setPreviousQuestionIndex] = useState<number>(-1);
  const [timeIsUp, setTimeIsUp] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const currentPlayer = players.find((p) => p.id === playerId);
  const currentTeam = teams.find((t) => t.id === currentPlayer?.team_id);
  const currentQuestionIndex = room?.current_question_index || 0;
  const currentQuestion = questions[currentQuestionIndex];
  const playerRank =
    players.findIndex((p) => p.id === playerId) + 1 || players.length;

  useEffect(() => {
    if (!playerId || !code) {
      router.push('/join');
    }
  }, [playerId, code, router]);

  useEffect(() => {
    if (!room) return;

    if (room.phase === 'onthespot') {
      router.push(`/play-roulette?code=${code}&playerId=${playerId}`);
      return;
    }

    if (room.phase === 'finished') {
      setGameState('finished');
      return;
    }

    if (room.status === 'waiting') {
      setGameState('waiting');
    } else if (room.status === 'active') {
      if (currentQuestionIndex !== previousQuestionIndex) {
        setGameState('playing');
        setSelectedAnswer(null);
        setLastAnswerResult(null);
        setQuestionStartTime(Date.now());
        setPreviousQuestionIndex(currentQuestionIndex);
        setTimeIsUp(false); // Reset time's up flag for new question
      }
    }
  }, [room, currentQuestionIndex, previousQuestionIndex, router, code, playerId]);

  useEffect(() => {
    if (!room) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`game:${room.id}`)
      .on('broadcast', { event: 'time_up' }, (payload: any) => {
        if (payload.payload?.questionIndex === currentQuestionIndex) {
          setTimeIsUp(true);
        }
      })
      .on('broadcast', { event: 'reveal_answer' }, async (payload: any) => {
        if (payload.payload?.questionIndex === currentQuestionIndex) {
          // Only show result if player answered
          if (lastAnswerResult && gameState === 'answered') {
            setGameState('result');

            // Update player score
            if (lastAnswerResult.isCorrect && currentPlayer) {
              await supabase
                .from('players')
                .update({ score: currentPlayer.score + lastAnswerResult.points })
                .eq('id', currentPlayer.id);

              if (currentPlayer.team_id) {
                const { data: team } = await supabase
                  .from('teams')
                  .select('score')
                  .eq('id', currentPlayer.team_id)
                  .single();

                if (team) {
                  await supabase
                    .from('teams')
                    .update({ score: team.score + lastAnswerResult.points })
                    .eq('id', currentPlayer.team_id);
                }
              }

              // Fire confetti for correct answer
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room, currentQuestionIndex, lastAnswerResult, currentPlayer]);

  async function handleAnswer(answerIndex: number) {
    if (!room || !currentPlayer || gameState !== 'playing' || timeIsUp) return;

    setSelectedAnswer(answerIndex);
    setGameState('answered');

    try {
      const supabase = createClient();
      const timeElapsed = Date.now() - questionStartTime;
      const isCorrect = answerIndex === currentQuestion.correct;
      const points = calculateScore(isCorrect, timeElapsed);

      // Pick random message
      const messages = isCorrect ? correctMessages : incorrectMessages;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setResultMessage(randomMessage);

      await supabase.from('answers').insert({
        room_id: room.id,
        player_id: currentPlayer.id,
        question_index: currentQuestionIndex,
        answer_index: answerIndex,
        is_correct: isCorrect,
        points_earned: points,
      });

      // Store result but don't show it yet
      setLastAnswerResult({ isCorrect, points });
    } catch (err) {
      console.error('Error submitting answer:', err);
      setGameState('playing');
      setSelectedAnswer(null);
    }
  }

  if (roomLoading || !room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black text-3xl font-black uppercase">carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7D043] relative">
      <div className="absolute top-4 left-4 opacity-50 z-10">
        <Image src={logo} alt="Logo" width={40} height={40} />
      </div>
      {/* Top Bar */}
      <div className="brutal-border-thick bg-white p-5 md:p-6 flex justify-between items-center gap-4">
        <div className="text-black">
          <p className="text-xs md:text-sm font-bold uppercase">sala</p>
          <p className="text-lg md:text-xl font-black">{code}</p>
        </div>
        <div className="text-black text-center">
          <p className="text-base md:text-lg font-bold uppercase">{currentPlayer.name}</p>
        </div>
        <div className="text-black text-right">
          <p className="text-xs md:text-sm font-bold uppercase">time</p>
          <p className="text-2xl md:text-3xl">{currentTeam?.emoji}</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-10">
        <AnimatePresence mode="wait">
          {gameState === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="text-8xl bounce">⏳</div>
              <h2 className="text-4xl font-black text-black uppercase">
                aguardando...
              </h2>
              <p className="text-2xl font-bold text-black">o jogo vai começar em breve!</p>
            </motion.div>
          )}

          {gameState === 'playing' && currentQuestion && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl space-y-8"
            >
              <div className="brutal-card p-8 md:p-10 text-center">
                <p className="text-lg md:text-xl font-bold text-black uppercase mb-4">
                  pergunta {currentQuestionIndex + 1} de {questions.length}
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-black leading-tight">
                  {currentQuestion.question}
                </h2>
              </div>

              {timeIsUp && selectedAnswer === null && (
                <div className="brutal-border bg-red-100 text-black px-6 py-4 rounded-xl text-center">
                  <p className="text-xl font-black uppercase">⏰ Tempo Esgotado!</p>
                </div>
              )}

              <div className="space-y-5">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: timeIsUp || selectedAnswer !== null ? 1 : 1.02 }}
                    whileTap={{ scale: timeIsUp || selectedAnswer !== null ? 1 : 0.98 }}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null || timeIsUp}
                    className={`${colorClasses[answerColors[index]]} brutal-btn w-full p-7 rounded-xl flex items-center gap-5 ${
                      selectedAnswer === index ? 'ring-8 ring-black' : ''
                    } ${timeIsUp && selectedAnswer === null ? 'opacity-50' : ''}`}
                  >
                    <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center text-3xl font-black flex-shrink-0">
                      {answerLabels[index]}
                    </div>
                    <p className="text-white text-xl md:text-2xl font-black uppercase text-left flex-1">
                      {option}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'answered' && (
            <motion.div
              key="answered"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <div className="text-8xl">✓</div>
              <h2 className="text-4xl font-black text-black uppercase">
                mandou bem!
              </h2>
              <p className="text-2xl font-bold text-black">aguarda os outros...</p>
            </motion.div>
          )}

          {gameState === 'result' && lastAnswerResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8 p-8 rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-9xl"
              >
                {lastAnswerResult.isCorrect ? '🎉' : '❌'}
              </motion.div>

              <h2 className="text-5xl font-black uppercase text-black">
                {resultMessage}
              </h2>

              {lastAnswerResult.isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="brutal-card p-8 inline-block"
                >
                  <p className="text-xl font-bold text-black uppercase mb-2">pontos ganhos</p>
                  <p className="text-6xl font-black text-black count-up">
                    +{lastAnswerResult.points}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {gameState === 'finished' && currentPlayer && currentTeam && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 max-w-lg p-10 rounded-2xl"
            >
              <div className="flex justify-center">
                <Image
                  src={playerRank === 1 ? winnerGif : loserGif}
                  alt={playerRank === 1 ? 'Winner' : 'Loser'}
                  width={300}
                  height={300}
                  className="rounded-2xl"
                  unoptimized
                />
              </div>
              <h2 className="text-5xl font-black text-black uppercase">
                {playerRank === 1 ? 'PIZZA SEM PAGAR BB 🍕👑' : playerRank === 2 ? 'quase... ainda come pizza mas paga 😭' : playerRank === 3 ? '3º lugar... paga a pizza igual 💀' : 'paga a pizza igual 💀'}
              </h2>

              <div className="brutal-card p-10">
                <p className="text-4xl mb-4">{currentTeam.emoji}</p>
                <p className="text-2xl font-bold text-black uppercase mb-3">
                  {currentTeam.name}
                </p>
                <p className="text-xl font-bold text-black/70 uppercase mb-3">
                  pontuação final
                </p>
                <p className="text-7xl font-black text-black mb-4">
                  {currentPlayer.score}
                </p>
                <p className="text-3xl font-black text-black">
                  {playerRank === 1 && '🥇 campeão!'}
                  {playerRank === 2 && '🥈 2º lugar!'}
                  {playerRank === 3 && '🥉 3º lugar!'}
                  {playerRank > 3 && `${playerRank}º lugar`}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/')}
                className="brutal-btn bg-black text-white font-black py-6 px-10 rounded-xl text-2xl uppercase"
              >
                voltar ao início
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-black text-3xl font-black uppercase">carregando...</div>
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
