import type { ReportableModule, ReportField, ExportFormat, AdditionalFormat } from './types';
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

export async function downloadXLSX<T>(name: string, rows: T[], fields: ReportField<T>[], metrics?: Record<string, string | number>) {
  const XLSX = await loadXLSX();
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

export async function downloadPDF<T>(name: string, title: string, scopeText: string, rows: T[], fields: ReportField<T>[], metrics?: Record<string, string | number>) {
  const { jsPDF, autoTable } = await loadJsPDF();
  const colors = getThemeColors();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  
  // Header bar with theme color
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, W, 60, 'F');
  
  doc.setTextColor(...colors.primaryForeground);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 40, 38);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(scopeText, 40, 78);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 40, 92);

  autoTable(doc, {
    startY: 110,
    head: [fields.map(f => f.label)],
    body: rows.map(r => fields.map(f => String(f.accessor(r)))),
    styles: { fontSize: 8, cellPadding: 4, textColor: colors.foreground },
    headStyles: { 
      fillColor: colors.primary, 
      textColor: colors.primaryForeground,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: lighten(colors.muted, 0.3) },
    stripeColors: [lighten(colors.muted, 0.3), colors.background],
    margin: { left: 40, right: 40 },
  });

  if (metrics) {
    doc.addPage();
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, W, 50, 'F');
    doc.setTextColor(...colors.primaryForeground);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Métricas', W / 2, 32, { align: 'center' });

    autoTable(doc, {
      startY: 70,
      head: [['Métrica', 'Valor']],
      body: Object.entries(metrics).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 10, cellPadding: 6, textColor: colors.foreground },
      headStyles: { 
        fillColor: colors.primary, 
        textColor: colors.primaryForeground,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: lighten(colors.muted, 0.3) },
      stripeColors: [lighten(colors.muted, 0.3), colors.background],
      margin: { left: 60, right: 60 },
    });
  }

  doc.save(`${name}.pdf`);
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
    children: fields.map(f =>
      new DocxCell({
        borders,
        shading: { fill: primaryHex, type: ShadingType.CLEAR, color: 'auto' },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: f.label, bold: true, color: 'FFFFFF', font })] })],
      })
    ),
  });

  const bodyRows = rows.map((r, idx) =>
    new DocxRow({
      children: fields.map(f =>
        new DocxCell({
          borders,
          shading: idx % 2 === 0 ? undefined : { fill: mutedHex, type: ShadingType.CLEAR, color: 'auto' },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: String(f.accessor(r)), font })] })],
        })
      ),
    })
  );

  const table = new DocxTable({
    width: { size: 9026, type: WidthType.DXA },
    rows: [headerRow, ...bodyRows],
  });

  const children: (Paragraph | DocxTable)[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: title, font, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: scopeText, italics: true, font })] }),
    new Paragraph({ children: [new TextRun({ text: `Generado: ${new Date().toLocaleString()}`, font })] }),
    new Paragraph(''),
    table,
  ];

  if (metrics) {
    children.push(
      new Paragraph(''),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Métricas', font, bold: true })] }),
    );
    Object.entries(metrics).forEach(([k, v]) => {
      children.push(new Paragraph({ 
        children: [
          new TextRun({ text: `${k}: `, bold: true, font }),
          new TextRun({ text: String(v), font }),
        ] 
      }));
    });
  }

  const doc = new Document({
    styles: { default: { document: { run: { font, size: 22 } } } },
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
export async function generarReporteGeneral<T>(
  title: string,
  subtitle: string,
  rows: T[],
  fields: ReportField<T>[],
  metrics?: Record<string, string | number>,
  fileName?: string
) {
  const { jsPDF, autoTable } = await loadJsPDF();
  const colors = getThemeColors();
  const logo = await getLogoBase64();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const stamp = new Date().toLocaleString('es-VE');
  const safeName = (fileName || title.replace(/\s+/g, '_')).replace(/[^a-zA-Z0-9_-]/g, '');

  // ─── Portada mejorada con logo ───
  // Fondo principal con color del tema
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, W, 180, 'F');
  
  // Línea decorativa
  doc.setFillColor(...lighten(colors.primary, 0.2));
  doc.rect(0, 180, W, 4, 'F');

  // Logo
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 40, 25, 50, 50);
    } catch { /* logo load failed */ }
  }

  // Texto de portada
  doc.setTextColor(...colors.primaryForeground);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  const textStartX = logo ? 100 : W / 2;
  doc.text('Centro Ambulatorio Dr. Salvador Allende', textStartX, 45, { align: logo ? 'left' : 'center' });
  
  doc.setFontSize(18);
  doc.text(title, textStartX, 75, { align: logo ? 'left' : 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(subtitle, textStartX, 105, { align: logo ? 'left' : 'center' });
  
  doc.setFontSize(9);
  doc.text(`Generado: ${stamp}`, textStartX, 130, { align: logo ? 'left' : 'center' });
  
  // Info adicional en la portada
  doc.setFontSize(9);
  doc.text(`Total de registros: ${rows.length}`, textStartX, 150, { align: logo ? 'left' : 'center' });

  // ─── Resumen ejecutivo ───
  doc.setTextColor(...colors.foreground);
  let y = 220;
  
  // Título de sección con fondo
  doc.setFillColor(...lighten(colors.muted, 0.4));
  doc.rect(30, y - 5, W - 60, 28, 'F');
  doc.setFillColor(...colors.primary);
  doc.rect(30, y - 5, 4, 28, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Resumen Ejecutivo', 45, y + 14);
  y += 45;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Métricas destacadas en cajas
  const summaryItems = [
    { label: 'Total de registros', value: String(rows.length) },
    { label: 'Fecha de generación', value: stamp },
    { label: 'Período', value: subtitle },
  ];
  
  summaryItems.forEach((item, idx) => {
    const boxX = 50 + (idx * 180);
    doc.setFillColor(...lighten(colors.muted, 0.5));
    doc.roundedRect(boxX, y - 5, 160, 35, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colors.mutedForeground);
    doc.text(item.label, boxX + 10, y + 8);
    doc.setFontSize(12);
    doc.setTextColor(...colors.foreground);
    doc.text(item.value, boxX + 10, y + 25);
  });
  y += 55;

  // ─── Métricas con gráfica de barras ───
  if (metrics && Object.keys(metrics).length > 0) {
    doc.setFillColor(...lighten(colors.muted, 0.4));
    doc.rect(30, y - 5, W - 60, 28, 'F');
    doc.setFillColor(...colors.primary);
    doc.rect(30, y - 5, 4, 28, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...colors.foreground);
    doc.text('Métricas Clave', 45, y + 14);
    y += 35;

    // Dibujar gráfica de barras horizontal
    const metricEntries = Object.entries(metrics).slice(0, 8); // Max 8 barras
    const maxValue = Math.max(...metricEntries.map(([, v]) => {
      const num = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? 0 : num;
    }));
    
    const barHeight = 22;
    const barSpacing = 8;
    const chartWidth = W - 200;
    const chartX = 120;
    
    metricEntries.forEach(([key, value], idx) => {
      const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
      const barWidth = maxValue > 0 ? (Math.abs(numValue) / maxValue) * chartWidth * 0.7 : 0;
      const barY = y + (idx * (barHeight + barSpacing));
      
      // Fondo de la barra
      doc.setFillColor(...lighten(colors.muted, 0.4));
      doc.roundedRect(chartX, barY, chartWidth * 0.7, barHeight, 3, 3, 'F');
      
      // Barra de progreso con color según valor
      let barColor: [number, number, number];
      if (numValue >= 80) barColor = colors.success;
      else if (numValue >= 50) barColor = colors.warning;
      else barColor = colors.primary;
      
      if (barWidth > 0) {
        doc.setFillColor(...barColor);
        doc.roundedRect(chartX, barY, Math.max(barWidth, 6), barHeight, 3, 3, 'F');
      }
      
      // Etiqueta
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...colors.foreground);
      doc.text(key.substring(0, 25), 40, barY + 15);
      
      // Valor
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text(String(value), chartX + chartWidth * 0.7 + 10, barY + 15);
    });
    
    y += metricEntries.length * (barHeight + barSpacing) + 20;
  }

  // ─── Tabla de datos ───
  if (rows.length > 0) {
    doc.addPage();
    
    // Header de página de datos
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, W, 60, 'F');
    doc.setTextColor(...colors.primaryForeground);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Detalle — ${title}`, W / 2, 38, { align: 'center' });

    doc.setTextColor(...colors.foreground);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Mostrando ${rows.length} registros`, 40, 78);

    autoTable(doc, {
      startY: 95,
      head: [fields.map(f => f.label)],
      body: rows.map(r => fields.map(f => String(f.accessor(r)))),
      styles: { 
        fontSize: 8, 
        cellPadding: 4, 
        overflow: 'linebreak',
        textColor: colors.foreground,
        lineColor: colors.border,
        lineWidth: 0.3,
      },
      headStyles: { 
        fillColor: colors.primary, 
        textColor: colors.primaryForeground, 
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: lighten(colors.muted, 0.3) },
      stripeColors: [lighten(colors.muted, 0.3), colors.background],
      margin: { left: 30, right: 30 },
      tableLineColor: colors.border,
      didDrawPage: (data) => {
        // Footer en cada página
        doc.setFontSize(7);
        doc.setTextColor(...colors.mutedForeground);
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
