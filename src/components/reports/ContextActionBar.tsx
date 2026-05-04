import { Button } from '@/components/ui/button';
import { Download, X, Sliders } from 'lucide-react';

interface Props {
  count: number;
  itemSingular: string;
  itemPlural: string;
  onClear: () => void;
  onAdvanced: () => void;
  onExport: () => void;
}

export function ContextActionBar({ count, itemSingular, itemPlural, onClear, onAdvanced, onExport }: Props) {
  if (count === 0) return null;
  const word = count === 1 ? itemSingular : itemPlural;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 mb-3 rounded-md border border-primary/40 bg-primary/10 animate-fade-in">
      <span className="text-sm font-medium text-foreground">
        {count} {word} seleccionad{count === 1 ? 'o' : 'os'}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onClear} className="text-primary hover:text-primary">
          <X className="w-3.5 h-3.5 mr-1" />
          Limpiar
        </Button>
        <Button size="sm" variant="outline" onClick={onAdvanced}>
          <Sliders className="w-3.5 h-3.5 mr-1" />
          Avanzado
        </Button>
        <Button size="sm" onClick={onExport} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="w-3.5 h-3.5 mr-1" />
          Exportar
        </Button>
      </div>
    </div>
  );
}
