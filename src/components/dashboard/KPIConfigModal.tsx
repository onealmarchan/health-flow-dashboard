import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPI_CATALOG, KPI_TYPE_LABELS, KPIType } from './kpiCatalog';

export interface KPIConfigValue {
  types: 'random' | KPIType[];
  count: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  value: KPIConfigValue;
  onApply: (v: KPIConfigValue) => void;
}

const ALL_TYPES: KPIType[] = ['mensual', 'trimestral', 'bimensual', 'semestral'];

export function KPIConfigModal({ open, onOpenChange, value, onApply }: Props) {
  const [random, setRandom] = useState(value.types === 'random');
  const [types, setTypes] = useState<Set<KPIType>>(new Set(value.types === 'random' ? [] : value.types));
  const [count, setCount] = useState(value.count);

  useEffect(() => {
    if (open) {
      setRandom(value.types === 'random');
      setTypes(new Set(value.types === 'random' ? [] : value.types));
      setCount(value.count);
    }
  }, [open, value]);

  const eligibleCount = useMemo(() => {
    if (random) return KPI_CATALOG.length;
    const selected = Array.from(types);
    if (selected.length === 0) return 0;
    return KPI_CATALOG.filter(k => selected.includes(k.type)).length;
  }, [random, types]);

  const maxCount = Math.max(1, eligibleCount);
  const effectiveCount = Math.min(count, maxCount);

  const toggle = (t: KPIType) => {
    setTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
    setRandom(false);
  };

  const apply = () => {
    onApply({
      types: random || types.size === 0 ? 'random' : Array.from(types),
      count: effectiveCount,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Configurar KPIs</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Filtra por cadencia de reporte y elige cuántos indicadores mostrar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Tipo de KPI</Label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={random} onCheckedChange={(v) => { setRandom(v === true); if (v) setTypes(new Set()); }} />
              <span className="font-medium">Aleatorio</span>
              <span className="text-xs text-muted-foreground">(mezcla de todos)</span>
            </label>
            {ALL_TYPES.map(t => (
              <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={types.has(t)} onCheckedChange={() => toggle(t)} />
                <span>{KPI_TYPE_LABELS[t]}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {KPI_CATALOG.filter(k => k.type === t).length} KPIs
                </span>
              </label>
            ))}
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Cantidad de KPIs</Label>
            <Select value={String(effectiveCount)} onValueChange={(v) => setCount(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {Array.from({ length: maxCount }, (_, i) => i + 1).map(n => (
                  <SelectItem key={n} value={String(n)}>{n} KPI{n > 1 ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Máximo dinámico: {maxCount} (según los tipos seleccionados).
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={apply} className="bg-primary text-primary-foreground hover:bg-primary/90">Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
