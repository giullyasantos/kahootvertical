'use client';

import { motion } from 'framer-motion';

interface AuthGateProps {
  title: string;
  subtitle: string;
  loading?: boolean;
  onSignIn: () => void;
}

export function AuthGate({ title, subtitle, loading = false, onSignIn }: AuthGateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-10 md:p-14 w-full max-w-2xl text-center space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase">{title}</h1>
          <p className="text-xl md:text-2xl font-bold text-black">{subtitle}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSignIn}
          disabled={loading}
          className="brutal-btn w-full bg-black text-white font-black py-6 px-8 rounded-xl text-xl md:text-2xl uppercase"
        >
          {loading ? 'carregando...' : 'Entrar com Google'}
        </motion.button>
      </motion.div>
    </div>
  );
}
