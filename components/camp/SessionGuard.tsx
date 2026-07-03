'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getSession, updateLastPath } from '@/lib/session';

interface Props {
  children: React.ReactNode;
  // Which paths require a complete session (redirect to /register if missing)
  requireSession?: boolean;
  // Which paths require onboarding to be done (redirect to /onboarding if not)
  requireOnboarding?: boolean;
}

export function SessionGuard({ children, requireSession = true, requireOnboarding = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getSession();

    if (requireSession && !session?.registrationId) {
      router.replace('/register');
      return;
    }

    if (requireOnboarding && session && !session.onboardingComplete) {
      router.replace('/onboarding');
      return;
    }

    // Persist the current path so we can restore it on next open
    updateLastPath(pathname);
  }, [pathname, requireSession, requireOnboarding, router]);

  return <>{children}</>;
}
