'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getSession, saveSession } from '@/lib/session';

const CAMP_EVENT_ID = process.env.NEXT_PUBLIC_CAMP_EVENT_ID ?? '';

// ─── Placeholder avatars (replaced by Gemini-generated ones later) ────────────
const PLACEHOLDER_AVATARS = [
  { id: 'av1', bg: '#FFD200', icon: '🦁' },
  { id: 'av2', bg: '#123F7A', icon: '🐉' },
  { id: 'av3', bg: '#0c0c0c', icon: '🦅' },
];

type Step = 'phone' | 'avatar' | 'notify' | 'done';

// ─── Background ───────────────────────────────────────────────────────────────
const bgStyle: React.CSSProperties = {
  background:
    'radial-gradient(130% 95% at 50% 18%, #2170d6 0%, #12539f 42%, #0a3372 74%, #061d3f 100%)',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
};

const grainSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function BgLayer() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        opacity: 0.14, mixBlendMode: 'overlay', backgroundImage: grainSvg,
      }}
    />
  );
}

// ─── Step pill progress bar ───────────────────────────────────────────────────
const STEPS: Step[] = ['phone', 'avatar', 'notify'];
const STEP_LABELS: Record<Step, string> = {
  phone: 'Telefone',
  avatar: 'Avatar',
  notify: 'Avisos',
  done: 'Pronto',
};

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 0 28px' }}>
      {STEPS.map((s, i) => {
        const past = i < idx;
        const active = i === idx;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: past ? '#ffd200' : active ? '#fff' : 'rgba(255,255,255,0.15)',
                color: past ? '#0c0c0c' : active ? '#123F7A' : 'rgba(255,255,255,0.4)',
                display: 'grid', placeItems: 'center',
                fontWeight: 900, fontSize: 13,
                border: active ? '2px solid #fff' : 'none',
                transition: 'all .25s',
              }}>
                {past ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: active ? '#fff' : past ? '#ffd200' : 'rgba(255,255,255,0.35)',
              }}>
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: past ? '#ffd200' : 'rgba(255,255,255,0.15)', transition: 'background .3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(7,28,64,0.85)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 18,
      padding: '28px 22px',
      boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
    }}>
      {children}
    </div>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryBtn({ children, onClick, disabled, type = 'button' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        fontWeight: 700, fontSize: 17, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: disabled ? 'rgba(12,12,12,0.4)' : '#0c0c0c',
        background: disabled ? 'rgba(255,210,0,0.35)' : '#ffd200',
        border: 'none', borderRadius: 12, padding: '15px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 12px 28px -10px rgba(255,210,0,0.45)',
        transition: 'all .15s',
        marginTop: 20,
      }}
    >
      {children}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');

  // Phone step state
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [participantName, setParticipantName] = useState('');

  // Avatar step state
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // Notify step state
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'granted' | 'denied' | 'unsupported'>('idle');

  const phoneRef = useRef<HTMLInputElement>(null);

  // If already has a session, skip to the right step
  useEffect(() => {
    const session = getSession();
    if (session?.onboardingComplete) {
      router.replace(session.lastPath || '/app');
      return;
    }
    if (session?.registrationId && !session.selectedAvatarId) {
      setRegistrationId(session.registrationId);
      setParticipantName(session.firstName);
      setStep('avatar');
      return;
    }
    if (session?.registrationId && session.selectedAvatarId) {
      setRegistrationId(session.registrationId);
      setParticipantName(session.firstName);
      setSelectedAvatar(session.selectedAvatarId);
      setStep('notify');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step === 'phone') phoneRef.current?.focus();
  }, [step]);

  // ── Step 1: Phone lookup ────────────────────────────────────────────────────
  async function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    const inputDigits = phone.replace(/\D/g, '');
    if (inputDigits.length < 7) {
      setPhoneError('Coloca o número completo com DDD.');
      return;
    }
    setPhoneError('');
    setPhoneLoading(true);

    try {
      const supabase = createClient();

      const { data: rows, error } = await supabase.rpc('lookup_registration_by_phone', {
        p_phone: inputDigits,
        p_camp_event_id: CAMP_EVENT_ID,
      });

      if (error) throw error;

      const match = (rows as { id: string; full_name: string; status: string }[] | null)?.[0];

      if (!match) {
        setPhoneError('Número não encontrado. Usa o mesmo que colocaste na inscrição.');
        setPhoneLoading(false);
        return;
      }

      if (match.status === 'denied') {
        setPhoneError('Sua inscrição não foi aprovada. Fala com a liderança.');
        setPhoneLoading(false);
        return;
      }

      setRegistrationId(match.id);
      const firstName = match.full_name.split(' ')[0];
      setParticipantName(firstName);
      saveSession({
        registrationId: match.id,
        fullName: match.full_name,
        firstName,
        onboardingComplete: false,
      });
      setStep('avatar');
    } catch {
      setPhoneError('Erro ao buscar inscrição. Tenta de novo.');
    } finally {
      setPhoneLoading(false);
    }
  }

  // ── Step 2: Avatar pick ─────────────────────────────────────────────────────
  async function handleAvatarConfirm() {
    if (!selectedAvatar) return;
    saveSession({ selectedAvatarId: selectedAvatar });
    setStep('notify');
  }

  // ── Step 3: Notifications ───────────────────────────────────────────────────
  async function requestNotifications() {
    if (!('Notification' in window)) {
      setNotifyStatus('unsupported');
      return;
    }
    const result = await Notification.requestPermission();
    setNotifyStatus(result === 'granted' ? 'granted' : 'denied');
  }

  function finishOnboarding() {
    saveSession({ onboardingComplete: true, lastPath: '/app' });
    router.push('/app');
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ ...bgStyle, color: '#fff' }}>
      <BgLayer />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, margin: '0 auto', padding: '48px 18px 60px' }}>

        {/* Logo / wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.36em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
            Acampadentro 2026
          </p>
          <div style={{ fontWeight: 900, fontSize: 'clamp(44px, 16vw, 72px)', lineHeight: 0.85, color: '#ffd200', transform: 'skew(-6deg)', textTransform: 'uppercase', textShadow: '4px 5px 0 rgba(0,0,0,0.45)', letterSpacing: '0.01em' }}>
            DESPERTA!
          </div>
        </div>

        {step !== 'done' && <StepBar current={step} />}

        {/* ── Step 1: Phone ── */}
        {step === 'phone' && (
          <Card>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ffd200', marginBottom: 8 }}>Passo 1 de 3</p>
            <h2 style={{ fontSize: 26, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 8 }}>
              Qual é o seu<br />WhatsApp?
            </h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 22, lineHeight: 1.5 }}>
              Usa o número que você colocou na inscrição. É assim que a gente te reconhece.
            </p>

            <form onSubmit={handlePhoneSubmit}>
              <input
                ref={phoneRef}
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                placeholder="(000) 000-0000"
                inputMode="tel"
                style={{
                  width: '100%',
                  fontSize: 26, fontWeight: 700, letterSpacing: '0.04em', textAlign: 'center',
                  color: '#fff', background: 'rgba(255,255,255,0.08)',
                  border: phoneError ? '2px solid rgba(255,100,100,0.8)' : '1.5px solid rgba(255,255,255,0.18)',
                  borderRadius: 12, padding: '14px 16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#ffd200'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255,210,0,0.18)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = phoneError ? 'rgba(255,100,100,0.8)' : 'rgba(255,255,255,0.18)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {phoneError && (
                <p style={{ fontSize: 13, color: '#ffaaaa', fontWeight: 500, marginTop: 8 }}>{phoneError}</p>
              )}
              <PrimaryBtn type="submit" disabled={phoneLoading || phone.trim().length < 7}>
                {phoneLoading ? 'Buscando...' : 'Continuar →'}
              </PrimaryBtn>
            </form>
          </Card>
        )}

        {/* ── Step 2: Avatar ── */}
        {step === 'avatar' && (
          <Card>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ffd200', marginBottom: 8 }}>Passo 2 de 3</p>
            <h2 style={{ fontSize: 26, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 6 }}>
              Oi, {participantName}!<br />Escolha seu avatar
            </h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.5 }}>
              Esse vai ser você no placar, no time e nos desafios. Escolhe um — sem voltar depois.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 8 }}>
              {PLACEHOLDER_AVATARS.map((av) => {
                const active = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    style={{
                      flex: 1, aspectRatio: '1',
                      borderRadius: 18,
                      background: av.bg,
                      border: active ? '3px solid #fff' : '3px solid transparent',
                      outline: active ? '3px solid #ffd200' : '3px solid transparent',
                      outlineOffset: 2,
                      fontSize: 'clamp(32px, 10vw, 48px)',
                      display: 'grid', placeItems: 'center',
                      cursor: 'pointer',
                      boxShadow: active ? '0 0 0 6px rgba(255,210,0,0.25)' : '0 4px 16px rgba(0,0,0,0.3)',
                      transform: active ? 'scale(1.07)' : 'scale(1)',
                      transition: 'all .18s',
                    }}
                    aria-label={`Avatar ${av.id}`}
                  >
                    {av.icon}
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 10 }}>
              Avatares gerados pela foto vêm em breve
            </p>

            <PrimaryBtn onClick={handleAvatarConfirm} disabled={!selectedAvatar}>
              Esse é o meu →
            </PrimaryBtn>
          </Card>
        )}

        {/* ── Step 3: Notifications ── */}
        {step === 'notify' && (
          <Card>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ffd200', marginBottom: 8 }}>Passo 3 de 3</p>
            <h2 style={{ fontSize: 26, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 8 }}>
              Ative os<br />avisos
            </h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 22, lineHeight: 1.5 }}>
              Nas próximas semanas você vai receber leituras, keywords diárias e o aviso de quando os times são revelados. Tudo chega por aqui.
            </p>

            {notifyStatus === 'idle' && (
              <>
                {/* What you'll receive */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                  {[
                    { icon: '📖', text: 'Leituras e keywords antes do camp' },
                    { icon: '👥', text: 'Revelação do seu time' },
                    { icon: '⚡', text: 'Mudança de modo ao vivo' },
                    { icon: '🔔', text: 'Avisos do capitão e da liderança' },
                  ].map((item) => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <PrimaryBtn onClick={requestNotifications}>
                  Ativar avisos
                </PrimaryBtn>
                <button
                  type="button"
                  onClick={finishOnboarding}
                  style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 0' }}
                >
                  Agora não
                </button>
              </>
            )}

            {notifyStatus === 'granted' && (
              <>
                <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🔔</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#ffd200' }}>Avisos ativados!</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>Você vai ser o primeiro a saber de tudo.</p>
                </div>
                <PrimaryBtn onClick={finishOnboarding}>
                  Entrar no camp →
                </PrimaryBtn>
              </>
            )}

            {(notifyStatus === 'denied' || notifyStatus === 'unsupported') && (
              <>
                <div style={{ background: 'rgba(255,150,0,0.1)', border: '1px solid rgba(255,150,0,0.3)', borderRadius: 10, padding: '14px', marginBottom: 20 }}>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,200,100,0.9)', fontWeight: 500, lineHeight: 1.5 }}>
                    {notifyStatus === 'unsupported'
                      ? 'Seu navegador não suporta notificações. Salva o app na tela inicial e tenta de novo.'
                      : 'Você bloqueou as notificações. Para ativar: Ajustes → Notificações → DESPERTA → Permitir.'}
                  </p>
                </div>
                <PrimaryBtn onClick={finishOnboarding}>
                  Entrar mesmo assim →
                </PrimaryBtn>
              </>
            )}
          </Card>
        )}

      </div>
    </div>
  );
}
