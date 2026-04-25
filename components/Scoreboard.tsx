'use client';

import { Player } from '@/types';

interface ScoreboardProps {
  players: Player[];
  showTop?: number;
  highlightWinner?: boolean;
}

export function Scoreboard({ players, showTop = 10, highlightWinner = false }: ScoreboardProps) {
  const topPlayers = players.slice(0, showTop);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold text-white text-center mb-8">
        {highlightWinner ? '🏆 Placar Final' : 'Placar'}
      </h2>
      <div className="space-y-3">
        {topPlayers.map((player, index) => {
          const isWinner = highlightWinner && index === 0;
          return (
            <div
              key={player.id}
              className={`
                flex items-center justify-between p-4 rounded-lg
                ${isWinner ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white'}
                ${isWinner ? 'ring-4 ring-yellow-400 scale-105' : ''}
                transition-all duration-300
              `}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`
                    text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full
                    ${isWinner ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'}
                  `}
                >
                  {index + 1}
                </div>
                <div>
                  <div className={`font-semibold text-lg ${isWinner ? 'text-black' : 'text-white'}`}>
                    {player.name}
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${isWinner ? 'text-black' : 'text-white'}`}>
                {player.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
      {players.length === 0 && (
        <div className="text-gray-400 text-center py-8">
          Nenhum jogador ainda
        </div>
      )}
    </div>
  );
}
