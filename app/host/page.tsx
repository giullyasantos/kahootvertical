'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { generateRoomCode } from '@/lib/utils';
import logo from '@/app/images/verticallogo.png';

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
      setError('erro ao criar sala, tenta de novo');
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
        <div className="brutal-card p-12 md:p-16 space-y-12">
          <div className="text-center space-y-5">
            <h1 className="text-6xl md:text-7xl font-black text-black uppercase">ÁREA DO CHEFE</h1>
            <p className="text-2xl md:text-3xl font-bold text-black">
              cria a sala e manda ver
            </p>
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom}
            disabled={loading}
            className="brutal-btn w-full bg-black text-white font-black py-8 px-12 rounded-xl text-3xl md:text-4xl uppercase"
          >
            {loading ? 'criando...' : 'Criar Sala'}
          </motion.button>

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
