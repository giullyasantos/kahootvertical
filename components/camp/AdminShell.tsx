import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminShellProps {
  children: ReactNode;
  title: string;
  activePath?: string;
}

const adminNav = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/registrations', label: 'Inscricoes' },
  { href: '/admin/teams', label: 'Times' },
  { href: '/admin/modes', label: 'Modos' },
  { href: '/admin/meals', label: 'Refeicoes' },
  { href: '/admin/points', label: 'Pontos' },
  { href: '/admin/submissions', label: 'Envios' },
  { href: '/admin/notifications', label: 'Avisos' },
  { href: '/admin/presenter', label: 'Telao' },
];

export function AdminShell({ children, title, activePath = '/admin' }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#08264D] px-4 py-5 text-black md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="rounded-lg border-4 border-black bg-[#FFFDF5] p-5 shadow-[6px_6px_0_#000]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-black/55">
            Painel admin · mobile-first
          </p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h1 className="text-4xl font-black uppercase leading-none md:text-6xl">{title}</h1>
            <Link
              href="/presenter"
              className="rounded-md border-2 border-black bg-[#FFD200] px-4 py-2 text-sm font-black uppercase text-black"
            >
              Abrir telao
            </Link>
          </div>
          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Navegacao admin">
            {adminNav.map((item) => {
              const active = item.href === activePath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md border-2 border-black px-3 py-2 text-xs font-black uppercase ${
                    active ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}

