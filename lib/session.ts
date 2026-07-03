// Client-side session stored in localStorage.
// Keeps the participant logged in across PWA closes, refreshes, and tab switches.

export const SESSION_KEY = 'desperta_session';

export interface CampSession {
  registrationId: string;
  fullName: string;
  firstName: string;
  selectedAvatarId: string;
  onboardingComplete: boolean;
  lastPath: string;          // last /app/* or /captain path they were on
  savedAt: number;           // Date.now() at save time
}

export function getSession(): CampSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CampSession;
  } catch {
    return null;
  }
}

const SESSION_DEFAULTS: CampSession = {
  registrationId: '',
  fullName: '',
  firstName: '',
  selectedAvatarId: '',
  onboardingComplete: false,
  lastPath: '/app',
  savedAt: 0,
};

export function saveSession(partial: Partial<CampSession>) {
  if (typeof window === 'undefined') return;
  const existing = getSession() ?? SESSION_DEFAULTS;
  const next: CampSession = { ...SESSION_DEFAULTS, ...existing, ...partial, savedAt: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function updateLastPath(path: string) {
  // Only persist paths that belong to the participant/captain area
  if (!path.startsWith('/app') && !path.startsWith('/captain')) return;
  saveSession({ lastPath: path });
}
