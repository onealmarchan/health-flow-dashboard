import { Button } from '@/components/ui/button';
import { X, Sliders } from 'lucide-react';

interface Props {
  count: number;
  itemSingular: string;
  itemPlural: string;
  onClear: () => void;
  onAdvanced?: () => void;
  showAdvanced?: boolean;
}

export function ContextActionBar({ count, itemSingular, itemPlural, onClear, onAdvanced, showAdvanced = false }: Props) {
  if (count === 0) return null;
  const word = count === 1 ? itemSingular : itemPlural;
  const suffix = count === 1
    ? (word.endsWith('a') ? 'a' : 'o')
    : (word.endsWith('as') ? 'as' : 'os');
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 px-4 py-2 mb-3 rounded-md border border-primary/40 bg-primary/10 transition-all duration-200 animate-in fade-in slide-in-from-top-1"
    >
      <span className="text-sm font-medium text-foreground">
        {count} {word} seleccionad{suffix}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onClear} className="text-primary hover:text-primary">
          <X className="w-3.5 h-3.5 mr-1" />
          Limpiar
        </Button>
        {showAdvanced && onAdvanced && (
          <Button size="sm" variant="outline" onClick={onAdvanced}>
            <Sliders className="w-3.5 h-3.5 mr-1" />
            Avanzado
          </Button>
        )}
      </div>
    </div>
  );
}
