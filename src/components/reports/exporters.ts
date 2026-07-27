import type { ReportableModule, ReportField, ExportFormat, AdditionalFormat, CapturedChart } from './types';
import { getThemeColors, getFontFamily, lighten, darken, rgbToHex, getLogoBase64 } from './theme-utils';
import type { ThemeColors } from './theme-utils';

async function loadXLSX() {
  const XLSX = await import('xlsx');
  return XLSX.default || XLSX;
}

async function loadJsPDF() {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  return { jsPDF, autoTable };
}

async function loadDocx() {
  return await import('docx');
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

function getImageDimensions(dataUrl: string): { w: number; h: number } {
  if (typeof document === 'undefined') return { w: 600, h: 340 };
  const img = new Image();
  img.src = dataUrl;
  return { w: img.naturalWidth || 600, h: img.naturalHeight || 340 };
}

// ═══════════════════════════════════════════════════════════════
//  PLANTILLA UNIFICADA DE PDF
//  La misma plantilla se usa para TODOS los tipos de reporte:
//  General, Total, Menor, Mayor, Promedio
// ═══════════════════════════════════════════════════════════════

export interface ReportPDFOptions {
  title: string;
  subtitle: string;
  rows: any[];
  fields: ReportField<any>[];
  metrics?: Record<string, string | number>;
  fileName: string;
  chartImages?: CapturedChart[];
}

export async function buildReportPDF(opts: ReportPDFOptions) {
  const { jsPDF, autoTable } = await loadJsPDF();
  const colors = getThemeColors();
  const logo = await getLogoBase64();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const stamp = new Date().toLocaleString('es-VE');
  const { title, subtitle, rows, fields, metrics, fileName, chartImages } = opts;

  // ─── ENCABEZADO COMPACTO (página 1) ───
  const headerH = 58;
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, W, headerH, 'F');
  doc.setFillColor(...lighten(colors.primary, 0.2));
  doc.rect(0, headerH, W, 2, 'F');

  let textX = 40;
  if (logo) {
    try { doc.addImage(logo, 'PNG', 40, 10, 38, 38); textX = 90; } catch {}
  }

  doc.setTextColor(...colors.primaryForeground);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Centro Ambulatorio Dr. Salvador Allende', textX, 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${title}  ·  ${subtitle}  ·  ${rows.length} registros  ·  ${stamp}`, textX, 40);

  // ─── TABLA DE DATOS (página 1, justo debajo del encabezado) ───
  if (rows.length > 0) {
    autoTable(doc, {
      startY: headerH + 10,
      head: [fields.map(f => f.label)],
      body: rows.map(r => fields.map(f => String(f.accessor(r)))),
      styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak', textColor: colors.foreground, lineColor: colors.border, lineWidth: 0.3 },
      headStyles: { fillColor: colors.primary, textColor: colors.primaryForeground, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: lighten(colors.muted, 0.3) },
      stripeColors: [lighten(colors.muted, 0.3), colors.background],
      margin: { left: 30, right: 30 },
      tableLineColor: colors.border,
      didDrawPage: () => {
        doc.setFontSize(7);
        doc.setTextColor(...colors.mutedForeground);
        doc.text(`Centro Ambulatorio Dr. Salvador Allende — ${title} — Pág. ${doc.getCurrentPageInfo().pageNumber}`, W / 2, H - 12, { align: 'center' });
      },
    });
  }

  // ─── GRÁFICAS (una por página, tamaño grande) ───
  if (chartImages && chartImages.length > 0) {
    for (let idx = 0; idx < chartImages.length; idx++) {
      const img = chartImages[idx];
      doc.addPage();
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, W, 42, 'F');
      doc.setTextColor(...colors.primaryForeground);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(img.spec.title, 40, 26);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Gráfica ${idx + 1} de ${chartImages.length}`, W - 40, 26, { align: 'right' });

      const marginX = 50;
      const availableW = W - marginX * 2;
      const maxImgH = H - 120;
      let imgW: number;
      let imgH: number;
      try {
        const dims = getImageDimensions(img.dataUrl);
        imgW = Math.min(availableW, dims.w);
        imgH = (dims.h / dims.w) * imgW;
        if (imgH > maxImgH) { imgH = maxImgH; imgW = (dims.w / dims.h) * imgH; }
      } catch { imgW = availableW; imgH = 300; }

      const imgX = marginX + (availableW - imgW) / 2;
      const imgY = 55;
      doc.setFillColor(...lighten(colors.muted, 0.5));
      doc.roundedRect(imgX - 8, imgY - 8, imgW + 16, imgH + 16, 6, 6, 'F');
      try { doc.addImage(img.dataUrl, 'PNG', imgX, imgY, imgW, imgH); } catch {}
    }
  }

  // ─── TABLA RESUMEN ───
  if (metrics && Object.keys(metrics).length > 0) {
    doc.addPage();
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, W, 42, 'F');
    doc.setTextColor(...colors.primaryForeground);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Resumen', 40, 26);

    autoTable(doc, {
      startY: 58,
      head: [['Métrica', 'Valor']],
      body: Object.entries(metrics).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 11, cellPadding: 10, textColor: colors.foreground, lineColor: colors.border, lineWidth: 0.3 },
      headStyles: { fillColor: colors.primary, textColor: colors.primaryForeground, fontStyle: 'bold', fontSize: 11 },
      alternateRowStyles: { fillColor: lighten(colors.muted, 0.3) },
      stripeColors: [lighten(colors.muted, 0.3), colors.background],
      margin: { left: 80, right: 80 },
      tableLineColor: colors.border,
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 200 }, 1: { halign: 'right' } },
      didDrawPage: () => {
        doc.setFontSize(7);
        doc.setTextColor(...colors.mutedForeground);
        doc.text(`Centro Ambulatorio Dr. Salvador Allende — Resumen — Pág. ${doc.getCurrentPageInfo().pageNumber}`, W / 2, H - 12, { align: 'center' });
      },
    });
  }

  doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════
//  EXPORTADORES POR FORMATO (CSV, XLSX, DOCX)
// ═══════════════════════════════════════════════════════════════

export function downloadCSV<T>(name: string, rows: T[], fields: ReportField<T>[]) {
  const header = fields.map(f => `"${f.label.replace(/"/g, '""')}"`).join(';');
  const body = rows.map(r =>
    fields.map(f => `"${String(f.accessor(r)).replace(/"/g, '""')}"`).join(';')
  ).join('\n');
  triggerDownload(new Blob(['\uFEFF' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' }), `${name}.csv`);
}

function buildRows<T>(rows: T[], fields: ReportField<T>[]) {
  return rows.map(r => {
    const o: Record<string, string | number> = {};
    fields.forEach(f => { o[f.label] = f.accessor(r); });
    return o;
  });
}

export async function downloadXLSX<T>(name: string, rows: T[], fields: ReportField<T>[], metrics?: Record<string, string | number>) {
  const XLSX = await loadXLSX();
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(buildRows(rows, fields)), 'Datos');
  if (metrics) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Object.entries(metrics).map(([k, v]) => ({ Métrica: k, Valor: v }))), 'Métricas');
  }
  XLSX.writeFile(wb, `${name}.xlsx`);
}

