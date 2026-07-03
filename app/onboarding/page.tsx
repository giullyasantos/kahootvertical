'use client';

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getSession, saveSession } from '@/lib/session';

const CAMP_EVENT_ID = process.env.NEXT_PUBLIC_CAMP_EVENT_ID ?? '';

// ─── Placeholder avatars (replaced by Gemini-generated ones later) ────────────
const PLACEHOLDER_AVATARS = [
  { id: 'av1', bg: '#FFD200', icon: '🦁' },
  { id: 'av2', bg: '#123F7A', icon: '🐉' },
  { id: 'av3', bg: '#0c0c0c', icon: '🦅' },
];

type Step = 'install' | 'phone' | 'avatar' | 'notify' | 'done';
type BrowserKind = 'instagram' | 'ios' | 'android' | 'other';

function detectBrowser(): BrowserKind {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/Instagram/.test(ua)) return 'instagram';
  if (/iP(hone|od|ad)/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

// ─── Install step ─────────────────────────────────────────────────────────────
function InstallStep({ onDone }: { onDone: () => void }) {
  const [browser] = useState<BrowserKind>(() => detectBrowser());
  const [subStep, setSubStep] = useState<'detect' | 'instructions' | 'done'>('detect');

  const instructions: Record<BrowserKind, { icon: string; title: string; steps: string[] }> = {
    instagram: {
      icon: '📸',
      title: 'Sai do Instagram primeiro',
      steps: [
        'Toca nos 3 pontinhos (⋯) no canto superior direito.',
        'Toca em "Abrir no navegador externo".',
        'O Safari ou Chrome vai abrir com essa mesma página — continue por lá.',
      ],
    },
    ios: {
      icon: '📱',
      title: 'Salva no iPhone',
      steps: [
        'Toca no ícone de Compartilhar (□↑) na barra inferior do Safari.',
        'Role pra baixo e toca em "Adicionar à Tela de Início".',
        'Toca em "Adicionar" no canto superior direito.',
        'Feche o Safari e abra o app pela tela inicial.',
      ],
    },
    android: {
      icon: '🤖',
      title: 'Salva no Android',
      steps: [
        'Toca nos 3 pontinhos (⋮) no canto superior direito do Chrome.',
        'Toca em "Adicionar à tela inicial".',
        'Toca em "Adicionar" na confirmação.',
        'Feche o Chrome e abra o app pela tela inicial.',
      ],
    },
    other: {
      icon: '🌐',
      title: 'Salva o app',
      steps: [
        'iPhone (Safari): Compartilhar → "Adicionar à Tela de Início" → Adicionar.',
        'Android (Chrome): Menu (⋮) → "Adicionar à tela inicial" → Adicionar.',
        'Feche o navegador e abra o app pela tela inicial.',
      ],
    },
  };

  const info = instructions[browser];

  return (
    <Card>
      {/* Success badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#FFD200', color: '#0c0c0c',
          display: 'grid', placeItems: 'center', fontSize: 26,
        }}>✓</div>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 8, textAlign: 'center' }}>
        Inscrição enviada!
      </h2>
      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.5, marginBottom: 24 }}>
        Agora salva o app na sua tela inicial pra receber os avisos do camp.
      </p>

      {subStep === 'detect' && (
        <>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
            Você está usando...
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([
              { kind: 'instagram' as BrowserKind, label: 'Instagram', icon: '📸' },
              { kind: 'ios'       as BrowserKind, label: 'Safari (iPhone)', icon: '📱' },
              { kind: 'android'   as BrowserKind, label: 'Chrome (Android)', icon: '🤖' },
              { kind: 'other'     as BrowserKind, label: 'Outro navegador', icon: '🌐' },
            ]).map((opt) => (
              <button
                key={opt.kind}
                type="button"
                onClick={() => setSubStep('instructions')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: browser === opt.kind ? 'rgba(255,210,0,0.1)' : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${browser === opt.kind ? 'rgba(255,210,0,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, padding: '13px 15px', cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                <span style={{ fontSize: 22 }}>{opt.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: browser === opt.kind ? '#FFD200' : 'rgba(255,255,255,0.6)' }}>
                  {opt.label}
                  {browser === opt.kind && <span style={{ fontSize: 11, color: 'rgba(255,210,0,0.6)', marginLeft: 8 }}>detectado</span>}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {subStep === 'instructions' && (
        <>
          <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 10 }}>{info.icon}</div>
          <h3 style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
            {info.title}
          </h3>
          <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
            {info.steps.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                <span style={{
                  flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                  background: '#FFD200', color: '#0c0c0c',
                  display: 'grid', placeItems: 'center',
                  fontWeight: 900, fontSize: 12, marginTop: 1,
                }}>{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: s.replace(/("[^"]+"|⋯|⋮|□↑)/g, '<b style="color:#FFD200">$1</b>') }} />
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => setSubStep('done')}
            style={{
              width: '100%', fontWeight: 900, fontSize: 17, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#0c0c0c', background: '#FFD200',
              border: 'none', borderRadius: 12, padding: '15px 16px', cursor: 'pointer',
              boxShadow: '0 12px 28px -10px rgba(255,210,0,0.45)',
            }}
          >
            {browser === 'instagram' ? 'Entendi, vou abrir no navegador' : 'Salvei na tela inicial ✓'}
          </button>

          <button
            type="button"
            onClick={() => setSubStep('detect')}
            style={{ display: 'block', width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 0' }}
          >
            ← Outro navegador
          </button>
        </>
      )}

      {subStep === 'done' && (
        <>
          {browser === 'instagram' ? (
            <div style={{ background: 'rgba(255,210,0,0.08)', border: '1px solid rgba(255,210,0,0.2)', borderRadius: 12, padding: '16px', marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Quando o Safari ou Chrome abrir, segue as instruções pra salvar na tela inicial. Depois volte e entre com seu número.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#FFD200' }}>App salvo!</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                Abre ele pela tela inicial e entra com seu número.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onDone}
            style={{
              width: '100%', fontWeight: 900, fontSize: 17, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#0c0c0c', background: '#FFD200',
              border: 'none', borderRadius: 12, padding: '15px 16px', cursor: 'pointer',
              boxShadow: '0 12px 28px -10px rgba(255,210,0,0.45)',
            }}
          >
            Entrar com meu número →
          </button>
        </>
      )}
    </Card>
  );
}

// ─── No-account modal ─────────────────────────────────────────────────────────
function NoAccountModal({ phone, onClose }: { phone: string; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        aria-hidden
      />
      {/* Sheet */}
      <div style={{
        position: 'fixed', inset: 'auto 0 0 0', zIndex: 90,
        background: '#0a1f3d',
        borderRadius: '20px 20px 0 0',
        border: '2px solid rgba(255,255,255,0.1)',
        borderBottom: 'none',
        padding: '28px 24px 40px',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.15)', margin: '0 auto 24px' }} />

        <div style={{ fontSize: 44, textAlign: 'center', marginBottom: 16 }}>🤔</div>

        <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', color: '#fff', textAlign: 'center', lineHeight: 1.15, marginBottom: 10 }}>
          Número não encontrado
        </h2>

        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.6, marginBottom: 6 }}>
          O número <b style={{ color: '#FFD200' }}>{phone}</b> não tem inscrição ainda.
        </p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
          Faz a inscrição primeiro — é rápido. Depois volta aqui e entra com o mesmo número.
        </p>

        <a
          href="/register"
          style={{
            display: 'block', textAlign: 'center', width: '100%',
            fontWeight: 900, fontSize: 17, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: '#0c0c0c', background: '#FFD200',
            borderRadius: 14, padding: '15px 16px',
            textDecoration: 'none',
            boxShadow: '0 10px 28px -8px rgba(255,210,0,0.45)',
          }}
        >
          Fazer inscrição →
        </a>

        <button
          type="button"
          onClick={onClose}
          style={{
            display: 'block', width: '100%', marginTop: 10,
            fontWeight: 700, fontSize: 14, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', background: 'transparent',
            border: 'none', padding: '12px', cursor: 'pointer',
          }}
        >
          Tentar outro número
        </button>
      </div>
    </>
  );
}

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
  install: 'Instalar',
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
function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome') === '1';
  const [step, setStep] = useState<Step>(welcome ? 'install' : 'phone');

  // Phone step state
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showNoAccount, setShowNoAccount] = useState(false);
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

    if (session?.registrationId && session.selectedAvatarId) {
      setRegistrationId(session.registrationId);
      setParticipantName(session.firstName);
      setSelectedAvatar(session.selectedAvatarId);

      // Avatar already chosen — check if notifications already granted
      const alreadyGranted =
        typeof Notification !== 'undefined' && Notification.permission === 'granted';

      if (alreadyGranted) {
        // Nothing left to do — mark complete and go straight to app
        saveSession({ onboardingComplete: true, lastPath: '/app' });
        router.replace('/app');
        return;
      }

      // Still need to ask for notifications
      setStep('notify');
      return;
    }

    if (session?.registrationId && !session.selectedAvatarId) {
      setRegistrationId(session.registrationId);
      setParticipantName(session.firstName);
      setStep('avatar');
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
        setPhoneLoading(false);
        setShowNoAccount(true);
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
      {showNoAccount && (
        <NoAccountModal phone={phone} onClose={() => setShowNoAccount(false)} />
      )}
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

        {step !== 'done' && step !== 'install' && <StepBar current={step} />}

        {/* ── Install step (post-registration) ── */}
        {step === 'install' && (
          <InstallStep onDone={() => setStep('phone')} />
        )}

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

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'radial-gradient(130% 95% at 50% 18%, #2170d6 0%, #061d3f 100%)', display: 'grid', placeItems: 'center' }}>
        <span style={{ color: '#FFD200', fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.5 }}>•••</span>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
