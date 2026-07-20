import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPIExportPopover } from './KPIExportPopover';

export interface KPIView {
  label: string;
  /** Stable id used for filtering by preset and export filename lookup. */
  id?: string;
  component: React.ReactNode;
}

interface KPIWrapperProps {
  views: KPIView[];
  /** When provided, only views whose id is in this array are shown. */
  selectedKpiIds?: string[];
  className?: string;
}

export function KPIWrapper({ views, selectedKpiIds, className }: KPIWrapperProps) {
  const filtered = selectedKpiIds && selectedKpiIds.length > 0
    ? views.filter(v => v.id && selectedKpiIds.includes(v.id))
    : views;

  const safeViews = filtered.length > 0 ? filtered : views;

  const [currentView, setCurrentView] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const clampedView = Math.min(currentView, safeViews.length - 1);
  const active = safeViews[clampedView];

  useEffect(() => {
    setCurrentView(0);
  }, [selectedKpiIds?.join(',')]);

  const isFirst = clampedView === 0;
  const isLast = clampedView === safeViews.length - 1;

  return (
    <div ref={ref} className={cn("chart-container animate-fade-in relative", className)}>
      {safeViews.length > 1 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          {!isFirst && (
            <button
              onClick={() => setCurrentView(v => Math.max(0, v - 1))}
              aria-label="Anterior"
              className="p-1.5 rounded-md border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              title="KPI anterior"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => setCurrentView(v => Math.min(safeViews.length - 1, v + 1))}
              aria-label="Siguiente"
              className="p-1.5 rounded-md border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              title="KPI siguiente"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {isLast && safeViews.length > 1 && (
            <button
              onClick={() => setCurrentView(0)}
              aria-label="Reiniciar"
              className="p-1.5 rounded-md border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              title="Reiniciar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
          <KPIExportPopover
            kpiId={active.id ?? active.label}
            kpiLabel={active.label}
            targetRef={ref}
          />
        </div>
      )}
      {safeViews.length === 1 && (
        <div className="absolute top-3 right-3 z-10">
          <KPIExportPopover
            kpiId={active.id ?? active.label}
            kpiLabel={active.label}
            targetRef={ref}
          />
        </div>
      )}
      {safeViews.length > 1 && (
        <div className="absolute top-3.5 left-3 flex gap-1.5">
          {safeViews.map((_, idx) => (
            <div key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                idx === clampedView ? "bg-primary scale-110" : "bg-muted-foreground/25"
              )}
            />
          ))}
        </div>
      )}
      {active.component}
    </div>
  );
}
