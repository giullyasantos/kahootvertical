'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

// ─── The active camp event ID from the database.
// Replace this with the real UUID from your camp_events row after running the seed.
const CAMP_EVENT_ID = process.env.NEXT_PUBLIC_CAMP_EVENT_ID ?? '';

const skillOptions = [
  { id: 'a1', emoji: '🍳', label: 'Cozinha', value: 'Cozinha' },
  { id: 'a2', emoji: '⚽', label: 'Esportes', value: 'Esportes / físico' },
  { id: 'a3', emoji: '📖', label: 'Bíblia & papo', value: 'Bíblia & boa de papo' },
  { id: 'a4', emoji: '🎭', label: 'Criatividade', value: 'Criatividade (música, dança, teatro)' },
  { id: 'a5', emoji: '🎬', label: 'Vídeo', value: 'Vídeo (gravar, editar, aparecer)' },
  { id: 'a6', emoji: '🧭', label: 'Liderança', value: 'Liderança / organização' },
];

const requiredFields = ['fullName', 'age', 'phone', 'emergencyName', 'emergencyPhone'] as const;
type RequiredField = (typeof requiredFields)[number];

interface RegistrationFormState {
  fullName: string;
  age: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  dietaryNotes: string;
  customSkill: string;
  bonusAnswer: string;
  imagePermission: boolean;
  lateNightAgreement: boolean;
  paid: boolean;
}

const initialForm: RegistrationFormState = {
  fullName: '',
  age: '',
  phone: '',
  emergencyName: '',
  emergencyPhone: '',
  dietaryNotes: '',
  customSkill: '',
  bonusAnswer: '',
  imagePermission: false,
  lateNightAgreement: false,
  paid: false,
};

function fileLabel(file: File | null) {
  if (!file) return null;
  return file.name.length > 26 ? `${file.name.slice(0, 24)}…` : file.name;
}

// ─── Browser detection ───────────────────────────────────────────────────────
type BrowserKind = 'instagram' | 'ios-safari' | 'android-chrome' | 'other';

function detectBrowser(): BrowserKind {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/Instagram/.test(ua)) return 'instagram';
  const isIOS = /iP(hone|od|ad)/.test(ua);
  if (isIOS) return 'ios-safari';
  if (/Android/.test(ua) && /Chrome/.test(ua)) return 'android-chrome';
  return 'other';
}

// ─── Shared style tokens ────────────────────────────────────────────────────
const panelStyle = { background: 'rgba(7,28,64,0.82)', border: '1px solid rgba(255,255,255,0.16)' };
const fieldStyle = { background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.16)' };
const inputCls =
  'w-full rounded-[10px] px-[14px] py-[12px] text-[15.5px] font-medium text-white placeholder:text-white/40 transition-all duration-150 focus:outline-none focus:border-[#ffd200] focus:ring-[4px] focus:ring-[rgba(255,210,0,0.18)]';
const labelCls = 'block text-[16px] font-semibold uppercase tracking-[0.04em] mb-[7px]';
const hintCls = 'text-[12.5px] text-white/60 mb-[7px]';

// ─── Background SVGs ─────────────────────────────────────────────────────────
const grainSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const grungeSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.22' numOctaves='2' seed='11'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -18 4.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E")`;
const bgStyle: React.CSSProperties = {
  background: 'radial-gradient(130% 95% at 50% 18%, #2170d6 0%, #12539f 42%, #0a3372 74%, #061d3f 100%)',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
  position: 'relative',
};

// ─── Section tag component ───────────────────────────────────────────────────
function SectionTag({ children, mt = 6 }: { children: React.ReactNode; mt?: number }) {
  return (
    <div className="flex items-center gap-3" style={{ marginBottom: 18, marginTop: mt }}>
      <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffd200', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.16)' }} />
    </div>
  );
}

