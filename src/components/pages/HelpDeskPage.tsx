import { Download, LifeBuoy, Mail, Phone, User } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  email: string;
  phone: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "O'Neal Josue Marchan Márquez",
    role: 'Coordinador / Desarrollador',
    email: 'Onealmarchan@gmail.com',
    phone: '04129666406',
  },
  {
    name: 'Manuel Delfín Salazar Martinez',
    role: 'Desarrollador',
    email: 'Manudex390@gmail.com',
    phone: '04248548841',
  },
  {
    name: 'Guillermo Rojas',
    role: 'Desarrollador',
    email: 'guillermo.rojas.prog@gmail.com',
    phone: '04147745286',
  },
];

const handleDownloadManual = () => {
  const link = document.createElement('a');
  link.href = '/manual-usuario.pdf';
  link.download = 'Manual_Usuario_MediCitas.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function HelpDeskPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-primary" />
          Help Desk
        </h1>
        <p className="text-muted-foreground">
          ¿Necesitas ayuda? Contacta directamente al equipo de soporte de MediCitas.
        </p>
      </div>

      {/* Team contact cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-5 space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{member.name}</h3>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </div>

            <div className="space-y-2">
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
              <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{member.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Common issues */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h2 className="font-semibold text-foreground">Problemas comunes</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong className="text-foreground">No puedo iniciar sesión:</strong> Verifica que tu correo y contraseña sean correctos. Si olvidaste tu contraseña, usa la opción de recuperación.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong className="text-foreground">El sistema va lento:</strong> Intenta limpiar la caché del navegador o utiliza una conexión estable a internet.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong className="text-foreground">No puedo agendar una cita:</strong> Verifica que el especialista tenga jornada configurada y bloques disponibles para la fecha deseada.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong className="text-foreground">No veo todas las secciones:</strong> Tu acceso depende del rol asignado. Contacta al administrador si necesitas permisos adicionales.</span>
          </li>
        </ul>
      </div>

      {/* Download manual */}
      <div className="bg-card border border-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">Manual de Usuario</h2>
          <p className="text-sm text-muted-foreground">
            Descarga el manual completo con instrucciones para cada módulo del sistema.
          </p>
        </div>
        <button
          onClick={handleDownloadManual}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shrink-0"
        >
          <Download className="w-4 h-4" />
          Descargar Manual
        </button>
      </div>

      {/* Horario de atención */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="font-semibold text-foreground mb-2">Horario de atención</h2>
        <p className="text-sm text-muted-foreground">
          Lunes a viernes de 8:00 a.m. a 5:00 p.m. — Tiempo de respuesta estimado: 24 horas hábiles.
        </p>
      </div>
    </div>
  );
}
