import { ReactNode, useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  children: ReactNode;
  onClear?: () => void;
  onApply?: () => void;
  label?: string;
}

export function FiltersButton({ children, onClear, onApply, label = 'Filtros' }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-popover border border-border z-50" align="end">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-popover-foreground">Filtros</p>
          <div className="space-y-3">{children}</div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear?.();
              }}
            >
              Limpiar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onApply?.();
                setOpen(false);
              }}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
