import { SessionGuard } from '@/components/camp/SessionGuard';

export default function CaptainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard requireSession requireOnboarding>
      {children}
    </SessionGuard>
  );
}
