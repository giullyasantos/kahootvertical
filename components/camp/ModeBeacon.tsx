import { CampRole, EventMode } from '@/types/camp';

interface ModeBeaconProps {
  mode: EventMode;
  role: CampRole;
  eyebrow?: string;
}

const roleLabels: Record<CampRole, string> = {
  participant: 'Participante',
  captain: 'Capitao',
  admin: 'Admin',
  presenter: 'Telao',
};

function getSummary(mode: EventMode, role: CampRole) {
  if (role === 'captain' && mode.captainSummary) return mode.captainSummary;
  if (role === 'admin') return mode.adminSummary;
  if (role === 'presenter') return mode.presenterTitle;
  return mode.participantSummary;
}

function getReadableTextColor(backgroundColor: string) {
  const hex = backgroundColor.replace('#', '');
  const normalizedHex = hex.length === 3 ? hex.split('').map((part) => `${part}${part}`).join('') : hex;
  const value = Number.parseInt(normalizedHex, 16);

  if (Number.isNaN(value)) return '#000';

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance > 0.58 ? '#000' : '#fff';
}

export function ModeBeacon({ mode, role, eyebrow = 'Modo ativo' }: ModeBeaconProps) {
  const summary = getSummary(mode, role);
  const statusTextColor = getReadableTextColor(mode.accentColor);

  return (
    <section
      className="relative overflow-hidden rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000] md:p-6"
      aria-label={`${eyebrow}: ${mode.title}`}
    >
      <div
        className="absolute inset-y-0 left-0 w-3 border-r-4 border-black"
        style={{ backgroundColor: mode.accentColor }}
        aria-hidden="true"
      />
      <div className="pl-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-black/60">
            {eyebrow} · {roleLabels[role]}
          </p>
          <span
            className="rounded-md border-2 border-black px-3 py-1 text-xs font-black uppercase"
            style={{ backgroundColor: mode.accentColor, color: statusTextColor }}
          >
            {mode.status}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-black uppercase leading-none text-black md:text-5xl">
          {mode.title}
        </h1>
        <p className="mt-3 max-w-3xl text-base font-bold text-black/75 md:text-lg">{summary}</p>
        {mode.deadlineAt && (
          <p className="mt-4 inline-flex rounded-md border-2 border-black bg-[#FFD200] px-3 py-2 text-sm font-black uppercase text-black">
            Prazo configurado: {new Intl.DateTimeFormat('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/New_York',
            }).format(new Date(mode.deadlineAt))}
          </p>
        )}
      </div>
    </section>
  );
}
