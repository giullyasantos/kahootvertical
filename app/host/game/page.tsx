'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeAnswers } from '@/hooks/useRealtimeAnswers';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { questions } from '@/lib/questions';
import { AnswerColor } from '@/types';
import logo from '@/app/images/verticallogo.png';

type ViewMode = 'question' | 'reveal' | 'scoreboard';

const answerColors: AnswerColor[] = ['red', 'blue', 'yellow', 'green'];

const colorClasses: Record<AnswerColor, string> = {
  red: 'bg-[#E21B3C]',
  blue: 'bg-[#1368CE]',
  yellow: 'bg-[#D89E00]',
  green: 'bg-[#26890C]',
};

const answerLabels = ['A', 'B', 'C', 'D'];

function HostGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { room, loading: roomLoading } = useRealtimeRoom(code);
  const { players } = useRealtimePlayers(room?.id || null);
  const { teams } = useRealtimeTeams(room?.id || null);
  const currentQuestionIndex = room?.current_question_index || 0;
  const { answers, answerCount } = useRealtimeAnswers(
    room?.id || null,
    currentQuestionIndex
  );
  const [viewMode, setViewMode] = useState<ViewMode>('question');
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(60);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  useEffect(() => {
    if (!roomLoading && !room) {
      router.push('/host');
    }
  }, [room, roomLoading, router]);

  useEffect(() => {
    if (room?.phase === 'finished') {
      setViewMode('scoreboard');
    }
  }, [room?.phase]);

  useEffect(() => {
    if (viewMode === 'question' && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Broadcast time's up to all players
            if (room) {
              const supabase = createClient();
              const channel = supabase.channel(`game:${room.id}`);
              channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                  await channel.send({
                    type: 'broadcast',
                    event: 'time_up',
                    payload: { questionIndex: currentQuestionIndex },
                  });
                }
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [viewMode, timeLeft, room, currentQuestionIndex]);

  async function handleNextQuestion() {
    if (!room) return;

    const supabase = createClient();

    if (isLastQuestion) {
      await supabase.from('rooms').update({ phase: 'finished' }).eq('id', room.id);
      setViewMode('scoreboard');
    } else {
      await supabase
        .from('rooms')
        .update({ current_question_index: currentQuestionIndex + 1 })
        .eq('id', room.id);

      setViewMode('question');
      setQuestionStartTime(Date.now());
      setTimeLeft(60);
    }
  }

  async function handleStartRoulette() {
    if (!room) return;

    const supabase = createClient();
    await supabase.from('rooms').update({ phase: 'onthespot' }).eq('id', room.id);
    router.push(`/host/roulette?code=${code}`);
  }

  async function handleRevealAnswer() {
    if (!room) return;

    setViewMode('reveal');

    // Broadcast to all players that answer is revealed
    const supabase = createClient();
    const channel = supabase.channel(`game:${room.id}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'reveal_answer',
          payload: { questionIndex: currentQuestionIndex },
        });
      }
    });
  }

  function handleShowScoreboard() {
    setViewMode('scoreboard');

    // Broadcast to watchers
    if (room) {
      const supabase = createClient();
      const channel = supabase.channel(`game:${room.id}`);
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'show_scoreboard',
            payload: { questionIndex: currentQuestionIndex },
          });
        }
      });
    }
  }

  if (roomLoading || !room || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black text-3xl font-black uppercase">carregando...</div>
      </div>
    );
  }

  const answerDistribution = [0, 1, 2, 3].map(
    (index) => answers.filter((a) => a.answer_index === index).length
  );
  const maxAnswers = Math.max(...answerDistribution, 1);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col p-6 md:p-8 relative">
      <div className="absolute top-4 left-4 opacity-50 z-10">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </div>
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6">
        {/* Header with Teams and Progress */}
        <div className="flex flex-wrap justify-between items-center gap-4 flex-shrink-0">
          <div className="brutal-card p-4 md:p-5">
            <p className="text-base md:text-lg font-black text-black uppercase">
              pergunta {currentQuestionIndex + 1} de {questions.length}
            </p>
          </div>

          {teams.length > 0 && (
            <div className="flex gap-3 md:gap-4">
              {teams.map((team) => (
                <div key={team.id} className="brutal-card p-4 md:p-5 flex items-center gap-3">
                  <span className="text-3xl md:text-4xl">{team.emoji}</span>
                  <div>
                    <p className="text-base md:text-lg font-bold text-black uppercase">{team.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 md:gap-4">
            {viewMode === 'question' && (
              <div className={`border-4 border-black shadow-[4px_4px_0px_#000] p-4 md:p-5 flex items-center gap-3 rounded-2xl ${
                timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 30 ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                <span className="text-3xl md:text-4xl font-black text-white">{timeLeft}</span>
                <p className="text-xs md:text-sm font-bold text-white uppercase">segundos</p>
              </div>
            )}

            <div className="brutal-card p-4 md:p-5">
              <p className="text-base md:text-lg font-black text-black uppercase">
                {answerCount} / {players.length}
              </p>
              <p className="text-xs md:text-sm font-bold text-black uppercase">responderam</p>
            </div>
          </div>
        </div>

        {/* Question Phase */}
        {viewMode === 'question' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-6 min-h-0"
          >
            <div className="brutal-card p-8 md:p-10 text-center flex-1 flex flex-col justify-center gap-6 overflow-y-auto">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black leading-tight">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${colorClasses[answerColors[index]]} brutal-border-thick p-6 rounded-2xl flex items-center gap-4`}
                  >
                    <div className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0">
                      {answerLabels[index]}
                    </div>
                    <p className="text-white text-lg md:text-xl font-black uppercase text-left flex-1">
                      {option}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRevealAnswer}
              className="brutal-btn w-full bg-black text-white font-black py-5 md:py-6 px-10 rounded-xl text-xl md:text-2xl uppercase max-w-2xl mx-auto block flex-shrink-0"
            >
              REVELAR RESPOSTA
            </motion.button>
          </motion.div>
        )}

        {/* Reveal Phase */}
        {viewMode === 'reveal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto min-h-0 pb-6"
          >
            <div className="space-y-6">
              <div className="brutal-card p-8 md:p-10 space-y-6">
                <h2 className="text-2xl md:text-3xl font-black text-black text-center">
                  {currentQuestion.question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = index === currentQuestion.correct;
                    const count = answerDistribution[index];
                    const percentage = maxAnswers > 0 ? (count / maxAnswers) * 100 : 0;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: isCorrect ? 1 : 0.4 }}
                        className={`${colorClasses[answerColors[index]]} brutal-border-thick p-5 rounded-2xl ${
                          isCorrect ? 'ring-8 ring-black' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-xl font-black">
                            {answerLabels[index]}
                          </div>
                          <p className="text-white text-lg md:text-xl font-black uppercase flex-1">
                            {option}
                          </p>
                          {isCorrect && <span className="text-3xl">✓</span>}
                        </div>

                        <div className="bg-black/30 h-10 rounded-xl overflow-hidden mb-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full bg-white"
                          />
                        </div>
                        <p className="text-white text-base md:text-lg font-bold text-center">
                          {count} {count === 1 ? 'resposta' : 'respostas'}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="brutal-border bg-white p-6 md:p-8 rounded-2xl space-y-3">
                  <p className="text-xl md:text-2xl font-black text-black uppercase">EXPLICAÇÃO:</p>
                  <p className="text-lg md:text-xl font-bold text-black">{currentQuestion.explanation}</p>
                  <p className="text-base md:text-lg font-bold text-black/70 uppercase">
                    📖 {currentQuestion.verse}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShowScoreboard}
                className="brutal-btn w-full bg-black text-white font-black py-5 md:py-6 px-10 rounded-xl text-xl md:text-2xl uppercase max-w-2xl mx-auto block"
              >
                VER PLACAR
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Scoreboard Phase */}
        {viewMode === 'scoreboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col gap-4 min-h-0"
          >
            {room.phase === 'finished' ? (
              // TRANSITION TO ROULETTE
              <div className="flex-1 flex flex-col items-center justify-center gap-8 pb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                  className="text-center space-y-8 max-w-4xl"
                >
                  <h2 className="text-6xl md:text-8xl font-black text-black uppercase">
                    🔥 FIM DA PRIMEIRA FASE
                  </h2>

                  <div className="brutal-card p-12 md:p-16 bg-gradient-to-br from-purple-400 to-purple-500">
                    <div className="text-9xl mb-6">🎯</div>
                    <h3 className="text-4xl md:text-6xl font-black text-white uppercase mb-6">
                      PRÓXIMA FASE:
                    </h3>
                    <p className="text-3xl md:text-5xl font-black text-white uppercase">
                      Putting on the Spot
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-white/90 mt-6">
                      a roleta vai escolher quem responde! 😱
                    </p>
                  </div>

                  <div className="brutal-card p-8 bg-white">
                    <p className="text-2xl md:text-3xl font-black text-black uppercase mb-4">
                      PLACAR PARCIAL
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                      {[...teams].sort((a, b) => b.score - a.score).map((team, idx) => (
                        <div key={team.id} className="text-center">
                          <div className="text-5xl mb-2">{team.emoji}</div>
                          <p className="text-xl font-black text-black uppercase">{team.name}</p>
                          <p className="text-3xl font-black text-black">{team.score} pts</p>
                          {idx === 0 && <p className="text-sm font-bold text-black/70 mt-1">🥇 liderando</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <div className="flex gap-3 max-w-2xl mx-auto flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartRoulette}
                    className="brutal-btn flex-1 bg-black text-white font-black py-5 md:py-6 px-6 rounded-xl text-lg md:text-xl uppercase"
                  >
                    🎯 INICIAR ROLETA
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/host')}
                    className="brutal-btn bg-white text-black font-black py-5 md:py-6 px-6 rounded-xl text-base md:text-lg uppercase"
                  >
                    nova sala
                  </motion.button>
                </div>
              </div>
            ) : (
              // INTERIM SCOREBOARD (during game)
              <>
                <div className="brutal-card p-6 md:p-8 flex-1 flex flex-col overflow-hidden">
                  <h2 className="text-3xl md:text-4xl font-black text-black text-center uppercase mb-6 flex-shrink-0">
                    PLACAR
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
                    {teams.map((team) => {
                      const teamPlayers = players.filter((p) => p.team_id === team.id)
                        .sort((a, b) => b.score - a.score);

                      return (
                        <div key={team.id} className="brutal-card p-6 flex flex-col h-fit">
                          <div className="flex items-center gap-3 pb-3 border-b-4 border-black flex-shrink-0">
                            <span className="text-4xl md:text-5xl">{team.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl md:text-2xl font-black text-black uppercase truncate">
                                {team.name}
                              </h3>
                            </div>
                          </div>

                          <div className="space-y-2 mt-3 overflow-y-auto max-h-48">
                            {teamPlayers.map((player) => (
                              <div
                                key={player.id}
                                className="brutal-border bg-white p-2 rounded-xl flex items-center gap-2"
                              >
                                <span className="text-sm md:text-base font-bold text-black uppercase flex-1 truncate">
                                  {player.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextQuestion}
                  className="brutal-btn w-full bg-black text-white font-black py-5 md:py-6 px-10 rounded-xl text-xl md:text-2xl uppercase max-w-2xl mx-auto block flex-shrink-0"
                >
                  PRÓXIMA PERGUNTA
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function HostGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-black text-3xl font-black uppercase">carregando...</div>
        </div>
      }
    >
      <HostGameContent />
    </Suspense>
  );
}
