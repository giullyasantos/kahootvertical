import { redirect } from 'next/navigation';

// Root always routes through the session-aware entry point.
export default function RootPage() {
  redirect('/entrar');
}
