import { HelpCircle } from 'lucide-react';

export function FAQPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          Preguntas Frecuentes
        </h1>
        <p className="text-muted-foreground">Sección en construcción</p>
      </div>
      <div className="bg-card border border-border rounded-lg p-16 text-center text-muted-foreground">
        Próximamente encontrarás aquí respuestas a las preguntas más comunes del sistema.
      </div>
    </div>
  );
}