export async function downloadDOCX<T>(name: string, title: string, scopeText: string, rows: T[], fields: ReportField<T>[], metrics?: Record<string, string | number>) {
  const { Document, Packer, Paragraph, Table: DocxTable, TableRow: DocxRow, TableCell: DocxCell, HeadingLevel, WidthType, BorderStyle, ShadingType, TextRun } = await loadDocx();
  const colors = getThemeColors();
  const font = getFontFamily();
  const primaryHex = rgbToHex(...colors.primary);
  const mutedHex = rgbToHex(...lighten(colors.muted, 0.3));
  const borderHex = rgbToHex(...colors.border);
  const border = { style: BorderStyle.SINGLE, size: 4, color: borderHex };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerRow = new DocxRow({
    children: fields.map(f => new DocxCell({
      borders, shading: { fill: primaryHex, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: f.label, bold: true, color: 'FFFFFF', font })] })],
    })),
  });

  const bodyRows = rows.map((r, idx) => new DocxRow({
    children: fields.map(f => new DocxCell({
      borders,
      shading: idx % 2 === 0 ? undefined : { fill: mutedHex, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: String(f.accessor(r)), font })] })],
    })),
  }));

  const children: (Paragraph | DocxTable)[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: title, font, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: scopeText, italics: true, font })] }),
    new Paragraph({ children: [new TextRun({ text: `Generado: ${new Date().toLocaleString()}`, font })] }),
    new Paragraph(''),
    new DocxTable({ width: { size: 9026, type: WidthType.DXA }, rows: [headerRow, ...bodyRows] }),
  ];

  if (metrics) {
    children.push(new Paragraph(''), new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Métricas', font, bold: true })] }));
    Object.entries(metrics).forEach(([k, v]) => {
      children.push(new Paragraph({ children: [new TextRun({ text: `${k}: `, bold: true, font }), new TextRun({ text: String(v), font })] }));
    });
  }

  const blob = await Packer.toBlob(new Document({
    styles: { default: { document: { run: { font, size: 22 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 } } }, children }],
  }));
  triggerDownload(blob, `${name}.docx`);
}