// ─── Overlay layers ──────────────────────────────────────────────────────────
function BgLayers() {
  return (
    <>
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.16, mixBlendMode: 'overlay', backgroundImage: grainSvg }} />
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.42, backgroundImage: grungeSvg, backgroundSize: '520px 520px', mixBlendMode: 'multiply' }} />
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(120% 90% at 50% 25%, transparent 45%, rgba(4,16,40,0.55) 100%)' }} />
    </>
  );
}

// ─── PWA Install instructions ────────────────────────────────────────────────
function InstallInstructions({ browser }: { browser: BrowserKind }) {
  const stepStyle: React.CSSProperties = {
    position: 'relative', paddingLeft: 32, marginBottom: 12,
    fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5,
  };
  const numStyle: React.CSSProperties = {
    position: 'absolute', left: 0, top: 1, width: 22, height: 22,
    background: '#ffd200', color: '#0c0c0c', borderRadius: '50%',
    fontWeight: 900, fontSize: 12, display: 'grid', placeItems: 'center',
  };

  if (browser === 'instagram') {
    return (
      <div>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
          Você está no navegador do Instagram. Precisa abrir no Safari ou Chrome pra conseguir salvar o app.
        </p>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            <>Toque nos <b style={{ color: '#ffd200' }}>3 pontinhos</b> no canto superior direito da tela.</>,
            <>Toque em <b style={{ color: '#ffd200' }}>&quot;Abrir no navegador externo&quot;</b> (ou &quot;Open in External Browser&quot;).</>,
            <>O link vai abrir no <b style={{ color: '#ffd200' }}>Safari ou Chrome</b>. Continue de lá.</>,
          ].map((text, i) => (
            <li key={i} style={stepStyle}><span style={numStyle}>{i + 1}</span>{text}</li>
          ))}
        </ol>
      </div>
    );
  }

  if (browser === 'ios-safari') {
    return (
      <div>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
          Salve o app na sua tela inicial do iPhone pra receber notificações e acessar fácil.
        </p>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            <>Toque no ícone de <b style={{ color: '#ffd200' }}>Compartilhar</b> (quadrado com seta pra cima) na barra inferior do Safari.</>,
            <>Role pra baixo e toque em <b style={{ color: '#ffd200' }}>&quot;Adicionar à Tela de Início&quot;</b>.</>,
            <>Deixa o nome como está e toque em <b style={{ color: '#ffd200' }}>Adicionar</b> no canto superior direito.</>,
            <>Feche o Safari. O app vai aparecer na sua tela inicial. <b style={{ color: '#ffd200' }}>Abra por lá.</b></>,
          ].map((text, i) => (
            <li key={i} style={stepStyle}><span style={numStyle}>{i + 1}</span>{text}</li>
          ))}
        </ol>
      </div>
    );
  }

  if (browser === 'android-chrome') {
    return (
      <div>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
          Salve o app na tela inicial do Android pra receber notificações e acessar fácil.
        </p>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            <>Toque nos <b style={{ color: '#ffd200' }}>3 pontinhos</b> no canto superior direito do Chrome.</>,
            <>Toque em <b style={{ color: '#ffd200' }}>&quot;Adicionar à tela inicial&quot;</b>.</>,
            <>Toque em <b style={{ color: '#ffd200' }}>Adicionar</b> na confirmação.</>,
            <>Feche o Chrome. O app vai aparecer na tela inicial. <b style={{ color: '#ffd200' }}>Abra por lá.</b></>,
          ].map((text, i) => (
            <li key={i} style={stepStyle}><span style={numStyle}>{i + 1}</span>{text}</li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
        Use Safari (iPhone) ou Chrome (Android) para salvar o app na sua tela inicial.
      </p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {[
          <><b style={{ color: '#ffd200' }}>iPhone:</b> Safari → ícone Compartilhar → &quot;Adicionar à Tela de Início&quot; → Adicionar.</>,
          <><b style={{ color: '#ffd200' }}>Android:</b> Chrome → 3 pontinhos → &quot;Adicionar à tela inicial&quot; → Adicionar.</>,
          <>Feche o navegador e abra o app pela tela inicial.</>,
        ].map((text, i) => (
          <li key={i} style={stepStyle}><span style={numStyle}>{i + 1}</span>{text}</li>
        ))}
      </ol>
    </div>
  );
}

// ─── Success / PWA install screen ────────────────────────────────────────────
function SuccessScreen({ name, onReset }: { name: string; onReset: () => void }) {
  const [browser, setBrowser] = useState<BrowserKind>('other');
  const [browserChosen, setBrowserChosen] = useState(false);
  const [installDone, setInstallDone] = useState(false);

  useEffect(() => {
    // Auto-detect but let the user override
    setBrowser(detectBrowser());
  }, []);

  return (
    <div style={bgStyle} className="text-white">
      <BgLayers />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', padding: '60px 18px 70px' }}>
        <div style={{ ...panelStyle, borderRadius: 14, padding: '28px 22px', boxShadow: '0 30px 70px -30px rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}>

          {/* Confirmed */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ffd200', color: '#0c0c0c', display: 'grid', placeItems: 'center', fontSize: 30, margin: '0 auto 16px' }}>✓</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 6 }}>Inscrição enviada!</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
              Oi <b style={{ color: '#ffd200' }}>{name.split(' ')[0]}</b>, sua inscrição foi salva. A liderança vai confirmar em breve.
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginBottom: 24 }} />

          {!installDone ? (
            <>
              <SectionTag mt={0}>Próximo passo: salvar o app</SectionTag>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
                Você vai receber leituras, keywords e atualizações do camp pelo app. Pra isso funcionar, ele precisa estar salvo na sua tela inicial.
              </p>

              {/* Browser chooser */}
              {!browserChosen ? (
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Você está abrindo esse link pelo...
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { kind: 'ios-safari' as BrowserKind, label: '📱 Safari (iPhone)', detail: 'Navegador padrão do iPhone' },
                      { kind: 'android-chrome' as BrowserKind, label: '🤖 Chrome (Android)', detail: 'Navegador padrão Android' },
                      { kind: 'instagram' as BrowserKind, label: '📸 Navegador do Instagram', detail: 'Link aberto de dentro do Instagram' },
                      { kind: 'other' as BrowserKind, label: '🌐 Outro navegador', detail: 'Firefox, Samsung, etc.' },
                    ].map((opt) => (
                      <button
                        key={opt.kind}
                        type="button"
                        onClick={() => { setBrowser(opt.kind); setBrowserChosen(true); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          ...fieldStyle,
                          borderRadius: 11, padding: '12px 15px', cursor: 'pointer',
                          border: browser === opt.kind ? '1.5px solid #ffd200' : '1.5px solid rgba(255,255,255,0.16)',
                          background: browser === opt.kind ? 'rgba(255,210,0,0.1)' : 'rgba(255,255,255,0.07)',
                          textAlign: 'left', width: '100%',
                          transition: 'border-color .15s',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{opt.label.split(' ')[0]}</span>
                        <span>
                          <b style={{ display: 'block', fontWeight: 700, fontSize: 15, color: '#fff' }}>{opt.label.slice(opt.label.indexOf(' ') + 1)}</b>
                          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>{opt.detail}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setBrowserChosen(false)}
                    style={{ fontSize: 12.5, color: '#ffd200', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 14px', display: 'block' }}
                  >
                    ← Trocar navegador
                  </button>
                  <InstallInstructions browser={browser} />

                  <button
                    type="button"
                    onClick={() => setInstallDone(true)}
                    style={{
                      width: '100%', marginTop: 22,
                      fontWeight: 700, fontSize: 18, letterSpacing: '0.05em', textTransform: 'uppercase',
                      color: '#0c0c0c', background: '#ffd200',
                      border: 'none', borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                      boxShadow: '0 12px 28px -10px rgba(255,210,0,0.5)',
                    }}
                  >
                    Salvei na tela inicial ✓
                  </button>

                  {browser === 'instagram' && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 10 }}>
                      Depois de abrir no Safari ou Chrome, volte aqui e toque em &quot;Salvei na tela inicial&quot;.
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <SectionTag mt={0}>Pronto! App salvo 🎉</SectionTag>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 22 }}>
                Agora abre o app direto da tela inicial do celular. Lá vão aparecer leituras, keywords e os avisos do camp.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  href="/onboarding"
                  style={{
                    display: 'block', textAlign: 'center',
                    fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: '#0c0c0c', background: '#ffd200',
                    borderRadius: 12, padding: '14px 16px',
                    boxShadow: '0 12px 28px -10px rgba(255,210,0,0.5)',
                    textDecoration: 'none',
                  }}
                >
                  Continuar no app →
                </Link>
                <button
                  type="button"
                  onClick={onReset}
                  style={{
                    fontWeight: 600, fontSize: 15, textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.4)', background: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
                  }}
                >
                  Fazer outra inscrição
                </button>
              </div>
            </>
          )}
        </div>

        <footer style={{ textAlign: 'center', fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', padding: '24px 20px 0' }}>
          DESPERTA! · Acampadentro 2026 · 31 jul – 1 ago
        </footer>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [form, setForm] = useState<RegistrationFormState>(initialForm);
  const [skills, setSkills] = useState<string[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<RequiredField | 'payment' | 'submit', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const selectedSkills = useMemo(() => {
    const list = [...skills];
    if (form.customSkill.trim()) list.push(form.customSkill.trim());
    return list;
  }, [form.customSkill, skills]);

  function updateField<K extends keyof RegistrationFormState>(field: K, value: RegistrationFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (requiredFields.includes(field as RequiredField)) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function toggleSkill(value: string) {
    setSkills((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>, kind: 'photo' | 'proof') {
    const file = event.target.files?.[0] ?? null;
    if (kind === 'photo') {
      setPhoto(file);
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else { setPhotoPreview(null); }
    }
    if (kind === 'proof') {
      setProof(file);
      setErrors((current) => ({ ...current, payment: undefined }));
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setProofPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else { setProofPreview(null); }
    }
  }

  function validate() {
    const nextErrors: Partial<Record<RequiredField | 'payment', string>> = {};
    requiredFields.forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = 'Campo obrigatório.';
    });
    if (!proof || !form.paid) nextErrors.payment = 'Anexe o comprovante e confirme o pagamento.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      const supabase = createClient();

      // Resolve camp_event_id: use env var or look up the first open event
      let campEventId = CAMP_EVENT_ID;
      if (!campEventId) {
        const { data: eventRow } = await supabase
          .from('camp_events')
          .select('id')
          .in('status', ['registration', 'precamp', 'live'])
          .order('starts_at', { ascending: true })
          .limit(1)
          .single();
        campEventId = eventRow?.id ?? '';
      }

      if (!campEventId) {
        setErrors({ submit: 'Inscrições não estão abertas agora. Fala com a liderança.' });
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('registrations').insert({
        camp_event_id: campEventId,
        full_name: form.fullName.trim(),
        age: parseInt(form.age, 10),
        phone: form.phone.trim(),
        emergency_contact_name: form.emergencyName.trim(),
        emergency_contact_phone: form.emergencyPhone.trim(),
        dietary_notes: form.dietaryNotes.trim() || null,
        skills: selectedSkills,
        custom_skill: form.customSkill.trim() || null,
        bonus_answer: form.bonusAnswer.trim() || null,
        image_permission: form.imagePermission,
        late_night_agreement: form.lateNightAgreement,
        // photo and proof files: storage upload can be wired up later
        payment_status: form.paid ? 'submitted' : 'missing',
        status: 'submitted',
      });

      if (insertError) {
        // Duplicate phone check
        if (insertError.code === '23505') {
          setErrors({ submit: 'Esse número de WhatsApp já tem uma inscrição. Fala com a liderança se precisar corrigir.' });
        } else {
          setErrors({ submit: `Erro ao enviar: ${insertError.message}` });
        }
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: 'Erro inesperado. Tenta de novo ou fala com a liderança.' });
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setSkills([]);
    setPhoto(null);
    setPhotoPreview(null);
    setProof(null);
    setProofPreview(null);
    setErrors({});
    setSubmitted(false);
    setSubmitting(false);
  }

  if (submitted) {
    return <SuccessScreen name={form.fullName} onReset={resetForm} />;
  }

  return (
    <div style={bgStyle} className="text-white">
      <BgLayers />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HERO ── */}
        <header style={{ padding: '48px 24px 30px', textAlign: 'center' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <p style={{ fontWeight: 600, fontSize: 15, letterSpacing: '0.34em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 14 }}>
              Acampadentro 2026
            </p>
            <div style={{ fontWeight: 900, fontSize: 'clamp(74px, 21vw, 150px)', lineHeight: 0.82, color: '#ffd200', transform: 'skew(-7deg)', letterSpacing: '0.01em', textShadow: '5px 6px 0 rgba(0,0,0,0.55)', marginBottom: 2, paddingLeft: '0.06em', textTransform: 'uppercase' }}>
              DESPERTA!
            </div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ display: 'inline-block', background: '#0c0c0c', color: '#fff', fontWeight: 700, fontSize: 'clamp(20px, 5.5vw, 30px)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 22px 4px', transform: 'skew(-7deg)' }}>
                <span style={{ display: 'inline-block', transform: 'skew(7deg)' }}>31 jul – 1 ago</span>
              </span>
            </div>
            <div style={{ marginBottom: 22 }}>
              <span style={{ display: 'inline-block', background: '#ffd200', color: '#0c0c0c', fontWeight: 700, fontSize: 'clamp(15px, 4vw, 20px)', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '7px 20px', borderRadius: 3, transform: 'rotate(-1.2deg)' }}>
                Adoração · Aprendizado · Gincanas
              </span>
            </div>
            <div style={{ fontWeight: 500, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9, display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', alignItems: 'center' }}>
              <span>201 S Clarke Rd, Ocoee FL</span>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffd200', display: 'inline-block' }} />
              <span style={{ color: '#ffd200' }}>Inscrições até 18 jul</span>
            </div>
          </div>
        </header>

        {/* ── FORM SHELL ── */}
        <main style={{ maxWidth: 600, margin: '22px auto 0', padding: '0 18px 70px' }}>
          <div style={{ ...panelStyle, borderRadius: 14, padding: '26px 22px', boxShadow: '0 30px 70px -30px rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}>
            <form onSubmit={submitForm} noValidate>

              {/* ── Seus dados ── */}
              <SectionTag mt={6}>Seus dados</SectionTag>

              {/* Avatar upload */}
              <div style={{ marginBottom: 17 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, ...fieldStyle, borderRadius: 13, padding: '14px 15px' }}>
                  <button type="button" onClick={() => photoInputRef.current?.click()}
                    style={{ width: 76, height: 76, borderRadius: '50%', flexShrink: 0, background: photoPreview ? 'transparent' : 'rgba(0,0,0,0.25)', border: photoPreview ? '2px solid #ffd200' : '2px dashed rgba(255,255,255,0.35)', display: 'grid', placeItems: 'center', cursor: 'pointer', overflow: 'hidden', padding: 0 }}
                    aria-label="Adicionar foto"
                  >
                    {photoPreview ? <img src={photoPreview} alt="Prévia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 30, color: 'rgba(255,255,255,0.45)' }}>＋</span>}
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e, 'photo')} />
                  <div style={{ flex: 1 }}>
                    <b style={{ fontWeight: 600, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 2 }}>Foto do rosto</b>
                    <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{photo ? fileLabel(photo) : 'Toque no círculo pra escolher. Rosto bem visível.'}</span>
                    {photo && <button type="button" onClick={() => photoInputRef.current?.click()} style={{ fontSize: 12.5, color: '#ffd200', fontWeight: 600, background: 'none', border: 'none', padding: '5px 0 0', cursor: 'pointer', display: 'block' }}>Trocar foto</button>}
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div style={{ marginBottom: 17 }}>
                <label style={{ display: 'block' }}>
                  <span className={labelCls}>Nome completo <span style={{ color: '#ffd200' }}>*</span></span>
                  <input type="text" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Como você quer ser chamado no crachá" className={inputCls} style={fieldStyle} />
                  {errors.fullName && <span style={{ color: '#ffd200', fontSize: 12.5, marginTop: 6, display: 'block', fontWeight: 500 }}>{errors.fullName}</span>}
                </label>
              </div>

              {/* Idade + WhatsApp */}
              <div className="flex gap-[13px] max-sm:flex-col" style={{ marginBottom: 17 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block' }}>
                    <span className={labelCls}>Idade <span style={{ color: '#ffd200' }}>*</span></span>
                    <input type="number" min="10" max="40" value={form.age} onChange={(e) => updateField('age', e.target.value)} placeholder="Ex: 17" className={inputCls} style={fieldStyle} />
                    {errors.age && <span style={{ color: '#ffd200', fontSize: 12.5, marginTop: 6, display: 'block', fontWeight: 500 }}>{errors.age}</span>}
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block' }}>
                    <span className={labelCls}>WhatsApp <span style={{ color: '#ffd200' }}>*</span></span>
                    <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="(000) 000-0000" className={inputCls} style={fieldStyle} />
                    {errors.phone && <span style={{ color: '#ffd200', fontSize: 12.5, marginTop: 6, display: 'block', fontWeight: 500 }}>{errors.phone}</span>}
                  </label>
                </div>
              </div>

              {/* ── Contato de emergência ── */}
              <SectionTag mt={28}>Contato de emergência</SectionTag>

              <div className="flex gap-[13px] max-sm:flex-col" style={{ marginBottom: 17 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block' }}>
                    <span className={labelCls}>Nome <span style={{ color: '#ffd200' }}>*</span></span>
                    <input type="text" value={form.emergencyName} onChange={(e) => updateField('emergencyName', e.target.value)} placeholder="Pai, mãe, responsável..." className={inputCls} style={fieldStyle} />
                    {errors.emergencyName && <span style={{ color: '#ffd200', fontSize: 12.5, marginTop: 6, display: 'block', fontWeight: 500 }}>{errors.emergencyName}</span>}
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block' }}>
                    <span className={labelCls}>Telefone <span style={{ color: '#ffd200' }}>*</span></span>
                    <input type="tel" value={form.emergencyPhone} onChange={(e) => updateField('emergencyPhone', e.target.value)} placeholder="(000) 000-0000" className={inputCls} style={fieldStyle} />
                    {errors.emergencyPhone && <span style={{ color: '#ffd200', fontSize: 12.5, marginTop: 6, display: 'block', fontWeight: 500 }}>{errors.emergencyPhone}</span>}
                  </label>
                </div>
              </div>

              {/* Restrições */}
              <div style={{ marginBottom: 17 }}>
                <label style={{ display: 'block' }}>
                  <span className={labelCls}>Restrições alimentares ou alergias</span>
                  <span className={hintCls}>Se tiver alguma. Ajuda os times na hora de cozinhar.</span>
                  <textarea value={form.dietaryNotes} onChange={(e) => updateField('dietaryNotes', e.target.value)} placeholder="Ex: alergia a amendoim, vegetariano, nenhuma..." className={inputCls} style={{ ...fieldStyle, resize: 'vertical', minHeight: 88 }} />
                </label>
              </div>

              {/* ── Talentos ── */}
              <SectionTag mt={28}>No que você é bom?</SectionTag>
              <p className={hintCls} style={{ marginTop: -12, marginBottom: 14 }}>
                Marque tudo que combina. A gente usa isso pra montar times equilibrados.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {skillOptions.map((skill) => {
                  const selected = skills.includes(skill.value);
                  return (
                    <button key={skill.id} type="button" onClick={() => toggleSkill(skill.value)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 15px', border: `1.5px solid ${selected ? '#ffd200' : 'rgba(255,255,255,0.16)'}`, borderRadius: 999, background: selected ? '#ffd200' : 'rgba(255,255,255,0.07)', fontSize: 15, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: selected ? '#0c0c0c' : '#fff', cursor: 'pointer', transition: 'background .14s, border-color .14s, color .14s' }}>
                      {skill.emoji} {skill.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 16, marginBottom: 17 }}>
                <label style={{ display: 'block' }}>
                  <span className={labelCls}>Algo mais que você manda bem?</span>
                  <span className={hintCls}>Opcional. Solta aí seu talento secreto.</span>
                  <input type="text" value={form.customSkill} onChange={(e) => updateField('customSkill', e.target.value)} placeholder="Ex: desenho, fotografia, faço todo mundo rir..." className={inputCls} style={fieldStyle} />
                </label>
              </div>

              {/* ── Bônus ── */}
              <div style={{ margin: '28px 0 8px', borderRadius: 14, background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.08)', padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 170, height: 170, background: 'radial-gradient(circle, rgba(255,210,0,0.28), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#ffd200', color: '#0c0c0c', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 13px', borderRadius: 999, marginBottom: 13 }}>★ Questão bônus</span>
                  <h3 style={{ fontWeight: 700, fontSize: 22, lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '0.01em', marginBottom: 8, color: '#fff' }}>Você pode criar o 11º mandamento — e TODA a humanidade é obrigada a obedecer pra sempre.</h3>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.72)', marginBottom: 15 }}>
                    Qual regra mesquinha você impõe pro mundo inteiro?{' '}
                    <b style={{ color: '#ffd200' }}>A resposta mais engraçada garante pontos extras pro seu time. E sim: os pontos já começaram.</b>
                  </p>
                  <textarea value={form.bonusAnswer} onChange={(e) => updateField('bonusAnswer', e.target.value)} placeholder="Escreva seu mandamento aqui..." className={inputCls} style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.18)', resize: 'vertical', minHeight: 88 }} />
                </div>
              </div>

              {/* ── Confirmações ── */}
              <SectionTag mt={28}>Confirmações</SectionTag>
              {[
                { field: 'imagePermission' as const, title: 'Autorizo o uso de imagem', desc: 'Fotos e vídeos do acampamento podem ser postados no Instagram do ministério.' },
                { field: 'lateNightAgreement' as const, title: 'Tô dentro da loucura', desc: 'Sei que a gente vira a noite e topo o desafio até de madrugada.' },
              ].map((item) => (
                <label key={item.field} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', ...fieldStyle, borderRadius: 11, padding: '13px 14px', marginBottom: 11, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[item.field] as boolean} onChange={(e) => updateField(item.field, e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, accentColor: '#ffd200', flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.82)' }}>
                    <b style={{ display: 'block', fontWeight: 600, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#fff', marginBottom: 1 }}>{item.title}</b>
                    {item.desc}
                  </span>
                </label>
              ))}

              {/* ── Pagamento ── */}
              <SectionTag mt={26}>Pagamento</SectionTag>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,210,0,0.1)', border: '1px solid rgba(255,210,0,0.35)', borderRadius: 12, padding: '14px 16px', marginBottom: 4, fontSize: 13.5, color: 'rgba(255,255,255,0.85)' }}>
                <span style={{ fontWeight: 900, fontSize: 34, color: '#ffd200', lineHeight: 0.9 }}>$30</span>
                <span>por pessoa — cobre toda a comida do fim de semana.</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1.5px dashed rgba(255,255,255,0.3)', borderRadius: 12, padding: '14px 16px', margin: '12px 0', textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#ffd200', marginBottom: 5 }}>Zelle da igreja</div>
                <div style={{ fontWeight: 900, fontSize: 26, color: '#fff', letterSpacing: '0.02em' }}>(000) 000-0000</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>Nome da igreja / conta</div>
              </div>
              <ol style={{ counterReset: 'step', margin: '12px 0 2px', padding: 0, listStyle: 'none' }}>
                {['Faça o pagamento de $30 via Zelle pro número acima.', 'Tire print do comprovante.', 'Anexe o print aqui embaixo. Sua vaga só é confirmada com o comprovante.'].map((text, i) => (
                  <li key={i} style={{ position: 'relative', paddingLeft: 32, marginBottom: 9, fontSize: 13.5, color: 'rgba(255,255,255,0.82)' }}>
                    <span style={{ position: 'absolute', left: 0, top: -1, width: 21, height: 21, background: '#ffd200', color: '#0c0c0c', borderRadius: '50%', fontWeight: 900, fontSize: 12, display: 'grid', placeItems: 'center' }}>{i + 1}</span>
                    {text}
                  </li>
                ))}
              </ol>

              {/* Proof upload */}
              <button type="button" onClick={() => proofInputRef.current?.click()} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 13, background: proofPreview ? 'rgba(255,210,0,0.08)' : 'rgba(0,0,0,0.22)', border: `1.5px ${proofPreview ? 'solid' : 'dashed'} ${proofPreview ? '#ffd200' : 'rgba(255,255,255,0.3)'}`, borderRadius: 12, padding: '13px 15px', cursor: 'pointer', marginTop: 12, transition: 'border-color .15s' }}>
                <span style={{ width: 46, height: 46, borderRadius: 9, background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', fontSize: 20, overflow: 'hidden', flexShrink: 0 }}>
                  {proofPreview ? <img src={proofPreview} alt="Prévia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🧾'}
                </span>
                <span style={{ flex: 1, fontSize: 13.5 }}>
                  <b style={{ display: 'block', fontWeight: 600, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 1 }}>{proof ? 'Comprovante anexado' : 'Anexar comprovante'}</b>
                  <span style={{ color: proof ? '#ffd200' : 'rgba(255,255,255,0.6)', fontWeight: proof ? 500 : 400 }}>{proof ? `✓ ${fileLabel(proof)}` : 'Toque pra escolher o print do Zelle.'}</span>
                </span>
              </button>
              <input ref={proofInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e, 'proof')} />

              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', ...fieldStyle, borderRadius: 11, padding: '13px 14px', marginTop: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.paid} onChange={(e) => { updateField('paid', e.target.checked); setErrors((c) => ({ ...c, payment: undefined })); }} style={{ marginTop: 2, width: 18, height: 18, accentColor: '#ffd200', flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.82)' }}>
                  <b style={{ display: 'block', fontWeight: 600, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.03em', color: '#fff', marginBottom: 1 }}>Já fiz o pagamento via Zelle</b>
                  E o comprovante está anexado acima.
                </span>
              </label>
              {errors.payment && <p style={{ color: '#ffd200', fontSize: 12.5, marginTop: 8, fontWeight: 500 }}>{errors.payment}</p>}

              {/* ── Submit ── */}
              <div style={{ marginTop: 25 }}>
                {errors.submit && (
                  <div style={{ background: 'rgba(255,60,60,0.12)', border: '1.5px solid rgba(255,60,60,0.4)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, fontSize: 13.5, color: '#ffaaaa', fontWeight: 500 }}>
                    {errors.submit}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', fontWeight: 700, fontSize: 20, letterSpacing: '0.06em', textTransform: 'uppercase', color: submitting ? 'rgba(12,12,12,0.5)' : '#0c0c0c', background: '#ffd200', border: 'none', borderRadius: 12, padding: 15, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'transform .12s, box-shadow .2s', boxShadow: '0 14px 30px -12px rgba(255,210,0,0.55)', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Enviando...' : 'Enviar inscrição'}
                </button>
              </div>

            </form>
          </div>

          <footer style={{ textAlign: 'center', fontWeight: 600, fontSize: 13.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', padding: '0 20px 40px', marginTop: 20 }}>
            DESPERTA! · Acampadentro 2026 · 31 jul – 1 ago · dúvidas? fala com a liderança.
          </footer>
        </main>
      </div>
    </div>
  );
}
