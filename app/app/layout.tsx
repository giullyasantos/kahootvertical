import { SessionGuard } from '@/components/camp/SessionGuard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard requireSession requireOnboarding>
      {children}
    </SessionGuard>
  );
}
