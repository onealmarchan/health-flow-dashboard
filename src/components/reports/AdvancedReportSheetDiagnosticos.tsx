import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ReportableModule, ExportFormat, SortMode } from './types';
import { exportReport, generarReporteGeneral } from './exporters';
import { AdvancedSheetShell, ReportTypeRadio, AdvancedReportType } from './AdvancedSheetShell';

type DiagReportType = 'general' | 'total' | 'menor' | 'mayor' | 'promedio';

const types: AdvancedReportType<DiagReportType>[] = [
  { id: 'general', label: 'Reporte General', description: 'PDF completo con portada, resumen ejecutivo, métricas y tabla de datos detallada.' },
  { id: 'total', label: 'Total de diagnósticos', description: 'Filtrados por enfermedad específica.', requiresExtra: true, extraLabel: 'Enfermedad' },
  { id: 'menor', label: 'Volumen menor de diagnósticos', description: 'Enfermedad con menos diagnósticos.' },
  { id: 'mayor', label: 'Volumen mayor de diagnósticos', description: 'Enfermedad con más diagnósticos.' },
  { id: 'promedio', label: 'Promedio de diagnósticos', description: 'Promedio por especialidad médica.' },
];

const chartOptions = [
  { id: 'enfermedad', label: 'Distribución por enfermedad' },
  { id: 'criticos', label: 'Proporción de casos críticos' },
  { id: 'evolucion', label: 'Evolución temporal de diagnósticos' },
];

interface Props<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ReportableModule<T>;
  selectedIds: Set<string | number>;
  scope: 'selection' | 'all';
}

