export function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function calculateScore(
  isCorrect: boolean,
  timeElapsed: number,
  maxTime: number = 20000
): number {
  if (!isCorrect) return 0;

  const baseScore = 1000;
  const speedBonus = Math.round((1 - timeElapsed / maxTime) * 500);

  return baseScore + Math.max(0, speedBonus);
}

export function formatTime(seconds: number): string {
  return seconds.toString().padStart(2, '0');
}
