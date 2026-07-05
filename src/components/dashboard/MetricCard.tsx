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
  primary: 'bg-primary/10 border-primary/20',
  success: 'bg-success/10 border-success/20',
  warning: 'bg-warning/10 border-warning/20',
  accent: 'bg-accent/10 border-accent/20',
};

const iconVariantStyles: Record<NonNullable<MetricCardProps['variant']>, string> = {
  default: 'bg-secondary text-foreground',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  accent: 'bg-accent text-accent-foreground',
};

const semaforoIconBg: Record<SemaforoColor, string> = {
  verde: 'bg-success text-success-foreground',
  ambar: 'bg-warning text-warning-foreground',
  rojo:  'bg-destructive text-destructive-foreground',
};

export function MetricCard({
  title, value, subtitle, icon: Icon, trend, semaforo, variant = 'default',
}: MetricCardProps) {
  const sem = semaforo ? semaforoClasses[semaforo] : null;
  const isPositive = trend?.isPositive ?? (trend ? trend.value >= 0 : true);

  return (
    <div className={cn(
      'metric-card animate-fade-in border',
      sem ? cn(sem.bg, sem.border) : variantStyles[variant],
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className={cn('text-3xl font-bold', sem ? sem.text : 'text-foreground')}>{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 text-sm font-medium',
              isPositive ? 'text-success' : 'text-destructive',
            )}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
              <span className="text-muted-foreground">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl shrink-0', semaforo ? semaforoIconBg[semaforo] : iconVariantStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
