'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { AnswerButton } from '@/components/AnswerButton';
import { questions } from '@/lib/questions';
import { calculateScore } from '@/lib/utils';
import { AnswerColor } from '@/types';

type GameState = 'waiting' | 'playing' | 'answered' | 'result' | 'finished';

const answerColors: AnswerColor[] = ['red', 'blue', 'yellow', 'green'];

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const playerId = searchParams.get('playerId');
  const { room, loading: roomLoading } = useRealtimeRoom(code);
  const { players } = useRealtimePlayers(room?.id || null);

  const [gameState, setGameState] = useState<GameState>('waiting');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    points: number;
  } | null>(null);
  const [previousQuestionIndex, setPreviousQuestionIndex] = useState<number>(-1);

  const currentPlayer = players.find((p) => p.id === playerId);
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

    // Redirect to roulette if phase changed
    if (room.phase === 'onthespot') {
      router.push(`/play-roulette?code=${code}&playerId=${playerId}`);
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
      }
    } else if (room.phase === 'finished') {
      setGameState('finished');
    }
  }, [room, currentQuestionIndex, previousQuestionIndex, router, code, playerId]);

  async function handleAnswer(answerIndex: number) {
    if (!room || !currentPlayer || gameState !== 'playing') return;

    setSelectedAnswer(answerIndex);
    setGameState('answered');

    try {
      const supabase = createClient();
      const timeElapsed = Date.now() - questionStartTime;
      const isCorrect = answerIndex === currentQuestion.correct;
      const points = calculateScore(isCorrect, timeElapsed);

      await supabase.from('answers').insert({
        room_id: room.id,
        player_id: currentPlayer.id,
        question_index: currentQuestionIndex,
        answer_index: answerIndex,
        is_correct: isCorrect,
        points_earned: points,
      });

      if (isCorrect) {
        await supabase
          .from('players')
          .update({ score: currentPlayer.score + points })
          .eq('id', currentPlayer.id);

        // Also add points to team score
        if (currentPlayer.team_id) {
          const { data: team } = await supabase
            .from('teams')
            .select('score')
            .eq('id', currentPlayer.team_id)
            .single();

          if (team) {
            await supabase
              .from('teams')
              .update({ score: team.score + points })
              .eq('id', currentPlayer.team_id);
          }
        }
      }

      setLastAnswerResult({ isCorrect, points });
      setGameState('result');
    } catch (err) {
      console.error('Error submitting answer:', err);
      setGameState('playing');
      setSelectedAnswer(null);
    }
  }

  if (roomLoading || !room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
        <div className="text-white">
          <p className="text-sm text-gray-400">Sala</p>
          <p className="font-bold text-lg">{code}</p>
        </div>
        <div className="text-white text-center">
          <p className="text-sm text-gray-400">{currentPlayer.name}</p>
          <p className="font-bold text-lg">{currentPlayer.score} pts</p>
        </div>
        <div className="text-white text-right">
          <p className="text-sm text-gray-400">Ranking</p>
          <p className="font-bold text-lg">#{playerRank}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {gameState === 'waiting' && (
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Aguardando o host iniciar...
            </h2>
            <p className="text-gray-400">O jogo começará em breve!</p>
          </div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-400 mb-2">
                Pergunta {currentQuestionIndex + 1} de {questions.length}
              </p>
              <h2 className="text-2xl font-bold text-white">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <AnswerButton
                  key={index}
                  color={answerColors[index]}
                  label={option}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  selected={selectedAnswer === index}
                />
              ))}
            </div>
          </div>
        )}

        {gameState === 'answered' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Resposta enviada!
            </h2>
            <p className="text-gray-400">Aguardando os outros jogadores...</p>
          </div>
        )}

        {gameState === 'result' && lastAnswerResult && (
          <div className="text-center">
            <div className="text-8xl mb-4">
              {lastAnswerResult.isCorrect ? '🎉' : '😢'}
            </div>
            <h2
              className={`text-3xl font-bold mb-2 ${
                lastAnswerResult.isCorrect ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {lastAnswerResult.isCorrect ? 'Correto!' : 'Incorreto'}
            </h2>
            {lastAnswerResult.isCorrect && (
              <p className="text-yellow-400 text-2xl font-bold mb-4">
                +{lastAnswerResult.points} pontos
              </p>
            )}
            <p className="text-white text-xl mb-2">Sua pontuação</p>
            <p className="text-white text-4xl font-bold mb-1">
              {currentPlayer.score} pts
            </p>
            <p className="text-gray-400">#{playerRank}º lugar</p>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="text-center">
            <div className="text-8xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-white mb-4">Jogo Finalizado!</h2>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <p className="text-gray-400 mb-2">Sua pontuação final</p>
              <p className="text-white text-5xl font-bold mb-4">
                {currentPlayer.score} pts
              </p>
              <p className="text-yellow-400 text-2xl font-bold">
                {playerRank === 1 && '🥇 Campeão!'}
                {playerRank === 2 && '🥈 2º Lugar!'}
                {playerRank === 3 && '🥉 3º Lugar!'}
                {playerRank > 3 && `${playerRank}º lugar`}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      }
    >
      <PlayContent />
    </Suspense>
  );
}
