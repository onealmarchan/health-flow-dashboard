import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ReportableModule, ExportFormat, SortMode, CapturedChart } from './types';
import { buildReportPDF } from './exporters';
import { AdvancedSheetShell, ReportTypeRadio, AdvancedReportType } from './AdvancedSheetShell';
import { ReportChartCapture, type ChartSpec } from './ReportChartCapture';

type CitasReportType = 'general' | 'total' | 'menor' | 'mayor' | 'promedio';

const types: AdvancedReportType<CitasReportType>[] = [
  { id: 'general', label: 'Reporte General', description: 'PDF con portada, tabla, gráficas y resumen.' },
  { id: 'total', label: 'Total de citas registradas', description: 'Total dentro del rango — desglose por estado.' },
  { id: 'menor', label: 'Volumen menor de citas', description: 'Especialidad con la menor cantidad de citas.' },
  { id: 'mayor', label: 'Volumen mayor de citas', description: 'Especialidad con la mayor cantidad de citas.' },
  { id: 'promedio', label: 'Promedio de citas registradas', description: 'Promedio por especialidad.' },
];

const availableCharts: { id: string; label: string; spec: ChartSpec }[] = [
  { id: 'barras-especialidad', label: 'Barras por especialidad', spec: { kind: 'barras', title: 'Citas por Especialidad', labelKey: 'specialty' } },
  { id: 'pie-estado', label: 'Distribución por estado', spec: { kind: 'pie', title: 'Distribución por Estado', labelKey: 'status' } },
  { id: 'linea-evolucion', label: 'Evolución temporal', spec: { kind: 'linea', title: 'Evolución Temporal de Citas', labelKey: 'date' } },
];

interface Props<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ReportableModule<T>;
  selectedIds: Set<string | number>;
  scope: 'selection' | 'all';
}

