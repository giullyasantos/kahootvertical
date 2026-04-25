'use client';

import { AnswerColor } from '@/types';

interface AnswerButtonProps {
  color: AnswerColor;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  isCorrect?: boolean | null;
}

const colorClasses: Record<AnswerColor, { bg: string; hover: string; border: string }> = {
  red: {
    bg: 'bg-[#E21B3C]',
    hover: 'hover:bg-[#c91632]',
    border: 'border-[#E21B3C]',
  },
  blue: {
    bg: 'bg-[#1368CE]',
    hover: 'hover:bg-[#0f57b3]',
    border: 'border-[#1368CE]',
  },
  yellow: {
    bg: 'bg-[#D89E00]',
    hover: 'hover:bg-[#b88600]',
    border: 'border-[#D89E00]',
  },
  green: {
    bg: 'bg-[#26890C]',
    hover: 'hover:bg-[#1f6e0a]',
    border: 'border-[#26890C]',
  },
};

export function AnswerButton({
  color,
  label,
  onClick,
  disabled = false,
  selected = false,
  isCorrect = null,
}: AnswerButtonProps) {
  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-6 rounded-lg text-white font-semibold text-lg
        transition-all duration-200 transform
        ${colors.bg} ${disabled ? '' : colors.hover}
        ${selected ? 'ring-4 ring-white scale-105' : ''}
        ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
        flex items-center justify-between
      `}
    >
      <span className="flex-1 text-left">{label}</span>
      {isCorrect !== null && (
        <span className="text-2xl ml-4">
          {isCorrect ? '✓' : '✗'}
        </span>
      )}
    </button>
  );
}