// ═══════════════════════════════════════════════════════════════
//  FUNCIÓN PRINCIPAL: exportar reporte con plantilla unificada
//  Ahora TODOS los formatos PDF usan buildReportPDF.
// ═══════════════════════════════════════════════════════════════

interface ExportOptions {
  scope: string;
  includeMetrics: boolean;
}

export async function exportReport<T>(
  format: ExportFormat,
  module: ReportableModule<T>,
  rows: T[],
  fields: ReportField<T>[],
  options: ExportOptions,
  chartImages?: CapturedChart[]
) {
  const safe = module.name.replace(/\s+/g, '_');
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `${safe}_${stamp}`;
  const metrics = options.includeMetrics && module.metrics ? module.metrics(rows) : undefined;

  if (format === 'csv') {
    downloadCSV(fileName, rows, fields);
  } else if (format === 'xlsx') {
    await downloadXLSX(fileName, rows, fields, metrics);
  } else if (format === 'pdf') {
    await buildReportPDF({
      title: `Reporte — ${module.name}`,
      subtitle: options.scope,
      rows,
      fields,
      metrics,
      fileName,
      chartImages,
    });
  } else {
    await downloadDOCX(fileName, `Reporte — ${module.name}`, options.scope, rows, fields, metrics);
  }
}

/** Exporta CSV siempre, más los formatos adicionales seleccionados (xlsx, pdf, docx). */
export async function exportMulti<T>(
  additional: AdditionalFormat[],
  module: ReportableModule<T>,
  rows: T[],
  fields: ReportField<T>[],
  options: ExportOptions
) {
  const safe = module.name.replace(/\s+/g, '_');
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `${safe}_${stamp}`;
  const metrics = options.includeMetrics && module.metrics ? module.metrics(rows) : undefined;

  downloadCSV(fileName, rows, fields);

  for (const fmt of additional) {
    if (fmt === 'xlsx') {
      await downloadXLSX(fileName, rows, fields, metrics);
    } else if (fmt === 'pdf') {
      await buildReportPDF({
        title: `Reporte — ${module.name}`,
        subtitle: options.scope,
        rows,
        fields,
        metrics,
        fileName,
      });
    } else if (fmt === 'docx') {
      await downloadDOCX(fileName, `Reporte — ${module.name}`, options.scope, rows, fields, metrics);
    }
  }
}

/** Alias para retrocompatibilidad — llama a buildReportPDF con la misma plantilla. */
export async function generarReporteGeneral<T>(
  title: string,
  subtitle: string,
  rows: T[],
  fields: ReportField<T>[],
  metrics?: Record<string, string | number>,
  fileName?: string,
  chartImages?: CapturedChart[]
) {
  await buildReportPDF({
    title,
    subtitle,
    rows,
    fields,
    metrics,
    fileName: fileName || title.replace(/\s+/g, '_'),
    chartImages,
  });
}

/** Alias — downloadPDF para retrocompatibilidad con EspecialistasExportDrawer. */
export async function downloadPDF<T>(
  fileName: string,
  title: string,
  subtitle: string,
  rows: T[],
  fields: ReportField<T>[],
  metrics?: Record<string, string | number>,
  chartImages?: CapturedChart[]
) {
  await buildReportPDF({ title, subtitle, rows, fields, metrics, fileName, chartImages });
}
