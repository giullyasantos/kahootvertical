'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import logo from '@/app/images/verticallogo.png';

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center px-8 md:px-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-4xl flex flex-col justify-center gap-12 md:gap-16"
      >
        <div className="space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <Image src={logo} alt="Logo" width={180} height={180} className="opacity-80" />
          </motion.div>
          <motion.h1
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-black leading-[0.9]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ textShadow: '6px 6px 0px rgba(0,0,0,0.15)' }}
          >
            VERTICAL'S
            <br />
            KAHOOT
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl font-bold text-black uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            o quiz que vai te deixar sem desculpa 👀
          </motion.p>
        </div>

        <motion.div
          className="w-full max-w-md mx-auto space-y-4 md:space-y-5 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/host" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="brutal-btn w-full bg-black text-white py-5 md:py-6 px-10 rounded-xl text-lg sm:text-xl md:text-2xl font-black uppercase mx-auto"
              style={{ display: 'block' }}
            >
              Sou o Chefe
            </motion.button>
          </Link>

          <Link href="/join" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="brutal-btn w-full bg-white text-black py-5 md:py-6 px-10 rounded-xl text-lg sm:text-xl md:text-2xl font-black uppercase mx-auto"
              style={{ display: 'block' }}
            >
              Quero Jogar
            </motion.button>
          </Link>

          <Link href="/watch" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="brutal-btn w-full bg-purple-500 text-white py-4 md:py-5 px-10 rounded-xl text-base sm:text-lg md:text-xl font-black uppercase mx-auto border-purple-700"
              style={{ display: 'block' }}
            >
              👁️ Só Assistir
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm sm:text-base md:text-lg font-bold text-black uppercase tracking-wider">
            feito pra quem acha que sabe tudo 😌
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
