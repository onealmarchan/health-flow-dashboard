import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccesoDenegado() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-lg">
        {/* Animated medical illustration */}
        <div className="relative w-56 h-56 mb-8">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Pulsing ring */}
            <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" opacity="0.4">
              <animate attributeName="r" values="70;90;70" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
            </circle>
            {/* Medical cross shield */}
            <path d="M100 25 L160 55 V115 C160 145 130 170 100 180 C70 170 40 145 40 115 V55 Z"
              fill="hsl(var(--destructive) / 0.15)" stroke="hsl(var(--destructive))" strokeWidth="3" />
            {/* Cross */}
            <rect x="88" y="70" width="24" height="70" rx="4" fill="hsl(var(--destructive))" />
            <rect x="65" y="93" width="70" height="24" rx="4" fill="hsl(var(--destructive))" />
            {/* Heart-beat line across the shield */}
            <path d="M45 155 L75 155 L82 140 L90 175 L100 130 L110 175 L118 155 L155 155"
              fill="none" stroke="hsl(var(--destructive))" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
              <animate attributeName="stroke-dasharray" values="0 300;300 0" dur="1.6s" repeatCount="indefinite" />
            </path>
          </svg>
          <div className="absolute -top-2 -right-2">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-3">
          ACCESO DENEGADO
        </h1>
        <p className="text-muted-foreground mb-8">
          No cuentas con los permisos clínicos necesarios para acceder a este recurso.
          Contacta al administrador del sistema si necesitas autorización.
        </p>
        <div className="flex gap-3">
          <Button asChild variant="outline"><Link to="/login">Iniciar sesión</Link></Button>
          <Button asChild><Link to="/">Volver al inicio</Link></Button>
        </div>
      </div>
    </div>
  );
}
