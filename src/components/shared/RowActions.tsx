import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface RowAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'success';
  animateOnClick?: boolean;
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={a.onClick}
                  className={cn(
                    'h-8 w-8 transition-transform active:scale-90',
                    a.animateOnClick && 'hover:rotate-6',
                    a.variant === 'destructive' && 'text-destructive hover:text-destructive hover:bg-destructive/10',
                    a.variant === 'success' && 'text-success hover:text-success hover:bg-success/10',
                  )}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{a.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
