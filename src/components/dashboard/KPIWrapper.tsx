import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIView {
  label: string;
  component: React.ReactNode;
}

interface KPIWrapperProps {
  views: KPIView[];
  className?: string;
}

export function KPIWrapper({ views, className }: KPIWrapperProps) {
  const [currentView, setCurrentView] = useState(0);

  const nextView = () => {
    setCurrentView((prev) => (prev + 1) % views.length);
  };

  return (
    <div className={cn("chart-container animate-fade-in relative", className)}>
      {/* View switch button - top right corner */}
      {views.length > 1 && (
        <button
          onClick={nextView}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors group"
          title={`Vista: ${views[currentView].label} (click para cambiar)`}
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      )}

      {/* View label indicator */}
      {views.length > 1 && (
        <div className="absolute top-3 left-3 flex gap-1">
          {views.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                idx === currentView ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}

      {views[currentView].component}
    </div>
  );
}
