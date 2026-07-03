import { ReactNode } from 'react';

interface StatusCardProps {
  title: string;
  value: string;
  detail: string;
  children?: ReactNode;
}

export function StatusCard({ title, value, detail, children }: StatusCardProps) {
  return (
    <section className="rounded-lg border-4 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-black/55">{title}</p>
      <h2 className="mt-2 text-3xl font-black uppercase leading-none">{value}</h2>
      <p className="mt-3 text-sm font-bold text-black/70">{detail}</p>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}

