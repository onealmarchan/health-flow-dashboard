import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportableModule, ReportField, ExportFormat } from './types';

function buildRows<T>(rows: T[], fields: ReportField<T>[]) {
  return rows.map(r => {
    const o: Record<string, string | number> = {};
    fields.forEach(f => { o[f.label] = f.accessor(r); });
    return o;
  });
}

export function downloadCSV<T>(name: string, rows: T[], fields: ReportField<T>[]) {
  const header = fields.map(f => `"${f.label.replace(/"/g, '""')}"`).join(';');
  const body = rows.map(r =>
    fields.map(f => `"${String(f.accessor(r)).replace(/"/g, '""')}"`).join(';')
  ).join('\n');
  const csv = '\uFEFF' + header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${name}.csv`);
}

export function downloadXLSX<T>(name: string, rows: T[], fields: ReportField<T>[], metrics?: Record<string, string | number>) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(buildRows(rows, fields));
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  if (metrics) {
    const mws = XLSX.utils.json_to_sheet(
      Object.entries(metrics).map(([k, v]) => ({ Métrica: k, Valor: v }))
    );
    XLSX.utils.book_append_sheet(wb, mws, 'Métricas');
  }
  XLSX.writeFile(wb, `${name}.xlsx`);
}

export function downloadPDF<T>(name: string, title: string, scopeText: string, rows: T[], fields: ReportField<T>[], metrics?: Record<string, string | number>) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  doc.setFontSize(14);
  doc.text(title, 40, 40);
  doc.setFontSize(10);
  doc.text(scopeText, 40, 58);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 40, 72);

  autoTable(doc, {
    startY: 90,
    head: [fields.map(f => f.label)],
    body: rows.map(r => fields.map(f => String(f.accessor(r)))),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
  });

  if (metrics) {
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Métricas', 40, 40);
    autoTable(doc, {
      startY: 60,
      head: [['Métrica', 'Valor']],
      body: Object.entries(metrics).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    });
  }

  doc.save(`${name}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportReport<T>(
  format: ExportFormat,
  module: ReportableModule<T>,
  rows: T[],
  fields: ReportField<T>[],
  options: { scope: string; includeMetrics: boolean }
) {
  const safe = module.name.replace(/\s+/g, '_');
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `${safe}_${stamp}`;
  const metrics = options.includeMetrics && module.metrics ? module.metrics(rows) : undefined;
  if (format === 'csv') downloadCSV(fileName, rows, fields);
  else if (format === 'xlsx') downloadXLSX(fileName, rows, fields, metrics);
  else downloadPDF(fileName, `Reporte — ${module.name}`, options.scope, rows, fields, metrics);
}
