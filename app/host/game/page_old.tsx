'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeAnswers } from '@/hooks/useRealtimeAnswers';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { Timer } from '@/components/Timer';
import { Scoreboard } from '@/components/Scoreboard';
import { questions } from '@/lib/questions';
import { AnswerColor } from '@/types';

type ViewMode = 'question' | 'reveal' | 'scoreboard';

const answerColors: AnswerColor[] = ['red', 'blue', 'yellow', 'green'];

const colorClasses: Record<AnswerColor, string> = {
  red: 'bg-[#E21B3C]',
  blue: 'bg-[#1368CE]',
  yellow: 'bg-[#D89E00]',
  green: 'bg-[#26890C]',
};

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

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  useEffect(() => {
    if (!roomLoading && !room) {
      router.push('/host');
    }
  }, [room, roomLoading, router]);

  useEffect(() => {
    if (room?.status === 'finished') {
      setViewMode('scoreboard');
    }
  }, [room?.status]);

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
    }
  }

  async function handleStartRoulette() {
    if (!room) return;

    const supabase = createClient();
    await supabase.from('rooms').update({ phase: 'onthespot' }).eq('id', room.id);
    router.push(`/host/roulette?code=${code}`);
  }

  function handleRevealAnswer() {
    setViewMode('reveal');
  }

  function handleShowScoreboard() {
    setViewMode('scoreboard');
  }

  if (roomLoading || !room || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  const answerDistribution = [0, 1, 2, 3].map(
    (index) => answers.filter((a) => a.answer_index === index).length
  );
  const maxAnswers = Math.max(...answerDistribution, 1);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <span className="text-xl font-semibold">
              Pergunta {currentQuestionIndex + 1} de {questions.length}
            </span>
          </div>

          {teams.length > 0 && (
            <div className="flex gap-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-gray-800 px-6 py-3 rounded-lg flex items-center gap-3">
                  <span className="text-3xl">{team.emoji}</span>
                  <div>
                    <p className="text-gray-400 text-sm">{team.name}</p>
                    <p className="text-white text-xl font-bold">{team.score} pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-white">
            <span className="text-xl font-semibold">
              {answerCount}/{players.length} responderam
            </span>
          </div>
        </div>

        {viewMode === 'question' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-8">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`${colorClasses[answerColors[index]]} p-6 rounded-lg`}
                  >
                    <p className="text-white text-2xl font-semibold">{option}</p>
                  </div>
                ))}
              </div>

              <Timer
                duration={20}
                startTime={questionStartTime}
                onComplete={handleRevealAnswer}
              />
            </div>

            <button
              onClick={handleRevealAnswer}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
            >
              Revelar Resposta
            </button>
          </div>
        )}

        {viewMode === 'reveal' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = index === currentQuestion.correct;
                  const count = answerDistribution[index];
                  const percentage = maxAnswers > 0 ? (count / maxAnswers) * 100 : 0;

                  return (
                    <div key={index} className="relative">
                      <div
                        className={`${colorClasses[answerColors[index]]} p-6 rounded-lg ${
                          isCorrect ? 'ring-4 ring-white' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white text-xl font-semibold">{option}</p>
                          {isCorrect && <span className="text-3xl">✓</span>}
                        </div>
                        <div className="mt-2 h-8 bg-black/30 rounded overflow-hidden">
                          <div
                            className="h-full bg-white/40 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-white text-sm mt-1">{count} respostas</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-700 p-6 rounded-lg">
                <p className="text-white text-lg mb-2">
                  <strong>Explicação:</strong> {currentQuestion.explanation}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Versículo:</strong> {currentQuestion.verse}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleShowScoreboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
              >
                Mostrar Placar
              </button>
            </div>
          </div>
        )}

        {viewMode === 'scoreboard' && (
          <div className="space-y-8">
            <Scoreboard
              players={players}
              showTop={10}
              highlightWinner={room.status === 'finished'}
            />

            {room.status !== 'finished' && (
              <button
                onClick={handleNextQuestion}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
              >
                Próxima Pergunta
              </button>
            )}

            {room.phase === 'finished' && (
              <div className="text-center space-y-4">
                <button
                  onClick={handleStartRoulette}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-6 px-12 rounded-lg text-2xl transition-colors"
                >
                  🎯 Iniciar Roleta (On the Spot)
                </button>
                <div>
                  <button
                    onClick={() => router.push('/host')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                  >
                    Criar Nova Sala
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HostGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      }
    >
      <HostGameContent />
    </Suspense>
  );
}
