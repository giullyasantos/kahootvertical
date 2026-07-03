'use client';

import { useMemo, useState } from 'react';
import { AdminShell } from '@/components/camp/AdminShell';
import { StatusCard } from '@/components/camp/StatusCard';

const initialRegistrations = [
  { id: 'reg-ana', name: 'Ana Souza', age: 17, phone: '(407) 000-0001', payment: 'submitted', status: 'submitted' },
  { id: 'reg-davi', name: 'Davi Lima', age: 16, phone: '(407) 000-0002', payment: 'submitted', status: 'needs_review' },
  { id: 'reg-bia', name: 'Bia Costa', age: 18, phone: '(407) 000-0003', payment: 'missing', status: 'submitted' },
];

export default function RegistrationsAdminPage() {
  const [registrations, setRegistrations] = useState(initialRegistrations);

  const counts = useMemo(() => ({
    pending: registrations.filter((item) => item.status !== 'approved').length,
    approved: registrations.filter((item) => item.status === 'approved').length,
    paid: registrations.filter((item) => item.payment === 'confirmed').length,
  }), [registrations]);

  function updateRegistration(id: string, status: string, payment?: string) {
    setRegistrations((current) =>
      current.map((item) => (item.id === id ? { ...item, status, payment: payment ?? item.payment } : item)),
    );
  }

  return (
    <AdminShell title="Inscricoes" activePath="/admin/registrations">
      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard title="Pendentes" value={`${counts.pending}`} detail="Aguardando decisao admin." />
        <StatusCard title="Aprovados" value={`${counts.approved}`} detail="Virariam perfis de participante." />
        <StatusCard title="Pagos" value={`${counts.paid}`} detail="Pagamento confirmado no mock." />
      </section>
      <section className="rounded-lg border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
        <h2 className="text-2xl font-black uppercase">Fila de revisao</h2>
        <div className="mt-4 space-y-3">
          {registrations.map((registration) => (
            <article key={registration.id} className="grid gap-3 rounded-md border-2 border-black bg-[#FFFDF5] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-lg font-black uppercase">{registration.name}</p>
                <p className="text-sm font-bold text-black/65">
                  {registration.age} anos · {registration.phone} · pagamento: {registration.payment} · status: {registration.status}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <button type="button" onClick={() => updateRegistration(registration.id, 'approved', 'confirmed')} className="rounded-md border-2 border-black bg-[#84CC16] px-3 py-2 text-xs font-black uppercase">
                  Aprovar
                </button>
                <button type="button" onClick={() => updateRegistration(registration.id, 'needs_review')} className="rounded-md border-2 border-black bg-[#FFD200] px-3 py-2 text-xs font-black uppercase">
                  Revisar
                </button>
                <button type="button" onClick={() => updateRegistration(registration.id, 'denied')} className="rounded-md border-2 border-black bg-black px-3 py-2 text-xs font-black uppercase text-white">
                  Negar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
