import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIExportPopover } from './KPIExportPopover';

export interface KPIView {
  label: string;
  /** Stable id used for export filename and summary text lookup. */
  id?: string;
  component: React.ReactNode;
}

interface KPIWrapperProps {
  views: KPIView[];
  className?: string;
}

export function KPIWrapper({ views, className }: KPIWrapperProps) {
  const [currentView, setCurrentView] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isFirst = currentView === 0;
  const isLast = currentView === views.length - 1;
  const active = views[currentView];

  return (
    <div ref={ref} className={cn("chart-container animate-fade-in relative", className)}>
      {views.length > 1 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          {!isFirst && (
            <button
              onClick={() => setCurrentView(v => v - 1)}
              aria-label="Anterior"
              className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="KPI anterior"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => setCurrentView(v => v + 1)}
              aria-label="Siguiente"
              className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="KPI siguiente"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {isLast && views.length > 1 && (
            <button
              onClick={() => setCurrentView(0)}
              aria-label="Reiniciar"
              className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="w-px h-5 bg-border mx-0.5" aria-hidden="true" />
          <KPIExportPopover
            kpiId={active.id ?? active.label}
            kpiLabel={active.label}
            targetRef={ref}
          />
        </div>
      )}
      {views.length === 1 && (
        <div className="absolute top-3 right-3 z-10">
          <KPIExportPopover
            kpiId={active.id ?? active.label}
            kpiLabel={active.label}
            targetRef={ref}
          />
        </div>
      )}
      {views.length > 1 && (
        <div className="absolute top-3 left-3 flex gap-1">
          {views.map((_, idx) => (
            <div key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                idx === currentView ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
      {active.component}
    </div>
  );
}
