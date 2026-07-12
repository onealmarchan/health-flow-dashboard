import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document, Packer, Paragraph, Table as DocxTable, TableRow as DocxRow, TableCell as DocxCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType, TextRun,
} from 'docx';
import type { ReportableModule, ReportField, ExportFormat, AdditionalFormat } from './types';

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

export function downloadCSV<T>(name: string, rows: T[], fields: ReportField<T>[]) {
  const header = fields.map(f => `"${f.label.replace(/"/g, '""')}"`).join(';');
  const body = rows.map(r =>
    fields.map(f => `"${String(f.accessor(r)).replace(/"/g, '""')}"`).join(';')
  ).join('\n');
  const csv = '\uFEFF' + header + '\n' + body;
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${name}.csv`);
}

function buildRows<T>(rows: T[], fields: ReportField<T>[]) {
  return rows.map(r => {
    const o: Record<string, string | number> = {};
    fields.forEach(f => { o[f.label] = f.accessor(r); });
    return o;
  });
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

export async function downloadDOCX<T>(name: string, title: string, scopeText: string, rows: T[], fields: ReportField<T>[], metrics?: Record<string, string | number>) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerRow = new DocxRow({
    children: fields.map(f =>
      new DocxCell({
        borders,
        shading: { fill: 'D5E8F0', type: ShadingType.CLEAR, color: 'auto' },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: f.label, bold: true })] })],
      })
    ),
  });

  const bodyRows = rows.map(r =>
    new DocxRow({
      children: fields.map(f =>
        new DocxCell({
          borders,
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph(String(f.accessor(r)))],
        })
      ),
    })
  );

  const table = new DocxTable({
    width: { size: 9026, type: WidthType.DXA },
    rows: [headerRow, ...bodyRows],
  });

  const children: (Paragraph | DocxTable)[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(title)] }),
    new Paragraph({ children: [new TextRun({ text: scopeText, italics: true })] }),
    new Paragraph({ children: [new TextRun(`Generado: ${new Date().toLocaleString()}`)] }),
    new Paragraph(''),
    table,
  ];

  if (metrics) {
    children.push(
      new Paragraph(''),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Métricas')] }),
    );
    Object.entries(metrics).forEach(([k, v]) => {
      children.push(new Paragraph({ children: [new TextRun({ text: `${k}: `, bold: true }), new TextRun(String(v))] }));
    });
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${name}.docx`);
}

interface ExportOptions {
  scope: string;
  includeMetrics: boolean;
}

export async function exportReport<T>(
  format: ExportFormat,
  module: ReportableModule<T>,
  rows: T[],
  fields: ReportField<T>[],
  options: ExportOptions
) {
  const safe = module.name.replace(/\s+/g, '_');
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `${safe}_${stamp}`;
  const metrics = options.includeMetrics && module.metrics ? module.metrics(rows) : undefined;
  if (format === 'csv') downloadCSV(fileName, rows, fields);
  else if (format === 'xlsx') downloadXLSX(fileName, rows, fields, metrics);
  else if (format === 'pdf') downloadPDF(fileName, `Reporte — ${module.name}`, options.scope, rows, fields, metrics);
  else await downloadDOCX(fileName, `Reporte — ${module.name}`, options.scope, rows, fields, metrics);
}

/** Multi-format export: always CSV + any additional formats marked. */
export async function exportMulti<T>(
  additional: AdditionalFormat[],
  module: ReportableModule<T>,
  rows: T[],
  fields: ReportField<T>[],
  options: ExportOptions
) {
  await exportReport('csv', module, rows, fields, options);
  for (const fmt of additional) {
    await exportReport(fmt, module, rows, fields, options);
  }
}

/**
 * Genera un reporte general completo en PDF con portada, tabla de datos y métricas.
 */
export function generarReporteGeneral<T>(
  title: string,
  subtitle: string,
  rows: T[],
  fields: ReportField<T>[],
  metrics?: Record<string, string | number>,
  fileName?: string
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const stamp = new Date().toLocaleString('es-VE');
  const safeName = (fileName || title.replace(/\s+/g, '_')).replace(/[^a-zA-Z0-9_-]/g, '');

  // ─── Portada ───
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, W, 120, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Centro Ambulatorio Dr. Salvador Allende', W / 2, 45, { align: 'center' });
  doc.setFontSize(16);
  doc.text(title, W / 2, 70, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, W / 2, 90, { align: 'center' });
  doc.text(`Generado: ${stamp}`, W / 2, 106, { align: 'center' });

  // ─── Resumen ejecutivo ───
  doc.setTextColor(0, 0, 0);
  let y = 150;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Resumen Ejecutivo', 40, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total de registros: ${rows.length}`, 50, y);
  y += 14;
  doc.text(`Fecha de generación: ${stamp}`, 50, y);
  y += 14;
  doc.text(`Período: ${subtitle}`, 50, y);
  y += 24;

  // ─── Métricas ───
  if (metrics && Object.keys(metrics).length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Métricas Clave', 40, y);
    y += 16;

    autoTable(doc, {
      startY: y,
      head: [['Indicador', 'Valor']],
      body: Object.entries(metrics).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 50, right: 50 },
    });

    y = (doc as any).lastAutoTable?.finalY + 20 || y + 60;
  }

  // ─── Tabla de datos ───
  if (rows.length > 0) {
    doc.addPage();
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, W, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Detalle — ${title}`, W / 2, 32, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Mostrando ${rows.length} registros`, 40, 68);

    autoTable(doc, {
      startY: 80,
      head: [fields.map(f => f.label)],
      body: rows.map(r => fields.map(f => String(f.accessor(r)))),
      styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 30, right: 30 },
      didDrawPage: (data) => {
        // Footer en cada página
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(
          `Centro Ambulatorio Dr. Salvador Allende — ${title} — Página ${doc.getCurrentPageInfo().pageNumber}`,
          W / 2,
          H - 20,
          { align: 'center' }
        );
      },
    });
  }

  doc.save(`${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
