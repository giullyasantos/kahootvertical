import Link from 'next/link';
import { ReactNode } from 'react';

interface CampShellProps {
  children: ReactNode;
  title: string;
  kicker: string;
  activePath?: string;
}

const navItems = [
  { href: '/app', label: 'Agora' },
  { href: '/app/team', label: 'Time' },
  { href: '/app/criteria', label: 'Criterios' },
  { href: '/app/notes', label: 'Notas' },
  { href: '/app/profile', label: 'Perfil' },
];

export function CampShell({ children, title, kicker, activePath = '/app' }: CampShellProps) {
  return (
    <main className="min-h-screen bg-[#FFD200] px-4 py-5 text-black md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-4 rounded-lg border-4 border-black bg-[#FFFDF5] p-5 shadow-[6px_6px_0_#000] md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-black/55">{kicker}</p>
            <h1 className="mt-2 text-4xl font-black uppercase leading-none md:text-6xl">{title}</h1>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Navegacao do app">
            {navItems.map((item) => {
              const active = item.href === activePath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md border-2 border-black px-3 py-2 text-sm font-black uppercase ${
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

