'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession, updateLastPath } from '@/lib/session';

interface Props {
  children: React.ReactNode;
  requireSession?: boolean;
  requireOnboarding?: boolean;
}

export function SessionGuard({ children, requireSession = true, requireOnboarding = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (requireSession && !session?.registrationId) {
      router.replace('/onboarding');
      return;
    }

    if (requireOnboarding && session && !session.onboardingComplete) {
      router.replace('/onboarding');
      return;
    }

    updateLastPath(pathname);
    setChecked(true);
  }, [pathname, requireSession, requireOnboarding, router]);

  // Block rendering until session check is done — prevents flashing mock data
  if (!checked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#061D3F',
        display: 'grid',
        placeItems: 'center',
      }}>
        <span style={{
          color: '#FFD200',
          fontWeight: 900,
          fontSize: 14,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          opacity: 0.5,
        }}>
          •••
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
