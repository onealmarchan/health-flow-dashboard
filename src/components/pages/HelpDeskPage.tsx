import { LifeBuoy } from 'lucide-react';

export function HelpDeskPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-primary" />
          Help Desk
        </h1>
        <p className="text-muted-foreground">Sección en construcción</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-16 text-center text-muted-foreground">
        Muy pronto podrás abrir tickets de soporte y contactar al equipo desde aquí.
      </div>
    </div>
  );
}
