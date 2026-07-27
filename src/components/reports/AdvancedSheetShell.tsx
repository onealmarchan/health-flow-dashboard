import { ReactNode } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { AdditionalFormat, ExportFormat, SortMode } from './types';

export interface AdvancedReportType<TId extends string> {
  id: TId;
  label: string;
  description: string;
  requiresExtra?: boolean;
  extraLabel?: string;
}

interface BaseShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  scopeText: string;
  scope: 'selection' | 'all';
  /** Children render the type-of-report and any extra controls. */
  children: ReactNode;
  /** All fields selectable. */
  fieldOptions: { key: string; label: string }[];
  selectedFields: Set<string>;
  onToggleField: (key: string) => void;
  /** Date range */
  from: string; to: string;
  onFromChange: (v: string) => void; onToChange: (v: string) => void;
  /** Sort */
  enableSort: boolean;
  onEnableSortChange: (v: boolean) => void;
  sortMode: SortMode;
  onSortModeChange: (v: SortMode) => void;
  /** Format */
  format: ExportFormat;
  onFormatChange: (v: ExportFormat) => void;
  /** Metrics */
  includeMetrics: boolean;
  onIncludeMetricsChange: (v: boolean) => void;
  metricsExtra?: ReactNode;
  /** Hide format/metrics sections (e.g. for Reporte General which is always PDF) */
  hideFormatAndMetrics?: boolean;
  /** Preview block */
  previewLines: { label: string; value: string }[];
  /** Validation */
  validationMessage: string | null;
  canGenerate: boolean;
  onGenerate: () => void;
}

const formats: { id: ExportFormat; label: string }[] = [
  { id: 'xlsx', label: 'Excel (.xlsx)' },
  { id: 'csv', label: 'CSV' },
  { id: 'pdf', label: 'PDF' },
  { id: 'docx', label: 'DOCX' },
];

const sortOptions: { id: SortMode; label: string }[] = [
  { id: 'alpha-asc', label: 'Alfabético (A → Z)' },
  { id: 'alpha-desc', label: 'Alfabético (Z → A)' },
  { id: 'date-asc', label: 'Cronológico (más antiguo primero)' },
  { id: 'date-desc', label: 'Cronológico (más reciente primero)' },
];

export function AdvancedSheetShell({
  open, onOpenChange, title, scopeText, scope, children,
  fieldOptions, selectedFields, onToggleField,
  from, to, onFromChange, onToChange,
  enableSort, onEnableSortChange, sortMode, onSortModeChange,
  format, onFormatChange,
  includeMetrics, onIncludeMetricsChange, metricsExtra,
  hideFormatAndMetrics,
  previewLines, validationMessage, canGenerate, onGenerate,
}: BaseShellProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-card border-l border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">{title}</SheetTitle>
          <SheetDescription className="text-muted-foreground">{scopeText}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 mt-5">
          <div className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium inline-block',
            scope === 'selection' ? 'bg-primary/15 text-primary' : 'bg-success/15 text-success'
          )}>
            {scopeText}
          </div>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Campos a exportar</Label>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1 border border-border rounded-md p-2">
              {fieldOptions.map(f => (
                <label key={f.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox checked={selectedFields.has(f.key)} onCheckedChange={() => onToggleField(f.key)} />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </section>

          {children}

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Rango de fechas <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Desde</Label>
                <Input type="date" value={from} onChange={e => onFromChange(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hasta</Label>
                <Input type="date" value={to} onChange={e => onToChange(e.target.value)} />
              </div>
            </div>
            {from && to && from > to && (
              <p className="text-xs text-destructive">La fecha final debe ser posterior a la inicial.</p>
            )}
          </section>

          <section className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <Checkbox checked={enableSort} onCheckedChange={v => onEnableSortChange(v === true)} />
              <span className="font-medium">Ordenar resultados</span>
            </label>
            {enableSort && (
              <Select value={sortMode} onValueChange={v => onSortModeChange(v as SortMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {sortOptions.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </section>

          {!hideFormatAndMetrics && (
            <section className="space-y-2">
              <Label className="text-foreground font-semibold">Formato de salida</Label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onFormatChange(f.id)}
                    className={cn(
                      'flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors',
                      format === f.id
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border text-foreground hover:bg-muted'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {!hideFormatAndMetrics && (
            <section className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <Checkbox checked={includeMetrics} onCheckedChange={v => onIncludeMetricsChange(v === true)} />
                <span className="font-medium">Incluir métricas y gráficos</span>
              </label>
              {includeMetrics && metricsExtra && (
                <div className="pl-6">{metricsExtra}</div>
              )}
            </section>
          )}

          <section className="rounded-md bg-muted p-3 text-xs space-y-1">
            <div className="font-semibold text-foreground mb-1">Vista previa estimada</div>
            {previewLines.map(l => (
              <div key={l.label} className="flex justify-between">
                <span className="text-muted-foreground">{l.label}:</span>
                <span className="text-foreground text-right">{l.value}</span>
              </div>
            ))}
          </section>

          {validationMessage && (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
              {validationMessage}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button onClick={onGenerate} disabled={!canGenerate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Generar reporte
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ReportTypeRadio<T extends string>({
  value, onChange, options,
}: {
  value: T | '';
  onChange: (v: T) => void;
  options: AdvancedReportType<T>[];
}) {
  return (
    <section className="space-y-2">
      <Label className="text-foreground font-semibold">Tipo de reporte <span className="text-destructive">*</span></Label>
      <div className="space-y-1.5">
        {options.map(o => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-md border text-sm transition-colors',
              value === o.id
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-foreground hover:bg-muted'
            )}
          >
            <div className="font-medium">{o.label}</div>
            <div className="text-xs text-muted-foreground">{o.description}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
