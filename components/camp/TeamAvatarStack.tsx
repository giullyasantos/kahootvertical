import { Participant } from '@/types/camp';

interface TeamAvatarStackProps {
  participants: Participant[];
}

export function TeamAvatarStack({ participants }: TeamAvatarStackProps) {
  return (
    <div className="flex -space-x-3">
      {participants.slice(0, 6).map((participant) => (
        <div
          key={participant.id}
          className="grid h-11 w-11 place-items-center rounded-full border-4 border-black bg-white text-sm font-black uppercase shadow-[2px_2px_0_#000]"
          title={participant.displayName}
        >
          {participant.displayName.slice(0, 2)}
        </div>
      ))}
    </div>
  );
}

