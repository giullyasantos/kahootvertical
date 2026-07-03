import Link from 'next/link';
import { ReactNode } from 'react';

interface CampShellProps {
  children: ReactNode;
  title: string;
  kicker: string;
  activePath?: string;
}

const navItems = [
  { href: '/app',           label: 'Agora',     icon: '⚡' },
  { href: '/app/team',      label: 'Time',       icon: '👥' },
  { href: '/app/criteria',  label: 'Critérios',  icon: '📋' },
  { href: '/app/notes',     label: 'Notas',      icon: '✏️' },
  { href: '/app/profile',   label: 'Perfil',     icon: '○'  },
];

export function CampShell({ children, title, kicker, activePath = '/app' }: CampShellProps) {
  const isHome = activePath === '/app';

  return (
    <div className="min-h-screen bg-[#061D3F] text-white">

      {/* Sub-page header — hidden on the Agora home screen */}
      {!isHome && (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#061D3F]/95 px-5 pb-4 pt-10 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#FFD200]/60">
            {kicker}
          </p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-none text-white">
            {title}
          </h1>
        </header>
      )}

      {/* Page content — padded for bottom nav */}
      <main className="pb-32">
        {children}
      </main>

      {/* ── Fixed bottom nav ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 bg-white"
        style={{
          borderTop: '2px solid #000',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="mx-auto flex max-w-lg">
          {navItems.map((item) => {
            const active = item.href === activePath;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 select-none flex-col items-center gap-1 py-3 active:bg-black/5"
              >
                <span
                  className={`text-2xl leading-none transition-opacity ${
                    active ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition-all ${
                    active
                      ? 'bg-[#FFD200] text-black'
                      : 'text-black/40'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
