import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SemaforoColor } from '@/lib/kpi-semaforos';
import { semaforoClasses } from '@/lib/kpi-semaforos';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;      // signed percentage delta vs previous period
    isPositive?: boolean; // if omitted, derived from sign(value)
  };
  /** Semáforo color (verde/ambar/rojo). When set, overrides variant styling. */
  semaforo?: SemaforoColor;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
}

const variantStyles: Record<NonNullable<MetricCardProps['variant']>, string> = {
  default: 'bg-card',
  primary: 'bg-primary/5 border-primary/15',
  success: 'bg-success/5 border-success/15',
  warning: 'bg-warning/5 border-warning/15',
  accent: 'bg-accent/5 border-accent/15',
};

const iconVariantStyles: Record<NonNullable<MetricCardProps['variant']>, string> = {
  default: 'bg-secondary text-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  accent: 'bg-accent/10 text-accent',
};

const semaforoIconBg: Record<SemaforoColor, string> = {
  verde: 'bg-success/10 text-success',
  ambar: 'bg-warning/10 text-warning',
  rojo:  'bg-destructive/10 text-destructive',
};

const semaforoBorderLeft: Record<SemaforoColor, string> = {
  verde: 'border-l-success',
  ambar: 'border-l-warning',
  rojo:  'border-l-destructive',
};

export function MetricCard({
  title, value, subtitle, icon: Icon, trend, semaforo, variant = 'default',
}: MetricCardProps) {
  const sem = semaforo ? semaforoClasses[semaforo] : null;
  const isPositive = trend?.isPositive ?? (trend ? trend.value >= 0 : true);

  return (
    <div className={cn(
      'metric-card animate-fade-in border',
      sem ? cn(sem.bg, sem.border, 'border-l-[3px]', semaforoBorderLeft[semaforo!]) : variantStyles[variant],
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className={cn('text-2xl font-bold tracking-tight', sem ? sem.text : 'text-foreground')}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-success' : 'text-destructive',
            )}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
              <span className="text-muted-foreground font-normal">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg shrink-0', semaforo ? semaforoIconBg[semaforo!] : iconVariantStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
