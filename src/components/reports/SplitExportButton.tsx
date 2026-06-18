import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Download } from 'lucide-react';
import type { AdditionalFormat } from './types';

interface Props {
  showAdvanced?: boolean;
  onExport: (additional: AdditionalFormat[]) => void;
  onAdvancedAll?: () => void;
}

export function SplitExportButton({ showAdvanced = false, onExport, onAdvancedAll }: Props) {
  const [open, setOpen] = useState(false);
  const [picks, setPicks] = useState<Set<AdditionalFormat>>(new Set());

  const toggle = (f: AdditionalFormat) => {
    setPicks(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) setPicks(new Set()); // reset on close
  };

  const handleExport = () => {
    onExport(Array.from(picks));
    setPicks(new Set());
  };

  return (
    <div className="inline-flex">
      <Button
        size="sm"
        variant="outline"
        onClick={handleExport}
        className="rounded-r-none border-r-0"
      >
        <Download className="w-3.5 h-3.5 mr-1.5" />
        Exportar tabla
      </Button>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="rounded-l-none px-2" aria-label="Más formatos">
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border border-border z-50 w-56">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground">Formato predeterminado</div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground opacity-90">
            <Checkbox checked disabled />
            <span>CSV</span>
            <span className="ml-auto text-[10px] text-muted-foreground">siempre</span>
          </div>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase text-muted-foreground">Formatos adicionales</div>
          {(['xlsx', 'pdf', 'docx'] as AdditionalFormat[]).map(f => (
            <label
              key={f}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground cursor-pointer hover:bg-secondary/60"
              onClick={(e) => e.preventDefault()}
            >
              <Checkbox checked={picks.has(f)} onCheckedChange={() => toggle(f)} />
              <span>{f.toUpperCase()}</span>
            </label>
          ))}
          {showAdvanced && onAdvancedAll && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onAdvancedAll}>
                Reporte avanzado…
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
