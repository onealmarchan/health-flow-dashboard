import { useState } from 'react';
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
  MailCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'recover';

const VALID_EMAIL = 'admin@ejemplo.com';
const VALID_PASSWORD = 'admin123';

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerShake = () => {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (email.trim().toLowerCase() === VALID_EMAIL && password === VALID_PASSWORD) {
      toast.success('Autenticación exitosa', {
        icon: <CheckCircle2 className="w-4 h-4 text-success" />,
      });
      window.setTimeout(() => {
        navigate('/');
      }, 600);
      return;
    }

    triggerShake();
    toast.error('Correo o contraseña incorrectos', {
      style: {
        background: 'hsl(var(--destructive) / 0.12)',
        borderColor: 'hsl(var(--destructive) / 0.4)',
        color: 'hsl(var(--destructive))',
      },
    });
    setLoading(false);
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = recoverEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      triggerShake();
      toast.error('Correo inválido');
      return;
    }
    toast.success('Si el correo existe, recibirás un enlace de recuperación', {
      icon: <MailCheck className="w-4 h-4 text-primary" />,
    });
    setRecoverEmail('');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setShake(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Decorative medical background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Stethoscope className="absolute -top-6 -left-6 w-48 h-48 text-primary opacity-10 rotate-12 animate-pulse-soft" />
        <HeartPulse className="absolute top-10 right-10 w-32 h-32 text-accent opacity-10 -rotate-6 animate-pulse-soft" />
        <Pill className="absolute bottom-12 left-16 w-28 h-28 text-primary opacity-10 rotate-45 animate-pulse-soft" />
        <Cross className="absolute bottom-20 right-20 w-36 h-36 text-accent opacity-10 -rotate-12 animate-pulse-soft" />
        <Activity className="absolute top-1/2 left-1/4 w-24 h-24 text-primary opacity-[0.07] animate-pulse-soft" />
        <Syringe className="absolute bottom-1/3 right-1/3 w-28 h-28 text-accent opacity-[0.07] rotate-12 animate-pulse-soft" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/0 via-background/60 to-background" />
      </div>

      {/* Card */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8 animate-fade-in',
          shake && 'animate-shake',
        )}
      >
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-md mb-3">
            <Activity className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">MediCitas</h1>
          <p className="text-xs text-muted-foreground">Sistema de Gestión Médica</p>
        </div>

        <div key={mode} className="animate-fade-in">
          {mode === 'login' ? (
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
                    <span className="block transition-transform duration-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {loading ? 'Verificando...' : 'Iniciar Sesión'}
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
          ) : (
            <form onSubmit={handleRecover} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recuperar Contraseña</h2>
                <p className="text-sm text-muted-foreground">
                  Te enviaremos un enlace para restablecer tu contraseña
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
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                Enviar enlace de recuperación
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
        </div>
      </div>
    </div>
  );
}
