import { LifeBuoy, UserRound, IdCard, Briefcase, Phone } from 'lucide-react';

interface TeamMember {
  nombre: string;
  cedula: string;
  rol: string;
  contacto: string;
}

const team: TeamMember[] = [
  { nombre: 'Guillermo José Rojas Piñerúa',   cedula: '— por definir —', rol: '— por definir —', contacto: '— por definir —' },
  { nombre: 'Manuel Delfín Salazar Díaz',     cedula: '— por definir —', rol: '— por definir —', contacto: '— por definir —' },
  { nombre: "O'Neal Josué Marchán Márquez",   cedula: '— por definir —', rol: '— por definir —', contacto: '— por definir —' },
];

function InfoRow({ icon: Icon, label, value }: { icon: typeof IdCard; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

export function SoporteTecnicoPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-primary" />
          Soporte Técnico
        </h1>
        <p className="text-muted-foreground">Equipo responsable del sistema — contáctanos directamente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {team.map(m => (
          <div key={m.nombre} className="metric-card flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-md">
              <UserRound className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground text-base leading-tight mb-4 min-h-[3rem] flex items-center">
              {m.nombre}
            </h3>
            <div className="w-full space-y-3 text-left border-t border-border pt-4">
              <InfoRow icon={IdCard}    label="Cédula de Identidad" value={m.cedula} />
              <InfoRow icon={Briefcase} label="Rol de Equipo"       value={m.rol} />
              <InfoRow icon={Phone}     label="Contacto Directo"    value={m.contacto} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
