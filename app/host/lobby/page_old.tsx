'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRealtimePlayers } from '@/hooks/useRealtimePlayers';
import { useRealtimeTeams } from '@/hooks/useRealtimeTeams';
import { PlayerList } from '@/components/PlayerList';

function HostLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { room, loading: roomLoading } = useRealtimeRoom(code);
  const { players } = useRealtimePlayers(room?.id || null);
  const { teams } = useRealtimeTeams(room?.id || null);
  const [starting, setStarting] = useState(false);

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

  async function handleAddPoints(playerId: string) {
    if (!room) return;

    try {
      const supabase = createClient();
      const player = players.find((p) => p.id === playerId);
      if (!player) return;

      await supabase
        .from('players')
        .update({ score: player.score + 500 })
        .eq('id', playerId);
    } catch (err) {
      console.error('Error adding points:', err);
    }
  }

  if (roomLoading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sala de Espera</h1>
          <div className="inline-block bg-purple-600 px-8 py-4 rounded-lg">
            <p className="text-gray-300 text-sm mb-1">Código da Sala</p>
            <p className="text-white text-6xl font-bold tracking-wider">{code}</p>
          </div>
          <p className="text-gray-400 mt-4">
            Os jogadores devem entrar com este código
          </p>
        </div>

        {teams.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {teams.map((team) => {
              const teamPlayers = players.filter((p) => p.team_id === team.id);
              return (
                <div key={team.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-5xl">{team.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                      <p className="text-gray-400 text-sm">{teamPlayers.length} jogadores</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {teamPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                      >
                        <div>
                          <span className="text-white font-medium">{player.name}</span>
                          {player.id === team.captain_id && (
                            <span className="ml-2 text-yellow-400 text-sm">👑 Capitão</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {teamPlayers.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Aguardando jogadores...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {teams.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <PlayerList players={players} onAddPoints={handleAddPoints} />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={startGame}
              disabled={players.length === 0 || teams.length === 0 || starting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
            >
              {starting
                ? 'Iniciando...'
                : teams.length === 0
                ? 'Aguardando times serem criados...'
                : players.length === 0
                ? 'Aguardando jogadores...'
                : `Iniciar Jogo (${players.length} jogadores em ${teams.length} times)`}
            </button>

            <button
              onClick={() => router.push('/host')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* TEST BUTTON - Remove after testing */}
          {teams.length > 0 && players.length > 0 && (
            <button
              onClick={skipToRoulette}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors border-2 border-yellow-400"
            >
              🎯 TEST: Pular para Roleta (Remover depois)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HostLobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Carregando...</div>
        </div>
      }
    >
      <HostLobbyContent />
    </Suspense>
  );
}
