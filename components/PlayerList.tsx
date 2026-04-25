'use client';

import { Player } from '@/types';

interface PlayerListProps {
  players: Player[];
  onAddPoints?: (playerId: string) => void;
}

export function PlayerList({ players, onAddPoints }: PlayerListProps) {
  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-white mb-4">
        Jogadores ({players.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
          >
            <div>
              <div className="text-white font-medium">{player.name}</div>
              <div className="text-gray-400 text-sm">{player.score} pontos</div>
            </div>
            {onAddPoints && (
              <button
                onClick={() => onAddPoints(player.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                +500
              </button>
            )}
          </div>
        ))}
        {players.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            Aguardando jogadores...
          </div>
        )}
      </div>
    </div>
  );
}
