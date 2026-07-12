import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Stethoscope,
  HeartPulse,
  Pill,
  Cross,
  Syringe,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

import { useLogin, useRequestCode, useResetPassword } from '@/services/useAuth';

type Mode = 'login' | 'recover';
type RecoverStep = 'email' | 'otp' | 'newPassword';

const OTP_DURATION_SECONDS = 15 * 60;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const stars = '*'.repeat(Math.max(local.length - 1, 1));
  return `${local[0]}${stars}@${domain}`;
}

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function Login() {
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp || payload.exp * 1000 > Date.now()) {
          navigate('/dashboard');
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const loginMutation = useLogin();
  const requestCodeMutation = useRequestCode();
  const resetPasswordMutation = useResetPassword();

  // Recovery flow
  const [recoverStep, setRecoverStep] = useState<RecoverStep>('email');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS);
  const [expired, setExpired] = useState(false);

  const [newPass, setNewPass] = useState('');
  const [repeatPass, setRepeatPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showRepeatPass, setShowRepeatPass] = useState(false);

  // Countdown
  useEffect(() => {
    if (mode !== 'recover' || recoverStep !== 'otp') return;
    if (expired) return;
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    const t = window.setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          setExpired(true);
          window.clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [mode, recoverStep, expired, secondsLeft]);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMutation.isPending) return;

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
      toast.success('Autenticación exitosa', {
        icon: <CheckCircle2 className="w-4 h-4 text-success" />,
      });
      window.setTimeout(() => navigate('/dashboard'), 600);
    } catch (error: any) {
      triggerShake();
      const msg = error.response?.data?.message || 'Correo o contraseña incorrectos';
      toast.error(msg);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestCodeMutation.isPending) return;
    const trimmed = recoverEmail.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      triggerShake();
      toast.error('Correo inválido');
      return;
    }
    try {
      await requestCodeMutation.mutateAsync({ email: trimmed });
      setMaskedEmail(maskEmail(trimmed));
      setOtpValue('');
      setSecondsLeft(OTP_DURATION_SECONDS);
      setExpired(false);
      setRecoverStep('otp');
      toast.success('Código de recuperación enviado');
    } catch (error: any) {
      triggerShake();
      toast.error(error.response?.data?.message || 'Error al solicitar el código');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (expired) {
      toast.error('Validez Expirada');
      return;
    }
    if (otpValue.length < 6) return;
    toast.success('Código verificado');
    setRecoverStep('newPassword');
    setNewPass('');
    setRepeatPass('');
    return;
  };

  const handleResendCode = async () => {
    if (requestCodeMutation.isPending) return;
    try {
      await requestCodeMutation.mutateAsync({ email: recoverEmail.trim() });
      setOtpValue('');
      setSecondsLeft(OTP_DURATION_SECONDS);
      setExpired(false);
      toast.success('Código de recuperación enviado');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al reenviar el código');
    }
  };

  const handleConfirmNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordMutation.isPending) return;
    if (newPass.length < 6) {
      triggerShake();
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPass !== repeatPass) {
      triggerShake();
      toast.error('Las contraseñas no coinciden');
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({
        email: recoverEmail.trim(),
        code: otpValue,
        password: newPass,
        confirmPassword: repeatPass,
      });
      
      toast.success('Contraseña Actualizada Correctamente', {
        icon: <CheckCircle2 className="w-4 h-4 text-success" />,
      });
      window.setTimeout(() => {
        setMode('login');
        setRecoverStep('email');
        setRecoverEmail('');
        setMaskedEmail('');
        setOtpValue('');
        setNewPass('');
        setRepeatPass('');
        setSecondsLeft(OTP_DURATION_SECONDS);
        setExpired(false);
      }, 700);
    } catch (error: any) {
      triggerShake();
      toast.error(error.response?.data?.message || 'Error al actualizar contraseña');
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setShake(false);
    if (next === 'recover') {
      setRecoverStep('email');
      setRecoverEmail('');
      setMaskedEmail('');
      setOtpValue('');
      setSecondsLeft(OTP_DURATION_SECONDS);
      setExpired(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Decorative medical background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.06),transparent_50%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.05),transparent_50%)]" />
        <Stethoscope className="absolute -top-6 -left-6 w-48 h-48 text-primary opacity-[0.06] rotate-12 animate-pulse-soft" />
        <HeartPulse className="absolute top-10 right-10 w-32 h-32 text-accent opacity-[0.06] -rotate-6 animate-pulse-soft" />
        <Pill className="absolute bottom-12 left-16 w-28 h-28 text-primary opacity-[0.06] rotate-45 animate-pulse-soft" />
        <Cross className="absolute bottom-20 right-20 w-36 h-36 text-accent opacity-[0.06] -rotate-12 animate-pulse-soft" />
        <Activity className="absolute top-1/2 left-1/4 w-24 h-24 text-primary opacity-[0.04] animate-pulse-soft" />
        <Syringe className="absolute bottom-1/3 right-1/3 w-28 h-28 text-accent opacity-[0.04] rotate-12 animate-pulse-soft" />
      </div>

      {/* Card */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md bg-card/95 backdrop-blur-sm border border-border/60 rounded-2xl shadow-xl p-8 animate-fade-in',
          shake && 'animate-shake',
        )}
      >
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md mb-3">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground">MediCitas</h1>
          <p className="text-xs text-muted-foreground">Sistema de Gestión Médica</p>
        </div>

        <div key={`${mode}-${recoverStep}`} className="animate-fade-in">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Iniciar Sesión</h2>
                <p className="text-sm text-muted-foreground">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-foreground">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {loginMutation.isPending ? 'Verificando...' : 'Iniciar Sesión'}
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => switchMode('recover')}
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  ¿Olvidaste la Contraseña?
                </button>
              </div>
            </form>
          )}

          {mode === 'recover' && recoverStep === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recuperar Contraseña</h2>
                <p className="text-sm text-muted-foreground">
                  Ingresa tu correo para recibir un código de recuperación
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recover-email" className="text-foreground">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recover-email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={recoverEmail}
                    onChange={e => setRecoverEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={requestCodeMutation.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {requestCodeMutation.isPending ? 'Enviando...' : 'Enviar código de recuperación'}
              </Button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </button>
            </form>
          )}

          {mode === 'recover' && recoverStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recuperación de Contraseña</h2>
                <p className="text-sm text-muted-foreground">
                  Acabamos de enviar su código de recuperación por correo electrónico a{' '}
                  <span className="font-medium text-foreground">{maskedEmail}</span>
                </p>
              </div>

              <div className="flex items-center justify-center">
                {expired ? (
                  <span className="text-sm font-semibold text-destructive">Validez Expirada</span>
                ) : (
                  <span className="text-base font-semibold text-primary tabular-nums">
                    {formatMMSS(secondsLeft)}
                  </span>
                )}
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={expired}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {expired ? (
                <Button
                  type="button"
                  onClick={handleResendCode}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                >
                  Reenviar código
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={otpValue.length < 6}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Verificar
                </Button>
              )}

              <button
                type="button"
                onClick={() => setRecoverStep('email')}
                className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Cambiar correo
              </button>
            </form>
          )}

          {mode === 'recover' && recoverStep === 'newPassword' && (
            <form onSubmit={handleConfirmNewPassword} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Nueva Contraseña</h2>
                <p className="text-sm text-muted-foreground">
                  Ingresa tu nueva contraseña
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-pass" className="text-foreground">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-pass"
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-pass" className="text-foreground">Repetir Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="repeat-pass"
                    type={showRepeatPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={repeatPass}
                    onChange={e => setRepeatPass(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPass(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
                  >
                    {showRepeatPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {resetPasswordMutation.isPending ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