export function AdvancedReportSheetDiagnosticos<T>({ open, onOpenChange, module, selectedIds, scope }: Props<T>) {
  const [fieldKeys, setFieldKeys] = useState<Set<string>>(new Set(module.fields.map(f => f.key)));
  const [type, setType] = useState<DiagReportType | ''>('');
  const [enfermedad, setEnfermedad] = useState<string>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [enableSort, setEnableSort] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('date-desc');
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [includeMetrics, setIncludeMetrics] = useState(false);
  const [chart, setChart] = useState<string>('enfermedad');

  useEffect(() => {
    if (open) {
      setFieldKeys(new Set(module.fields.map(f => f.key)));
      setType(''); setEnfermedad('');
      setFrom(''); setTo('');
      setEnableSort(false); setSortMode('date-desc');
      setFormat('xlsx'); setIncludeMetrics(false); setChart('enfermedad');
    }
  }, [open, module]);

  // Enfermedades unique list from rows that have an "enfermedad" field
  const enfermedades = useMemo(() => {
    const enfermedadField = module.fields.find(f => /enfermedad/i.test(f.label));
    if (!enfermedadField) return [];
    return Array.from(new Set(module.rows.map(r => String(enfermedadField.accessor(r))))).filter(Boolean);
  }, [module]);

  const baseRows = useMemo(() => {
    if (scope === 'selection') return module.rows.filter(r => selectedIds.has(module.getId(r)));
    return module.rows;
  }, [scope, module, selectedIds]);

  const filteredRows = useMemo(() => {
    let rows = baseRows;
    if (module.dateField && from && to) {
      rows = rows.filter(r => {
        const d = module.dateField!.accessor(r);
        return d >= from && d <= to;
      });
    }
    if (type === 'total' && enfermedad) {
      const enfermedadField = module.fields.find(f => /enfermedad/i.test(f.label));
      if (enfermedadField) {
        rows = rows.filter(r => String(enfermedadField.accessor(r)) === enfermedad);
      }
    }
    if (enableSort) {
      const nameField = module.fields.find(f => /paciente|nombre/i.test(f.label));
      if (sortMode === 'alpha-asc' && nameField)
        rows = [...rows].sort((a, b) => String(nameField.accessor(a)).localeCompare(String(nameField.accessor(b))));
      else if (sortMode === 'alpha-desc' && nameField)
        rows = [...rows].sort((a, b) => String(nameField.accessor(b)).localeCompare(String(nameField.accessor(a))));
      else if (sortMode === 'date-asc' && module.dateField)
        rows = [...rows].sort((a, b) => module.dateField!.accessor(a).localeCompare(module.dateField!.accessor(b)));
      else if (sortMode === 'date-desc' && module.dateField)
        rows = [...rows].sort((a, b) => module.dateField!.accessor(b).localeCompare(module.dateField!.accessor(a)));
    }
    return rows;
  }, [baseRows, module, from, to, type, enfermedad, enableSort, sortMode]);

  const activeFields = useMemo(
    () => module.fields.filter(f => fieldKeys.has(f.key)),
    [module.fields, fieldKeys]
  );

  const scopeText = scope === 'selection'
    ? `${selectedIds.size} ${selectedIds.size === 1 ? module.itemSingular : module.itemPlural} seleccionad${selectedIds.size === 1 ? 'o' : 'os'}`
    : `Tabla completa (${module.rows.length} registros)`;

  const dateRangeInvalid = from && to && from > to;
  const dateRangeMissing = !from || !to;
  const enfermedadMissing = type === 'total' && !enfermedad;
  const isGeneral = type === 'general';

  let validationMessage: string | null = null;
  if (!type) validationMessage = 'Debes seleccionar un tipo de reporte antes de continuar.';
  else if (!isGeneral && enfermedadMissing) validationMessage = 'Selecciona una enfermedad para el reporte total.';
  else if (!isGeneral && dateRangeMissing) validationMessage = 'El rango de fechas es obligatorio para este tipo de reporte.';
  else if (!isGeneral && dateRangeInvalid) validationMessage = 'La fecha final debe ser posterior a la inicial.';
  else if (activeFields.length === 0) validationMessage = 'Selecciona al menos un campo para exportar.';
  else if (filteredRows.length === 0) validationMessage = 'Los filtros aplicados no arrojan registros. Ajusta las opciones e intenta nuevamente.';

  const canGenerate = !validationMessage;

  const previewLines = [
    { label: 'Alcance', value: scopeText },
    { label: 'Campos', value: `${activeFields.length} de ${module.fields.length}` },
    { label: 'Registros', value: String(filteredRows.length) },
    { label: 'Tipo', value: type ? types.find(t => t.id === type)!.label : '— no seleccionado —' },
    ...(type === 'total' && enfermedad ? [{ label: 'Enfermedad', value: enfermedad }] : []),
    { label: 'Formato', value: isGeneral ? 'PDF (completo con portada)' : format.toUpperCase() },
    ...(!isGeneral && includeMetrics ? [{ label: 'Métricas', value: chartOptions.find(c => c.id === chart)!.label }] : []),
  ];

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (isGeneral) {
      const metrics = module.metrics ? module.metrics(filteredRows) : {
        'Total registros': filteredRows.length,
      };
      generarReporteGeneral(
        `Reporte General — ${module.name}`,
        scopeText,
        filteredRows,
        activeFields,
        metrics,
        `Reporte_General_${module.name.replace(/\s+/g, '_')}`
      );
    } else {
      await exportReport(format, module, filteredRows, activeFields, {
        scope: scopeText,
        includeMetrics,
      });
    }
    toast.success('Reporte generado correctamente');
    onOpenChange(false);
  };

  const toggleField = (key: string) => {
    setFieldKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <AdvancedSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Reporte avanzado — Diagnósticos"
      scopeText={scopeText}
      scope={scope}
      fieldOptions={module.fields.map(f => ({ key: f.key, label: f.label }))}
      selectedFields={fieldKeys}
      onToggleField={toggleField}
      from={from} to={to}
      onFromChange={setFrom} onToChange={setTo}
      enableSort={enableSort} onEnableSortChange={setEnableSort}
      sortMode={sortMode} onSortModeChange={setSortMode}
      format={format} onFormatChange={setFormat}
      includeMetrics={includeMetrics} onIncludeMetricsChange={setIncludeMetrics}
      hideFormatAndMetrics={isGeneral}
      metricsExtra={
        !isGeneral ? (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tipo de gráfico</Label>
            <Select value={chart} onValueChange={setChart}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {chartOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : undefined
      }
      previewLines={previewLines}
      validationMessage={validationMessage}
      canGenerate={canGenerate}
      onGenerate={handleGenerate}
    >
      <ReportTypeRadio<DiagReportType> value={type} onChange={(v) => setType(v)} options={types} />
      {type === 'total' && (
        <section className="space-y-2">
          <Label className="text-foreground font-semibold">Enfermedad <span className="text-destructive">*</span></Label>
          <Select value={enfermedad} onValueChange={setEnfermedad}>
            <SelectTrigger><SelectValue placeholder="Seleccionar enfermedad" /></SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {enfermedades.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </section>
      )}
    </AdvancedSheetShell>
  );
}
