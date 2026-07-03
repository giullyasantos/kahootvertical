import { CampShell } from '@/components/camp/CampShell';
import { criteriaSets } from '@/lib/camp/mockData';

export default function CriteriaPage() {
  return (
    <CampShell title="Criterios" kicker="Liberados por modo" activePath="/app/criteria">
      <section className="grid gap-4 md:grid-cols-2">
        {criteriaSets.map((criteria) => (
          <article
            key={criteria.id}
            className={`rounded-lg border-4 border-black p-5 shadow-[6px_6px_0_#000] ${
              criteria.unlocked ? 'bg-white' : 'bg-black text-white'
            }`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">
              {criteria.unlocked ? 'Liberado' : 'Trancado'}
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase">{criteria.title}</h2>
            <p className="mt-3 text-sm font-bold opacity-80">
              {criteria.unlocked
                ? criteria.description
                : 'Este criterio aparece quando o modo comecar. Nada de spoiler antes da hora.'}
            </p>
          </article>
        ))}
      </section>
    </CampShell>
  );
}

