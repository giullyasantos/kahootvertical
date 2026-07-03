'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface CampShellProps {
  children: ReactNode;
  title: string;
  kicker: string;
  activePath?: string;
}

const navItems = [
  { href: '/app',          label: 'Agora',     icon: '⚡' },
  { href: '/app/team',     label: 'Time',       icon: '👥' },
  { href: '/app/criteria', label: 'Critérios',  icon: '📋' },
  { href: '/app/notes',    label: 'Notas',      icon: '✏️' },
  { href: '/app/profile',  label: 'Perfil',     icon: '◯'  },
];

export function CampShell({ children, title, kicker, activePath = '/app' }: CampShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer whenever the route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const activeItem = navItems.find((n) => n.href === activePath) ?? navItems[0];

  return (
    <div className="min-h-screen bg-[#061D3F] text-white">

      {/* ── Fixed top bar ── */}
      <header
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5"
        style={{
          height: 56,
          background: 'rgba(6,29,63,0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Left: current page label */}
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{activeItem.icon}</span>
          <span className="text-sm font-black uppercase tracking-[0.18em] text-white/70">
            {activeItem.label}
          </span>
        </div>

        {/* Right: hamburger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl active:bg-white/10"
          style={{ border: '1.5px solid rgba(255,255,255,0.15)' }}
        >
          <span className="flex flex-col gap-[5px]">
            <span className="block h-[2px] w-5 rounded-full bg-white" />
            <span className="block h-[2px] w-5 rounded-full bg-white" />
            <span className="block h-[2px] w-3 rounded-full bg-white" />
          </span>
        </button>
      </header>

      {/* ── Page content ── */}
      <main style={{ paddingTop: 56 }}>
        {children}
      </main>

      {/* ── Drawer backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Slide-in drawer ── */}
      <div
        className="fixed inset-y-0 left-0 z-[60] flex flex-col"
        style={{
          width: 260,
          background: '#0a1f3d',
          borderRight: '2px solid rgba(255,210,0,0.2)',
          boxShadow: '8px 0 40px rgba(0,0,0,0.6)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
        aria-modal
        role="dialog"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#FFD200]/50">
              {kicker}
            </p>
            <p
              className="font-black uppercase leading-none text-[#FFD200]"
              style={{ fontSize: 22, transform: 'skew(-4deg)' }}
            >
              DESPERTA!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 active:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.1)', fontSize: 18 }}
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 mb-3 h-px bg-white/10" />

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = item.href === activePath;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors active:bg-white/10"
                style={{
                  background: active ? 'rgba(255,210,0,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(255,210,0,0.25)' : '1px solid transparent',
                }}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span
                  className="text-sm font-black uppercase tracking-[0.12em]"
                  style={{ color: active ? '#FFD200' : 'rgba(255,255,255,0.55)' }}
                >
                  {item.label}
                </span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FFD200]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom of drawer */}
        <div className="mt-auto px-5 pb-8 pt-4">
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
            Acampadentro 2026
          </p>
        </div>
      </div>
    </div>
  );
}
