'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import logo from '@/app/images/verticallogo.png';

export default function WatchPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || code.length !== 4) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.trim())
        .single();

      if (roomError || !roomData) {
        setError('sala não encontrada, confere o código aí');
        setLoading(false);
        return;
      }

      // Redirect based on room status and phase
      if (roomData.status === 'waiting') {
        router.push(`/watch/lobby?code=${code.trim()}`);
      } else if (roomData.phase === 'onthespot') {
        router.push(`/watch/roulette?code=${code.trim()}`);
      } else {
        router.push(`/watch/game?code=${code.trim()}`);
      }
    } catch (err) {
      console.error('Error finding room:', err);
      setError('erro ao buscar sala, tenta de novo');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-12 relative">
      <div className="absolute top-4 left-4 opacity-50">
        <Image src={logo} alt="Logo" width={50} height={50} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="brutal-card p-12 md:p-16 space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-black text-black uppercase">ASSISTIR JOGO</h1>
            <p className="text-xl md:text-2xl font-bold text-black">só observar, sem interagir 👀</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="brutal-border bg-red-100 text-black px-8 py-5 rounded-xl font-bold shake"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="XXXX"
                maxLength={4}
                className="brutal-input w-full text-center text-5xl sm:text-6xl md:text-7xl font-black px-4 sm:px-6 md:px-8 py-6 md:py-8 rounded-xl tracking-[0.3em] sm:tracking-widest uppercase"
                style={{ minHeight: '80px' }}
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || code.length !== 4}
              className="brutal-btn w-full bg-black text-white font-black py-7 px-10 rounded-xl text-2xl md:text-3xl uppercase"
            >
              {loading ? 'entrando...' : 'Assistir'}
            </motion.button>
          </form>

          <div className="pt-6 text-center">
            <a href="/" className="text-black font-bold text-xl hover:underline uppercase">
              ← voltar
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
