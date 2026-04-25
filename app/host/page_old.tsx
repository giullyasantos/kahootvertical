'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { generateRoomCode } from '@/lib/utils';

export default function HostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createRoom() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const code = generateRoomCode();

      const { data, error: insertError } = await supabase
        .from('rooms')
        .insert({
          code,
          status: 'waiting',
          current_question_index: 0,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      router.push(`/host/lobby?code=${code}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Erro ao criar sala. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard do Host</h1>
          <p className="text-gray-400 text-lg">
            Crie uma nova sala para começar o jogo
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={createRoom}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-6 px-6 rounded-lg text-2xl transition-colors"
        >
          {loading ? 'Criando...' : 'Criar Nova Sala'}
        </button>

        <div className="pt-4">
          <a
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar
          </a>
        </div>
      </div>
    </div>
  );
}