export function AdvancedReportSheetCitas<T>({ open, onOpenChange, module, selectedIds, scope }: Props<T>) {
  const [fieldKeys, setFieldKeys] = useState<Set<string>>(new Set(module.fields.map(f => f.key)));
  const [type, setType] = useState<CitasReportType | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [enableSort, setEnableSort] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('date-desc');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [includeMetrics, setIncludeMetrics] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set());
  const [capturedCharts, setCapturedCharts] = useState<CapturedChart[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (open) {
      setFieldKeys(new Set(module.fields.map(f => f.key)));
      setType('');
      setFrom(''); setTo('');
      setEnableSort(false); setSortMode('date-desc');
      setFormat('pdf'); setIncludeMetrics(false);
      setSelectedCharts(new Set());
      setCapturedCharts([]);
    }
  }, [open, module]);

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
  }, [baseRows, module, from, to, enableSort, sortMode]);

  const activeFields = useMemo(
    () => module.fields.filter(f => fieldKeys.has(f.key)),
    [module.fields, fieldKeys]
  );

  const scopeText = scope === 'selection'
    ? `${selectedIds.size} ${selectedIds.size === 1 ? module.itemSingular : module.itemPlural} seleccionad${selectedIds.size === 1 ? 'a' : 'as'}`
    : `Tabla completa (${module.rows.length} registros)`;

  const dateRangeInvalid = from && to && from > to;
  const dateRangeMissing = !from || !to;

  let validationMessage: string | null = null;
  if (!type) validationMessage = 'Debes seleccionar un tipo de reporte antes de continuar.';
  else if (dateRangeMissing) validationMessage = 'El rango de fechas es obligatorio.';
  else if (dateRangeInvalid) validationMessage = 'La fecha final debe ser posterior a la inicial.';
  else if (activeFields.length === 0) validationMessage = 'Selecciona al menos un campo para exportar.';
  else if (filteredRows.length === 0) validationMessage = 'Los filtros no arrojan registros.';

  const canGenerate = !validationMessage && !isCapturing;

  const chartRows = useMemo(() => {
    return filteredRows.map(r => {
      const row: Record<string, any> = {};
      module.fields.forEach(f => { row[f.key] = f.accessor(r); });
      return row;
    });
  }, [filteredRows, module.fields]);

  const chartsToRender: ChartSpec[] = useMemo(() => {
    if (!includeMetrics || selectedCharts.size === 0) return [];
    return availableCharts.filter(c => selectedCharts.has(c.id)).map(c => c.spec);
  }, [includeMetrics, selectedCharts]);

  const onChartsCaptured = useCallback((images: { spec: ChartSpec; dataUrl: string }[]) => {
    setCapturedCharts(images as CapturedChart[]);
  }, []);

  const handleGenerate = async () => {
    if (!canGenerate) return;

    const isPDF = format === 'pdf';
    if (isPDF && chartsToRender.length > 0) {
      setIsCapturing(true);
      await new Promise(r => setTimeout(r, 800));
      setIsCapturing(false);
    }

    const typeObj = types.find(t => t.id === type);
    const typeName = typeObj?.label || 'Reporte';
    const metrics = module.metrics ? module.metrics(filteredRows) : { 'Total registros': filteredRows.length };

    const safe = module.name.replace(/\s+/g, '_');
    const fileName = `${safe}_${type}`;

    if (isPDF) {
      await buildReportPDF({
        title: `${typeName} — ${module.name}`,
        subtitle: scopeText,
        rows: filteredRows,
        fields: activeFields,
        metrics,
        fileName,
        chartImages: capturedCharts.length > 0 ? capturedCharts : undefined,
      });
    } else {
      // CSV / XLSX / DOCX — sin plantilla PDF
      const { downloadCSV, downloadXLSX, downloadDOCX } = await import('./exporters');
      const stamp = new Date().toISOString().slice(0, 10);
      const name = `${safe}_${stamp}`;
      if (format === 'csv') downloadCSV(name, filteredRows, activeFields);
      else if (format === 'xlsx') await downloadXLSX(name, filteredRows, activeFields, metrics);
      else await downloadDOCX(name, `${typeName} — ${module.name}`, scopeText, filteredRows, activeFields, metrics);
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

  const toggleChart = (chartId: string) => {
    setSelectedCharts(prev => {
      const next = new Set(prev);
      if (next.has(chartId)) next.delete(chartId); else next.add(chartId);
      return next;
    });
  };

  const previewLines = [
    { label: 'Alcance', value: scopeText },
    { label: 'Campos', value: `${activeFields.length} de ${module.fields.length}` },
    { label: 'Registros', value: String(filteredRows.length) },
    { label: 'Tipo', value: type ? types.find(t => t.id === type)!.label : '— no seleccionado —' },
    { label: 'Formato', value: format.toUpperCase() },
    ...(includeMetrics && selectedCharts.size > 0 ? [{ label: 'Gráficas', value: `${selectedCharts.size} en PDF` }] : []),
  ];

  return (
    <>
      {format === 'pdf' && chartsToRender.length > 0 && (
        <ReportChartCapture charts={chartsToRender} rows={chartRows} onCapture={onChartsCaptured} />
      )}

      <AdvancedSheetShell
        open={open}
        onOpenChange={onOpenChange}
        title="Reporte avanzado — Citas médicas"
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
        metricsExtra={
          format === 'pdf' ? (
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground font-medium">Gráficas para el PDF</Label>
              <div className="space-y-1.5">
                {availableCharts.map(chart => (
                  <label key={chart.id} className="flex items-start gap-2.5 p-2 rounded-md border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox checked={selectedCharts.has(chart.id)} onCheckedChange={() => toggleChart(chart.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground block">{chart.label}</span>
                      <span className="text-xs text-muted-foreground">{chart.spec.title}</span>
                    </div>
                  </label>
                ))}
              </div>
              {isCapturing && <p className="text-xs text-primary animate-pulse">Capturando gráficas...</p>}
            </div>
          ) : undefined
        }
        previewLines={previewLines}
        validationMessage={validationMessage}
        canGenerate={canGenerate}
        onGenerate={handleGenerate}
      >
        <ReportTypeRadio<CitasReportType> value={type} onChange={(v) => setType(v)} options={types} />
      </AdvancedSheetShell>
    </>
  );
}
