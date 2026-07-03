'use client';

// Entry point: reads session from localStorage and routes the user
// to the right place without flashing any intermediate screen.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/session';

export default function EntrarPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();

    if (!session?.registrationId) {
      router.replace('/onboarding');
      return;
    }

    if (!session.onboardingComplete) {
      router.replace('/onboarding');
      return;
    }

    // Restore last path, fall back to /app
    router.replace(session.lastPath || '/app');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(130% 95% at 50% 18%, #2170d6 0%, #12539f 42%, #0a3372 74%, #061d3f 100%)',
      display: 'grid', placeItems: 'center',
    }}>
      <div style={{ color: '#ffd200', fontWeight: 900, fontSize: 28, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>
        Carregando…
      </div>
    </div>
  );
}
