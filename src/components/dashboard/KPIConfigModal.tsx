import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPI_CATALOG, KPI_TYPE_LABELS, KPIType } from './kpiCatalog';
import { Activity, BarChart3, Map, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPIConfigValue {
  types: 'random' | 'epidemiologicos' | KPIType[];
  count: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  value: KPIConfigValue;
  onApply: (v: KPIConfigValue) => void;
}

const ALL_TYPES: KPIType[] = ['mensual', 'trimestral', 'bimensual', 'semestral'];

const PRESETS = [
  {
    id: 'epidemiologicos' as const,
    label: 'Epidemiológicos',
    description: 'Distribución etaria, enfermedades prevalentes y densidad comunitaria.',
    icon: Activity,
    kpiIds: ['treemap-etario', 'distribucion-enfermedades', 'densidad-comunidad'],
  },
  {
    id: 'carga-trabajo' as const,
    label: 'Carga de trabajo',
    description: 'Especialidad, retención de pacientes y priorización.',
    icon: Stethoscope,
    kpiIds: ['treemap-especialidad', 'retencion-especialidad', 'matriz-prioridades'],
  },
  {
    id: 'seguimiento' as const,
    label: 'Seguimiento',
    description: 'Detección temprana, reconsultas críticos y vulnerabilidad.',
    icon: BarChart3,
    kpiIds: ['deteccion-temprana', 'reconsultas-criticos', 'vulnerabilidad-com'],
  },
  {
    id: 'geografia' as const,
    label: 'Geográficos',
    description: 'Interconsultas, densidad epidemiológica y concentración geográfica.',
    icon: Map,
    kpiIds: ['interconsulta', 'densidad-comunidad', 'concentracion-geo'],
  },
];

export function KPIConfigModal({ open, onOpenChange, value, onApply }: Props) {
  const [mode, setMode] = useState<'random' | 'preset' | 'custom'>(() => {
    if (value.types === 'random') return 'random';
    if (value.types === 'epidemiologicos') return 'preset';
    return 'custom';
  });
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    if (value.types === 'epidemiologicos') return 'epidemiologicos';
    return 'epidemiologicos';
  });
  const [types, setTypes] = useState<Set<KPIType>>(new Set(value.types === 'random' || value.types === 'epidemiologicos' ? [] : value.types));
  const [count, setCount] = useState(value.count);

  useEffect(() => {
    if (open) {
      if (value.types === 'random') {
        setMode('random');
        setTypes(new Set());
      } else if (value.types === 'epidemiologicos') {
        setMode('preset');
        setSelectedPreset('epidemiologicos');
        setTypes(new Set());
      } else {
        setMode('custom');
        setTypes(new Set(value.types));
      }
      setCount(value.count);
    }
  }, [open, value]);

  const eligibleCount = useMemo(() => {
    if (mode === 'random') return KPI_CATALOG.length;
    if (mode === 'preset') {
      const preset = PRESETS.find(p => p.id === selectedPreset);
      return preset ? preset.kpiIds.length : KPI_CATALOG.length;
    }
    const selected = Array.from(types);
    if (selected.length === 0) return 0;
    return KPI_CATALOG.filter(k => selected.includes(k.type)).length;
  }, [mode, selectedPreset, types]);

  const maxCount = Math.max(1, eligibleCount);
  const effectiveCount = Math.min(count, maxCount);

  const toggle = (t: KPIType) => {
    setTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
    setMode('custom');
  };

  const apply = () => {
    let typesValue: KPIConfigValue['types'];
    if (mode === 'random') {
      typesValue = 'random';
    } else if (mode === 'preset') {
      typesValue = 'epidemiologicos';
    } else {
      typesValue = types.size === 0 ? 'random' : Array.from(types);
    }
    onApply({ types: typesValue, count: effectiveCount });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Configurar KPIs</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Elige un conjunto predeterminado o personaliza por cadencia y cantidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Preset section */}
          <section className="space-y-2.5">
            <Label className="text-foreground font-semibold text-sm">Conjuntos predeterminados</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESETS.map(preset => {
                const Icon = preset.icon;
                const isSelected = mode === 'preset' && selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => { setMode('preset'); setSelectedPreset(preset.id); }}
                    className={cn(
                      'flex items-start gap-2.5 p-2.5 rounded-lg border text-left text-sm transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded-md shrink-0 mt-0.5',
                      isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn('font-medium', isSelected ? 'text-primary' : 'text-foreground')}>{preset.label}</p>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5">{preset.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{preset.kpiIds.length} KPIs · {preset.kpiIds.length} slots</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Random option */}
          <section className="space-y-2">
            <Label className="text-foreground font-semibold text-sm">O personalización</Label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={mode === 'random'}
                onCheckedChange={(v) => { if (v) { setMode('random'); setTypes(new Set()); } }}
              />
              <span className="font-medium">Aleatorio</span>
              <span className="text-xs text-muted-foreground">(mezcla de todos)</span>
            </label>
          </section>

          {/* Custom cadence */}
          <section className="space-y-2">
            <Label className="text-foreground font-semibold text-sm">Por cadencia de reporte</Label>
            {ALL_TYPES.map(t => (
              <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={mode === 'custom' && types.has(t)}
                  onCheckedChange={() => toggle(t)}
                />
                <span>{KPI_TYPE_LABELS[t]}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {KPI_CATALOG.filter(k => k.type === t).length} KPIs
                </span>
              </label>
            ))}
          </section>

          {/* Count */}
          <section className="space-y-2">
            <Label className="text-foreground font-semibold text-sm">Cantidad de KPIs visibles</Label>
            <Select value={String(effectiveCount)} onValueChange={(v) => setCount(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {Array.from({ length: maxCount }, (_, i) => i + 1).map(n => (
                  <SelectItem key={n} value={String(n)}>{n} KPI{n > 1 ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {mode === 'preset'
                ? `${eligibleCount} disponibles en el conjunto seleccionado.`
                : `Máximo dinámico: ${eligibleCount} (según los tipos seleccionados).`}
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
