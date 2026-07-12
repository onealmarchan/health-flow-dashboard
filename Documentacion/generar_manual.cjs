#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { marked } = require('marked');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, ImageRun,
  AlignmentType, WidthType, BorderStyle,
  PageNumber, Footer, Header, PageBreak,
  convertInchesToTwip
} = require('docx');

// ─── Rutas ───────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const MD_PATH = path.join(__dirname, 'Manual_de_Usuario_MediCitas_v2.md');
const OUT_PATH = path.join(__dirname, 'Manual_de_Usuario_MediCitas.docx');
const PLANTUML_TMP = path.join(__dirname, '.plantuml_cache');

// ─── PlantUML Encoding ───────────────────────────────────────
const PLANTUML_ALPHA = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_';

function encode6bit(b) {
  return PLANTUML_ALPHA[b & 0x3F];
}

function encode3bytes(a, b, c) {
  const b1 = a >> 2;
  const b2 = ((a & 0x3) << 4) | (b >> 4);
  const b3 = ((b & 0xF) << 2) | (c >> 6);
  const b4 = c & 0x3F;
  return encode6bit(b1) + encode6bit(b2) + encode6bit(b3) + encode6bit(b4);
}

function plantumlEncode(text) {
  const data = zlib.deflateSync(Buffer.from(text, 'utf-8'));
  let result = '';
  for (let i = 0; i < data.length; i += 3) {
    const a = data[i];
    const b = i + 1 < data.length ? data[i + 1] : 0;
    const c = i + 2 < data.length ? data[i + 2] : 0;
    result += encode3bytes(a, b, c);
  }
  return result;
}

async function fetchPlantUML(pumlCode, format = 'png') {
  if (!fs.existsSync(PLANTUML_TMP)) fs.mkdirSync(PLANTUML_TMP, { recursive: true });
  const hash = crypto.createHash('md5').update(pumlCode).digest('hex');
  const cached = path.join(PLANTUML_TMP, `${hash}.${format}`);
  if (fs.existsSync(cached)) return cached;

  const encoded = plantumlEncode(pumlCode);
  const url = `http://www.plantuml.com/plantuml/${format}/~1${encoded}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync(cached, buf);
    return cached;
  } catch (e) {
    console.warn(`  ⚠ PlantUML no disponible: ${e.message}`);
    return null;
  }
}

// ─── Helpers de formateo ─────────────────────────────────────
const HEADING_MAP = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
};

function txt(text, opts = {}) {
  return new TextRun({ text, font: 'Times New Roman', size: 24, ...opts });
}

function bold(text, opts = {}) {
  return txt(text, { bold: true, ...opts });
}

function italic(text, opts = {}) {
  return txt(text, { italics: true, ...opts });
}

function codeRun(text) {
  return new TextRun({ text, font: 'Courier New', size: 20, shading: { fill: 'F0F0F0' } });
}

// ─── Procesamiento de tokens inline ──────────────────────────
function processInlineTokens(tokens) {
  if (!tokens) return [];
  const runs = [];
  for (const t of tokens) {
    switch (t.type) {
      case 'text':
        runs.push(...parseInlineFormatting(t.text));
        break;
      case 'strong':
        runs.push(bold(t.text || t.raw));
        break;
      case 'em':
        runs.push(italic(t.text || t.raw));
        break;
      case 'codespan':
        runs.push(codeRun(t.text));
        break;
      case 'link':
        runs.push(txt(t.text, { color: '1155CC' }));
        break;
      case 'br':
        runs.push(new TextRun({ break: 1 }));
        break;
      default:
        if (t.text) runs.push(txt(t.text));
        else if (t.raw) runs.push(txt(t.raw));
    }
  }
  return runs;
}

function parseInlineFormatting(text) {
  const runs = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      runs.push(txt(text.slice(lastIndex, m.index)));
    }
    if (m[2]) runs.push(bold(m[2]));
    else if (m[3]) runs.push(italic(m[3]));
    else if (m[4]) runs.push(codeRun(m[4]));
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    runs.push(txt(text.slice(lastIndex)));
  }
  if (runs.length === 0 && text) runs.push(txt(text));
  return runs;
}

// ─── Procesamiento de tokens ─────────────────────────────────
async function processTokens(tokens) {
  const children = [];
  for (const token of tokens) {
    const result = await processToken(token);
    if (result) {
      if (Array.isArray(result)) children.push(...result);
      else children.push(result);
    }
  }
  return children;
}

async function processToken(token) {
  switch (token.type) {
    case 'heading': {
      const level = Math.min(token.depth, 4);
      const alignment = level === 1 ? AlignmentType.CENTER : AlignmentType.LEFT;
      const headingRuns = token.tokens
        ? processInlineTokens(token.tokens)
        : [txt(token.text, { bold: true })];

      return new Paragraph({
        heading: HEADING_MAP[level],
        alignment,
        spacing: { before: level === 1 ? 400 : 280, after: 160 },
        children: headingRuns.map(r => {
          r.root[1].bold = true;
          if (level <= 2) r.root[1].font = 'Arial';
          return r;
        }),
      });
    }

    case 'paragraph': {
      const text = token.text || '';
      const imgMatch = text.match(/^!\[(.+?)\]\((.+?)\)$/);
      if (imgMatch) {
        return await createImageBlock(imgMatch[1], imgMatch[2]);
      }
      const runs = token.tokens ? processInlineTokens(token.tokens) : parseInlineFormatting(text);
      return new Paragraph({
        spacing: { after: 120, line: 480 },
        children: runs,
      });
    }

    case 'table': {
      const headerCells = token.header.map(cell => {
        const cellTokens = cell.tokens || [{ type: 'text', text: cell.text || '' }];
        return new TableCell({
          children: [new Paragraph({
            children: processInlineTokens(cellTokens).map(r => { r.root[1].bold = true; return r; }),
          })],
          shading: { fill: '2B5797', type: 'clear' },
          width: { size: Math.floor(100 / token.header.length), type: WidthType.PERCENTAGE },
        });
      });
      const rows = token.rows.map(row => {
        const cells = row.map(cell => {
          const cellTokens = cell.tokens || [{ type: 'text', text: cell.text || '' }];
          return new TableCell({
            children: [new Paragraph({
              children: processInlineTokens(cellTokens),
              spacing: { after: 40 },
            })],
          });
        });
        return new TableRow({ children: cells });
      });
      return [
        new Paragraph({ spacing: { before: 120 }, children: [] }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: headerCells, tableHeader: true }),
            ...rows,
          ],
        }),
        new Paragraph({ spacing: { after: 120 }, children: [] }),
      ];
    }

    case 'code': {
      if (token.lang === 'plantuml') {
        const imgPath = await fetchPlantUML(token.text);
        if (imgPath) {
          return await createDiagramBlock(imgPath);
        }
      }
      const codeLines = token.text.split('\n');
      const codeParagraphs = codeLines.map(line =>
        new Paragraph({
          spacing: { after: 0, line: 240 },
          indent: { left: convertInchesToTwip(0.3) },
          children: [codeRun(line || ' ')],
        })
      );
      return [
        new Paragraph({ spacing: { before: 120 }, children: [] }),
        ...codeParagraphs,
        new Paragraph({ spacing: { after: 120 }, children: [] }),
      ];
    }

    case 'list': {
      const items = [];
      for (const item of token.items) {
        const runs = item.tokens ? processInlineTokens(item.tokens) : parseInlineFormatting(item.text || '');
        items.push(new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60, line: 360 },
          children: runs,
        }));
      }
      return items;
    }

    case 'blockquote': {
      const inner = token.tokens ? await processTokens(token.tokens) : [];
      return new Paragraph({
        indent: { left: convertInchesToTwip(0.5) },
        border: { left: { color: '999999', space: 10, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { before: 120, after: 120 },
        children: inner instanceof Paragraph ? inner.children : [txt(token.text || '')],
      });
    }

    case 'hr':
      return new Paragraph({
        border: { bottom: { color: 'CCCCCC', style: BorderStyle.SINGLE, size: 1, space: 1 } },
        spacing: { before: 200, after: 200 },
        children: [],
      });

    case 'space':
    case 'html':
      return null;

    default:
      if (token.text) return new Paragraph({ children: parseInlineFormatting(token.text) });
      return null;
  }
}

// ─── Crear bloque de imagen (captura de pantalla) ────────────
async function createImageBlock(caption, imgPath) {
  const resolved = path.isAbsolute(imgPath) ? imgPath : path.join(ROOT, imgPath);
  if (!fs.existsSync(resolved)) {
    console.warn(`  ⚠ Imagen no encontrada: ${resolved}`);
    return new Paragraph({
      spacing: { before: 120, after: 120 },
      alignment: AlignmentType.CENTER,
      children: [txt(`[Imagen: ${caption}]`, { italics: true, color: '999999' })],
    });
  }
  try {
    const imgBuf = fs.readFileSync(resolved);
    const img = new ImageRun({
      data: imgBuf,
      transformation: { width: 420, height: 290 },
      type: 'jpg',
    });
    return [
      new Paragraph({ spacing: { before: 200 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [img],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 280 },
        children: [italic(caption, { size: 20, color: '555555' })],
      }),
    ];
  } catch (e) {
    console.warn(`  ⚠ Error cargando imagen: ${e.message}`);
    return new Paragraph({
      children: [txt(`[Imagen: ${caption}]`, { italics: true, color: '999999' })],
    });
  }
}

// ─── Crear bloque de diagrama UML ────────────────────────────
async function createDiagramBlock(imgPath) {
  try {
    const imgBuf = fs.readFileSync(imgPath);
    const img = new ImageRun({
      data: imgBuf,
      transformation: { width: 520, height: 380 },
      type: 'png',
    });
    return [
      new Paragraph({ spacing: { before: 240 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [img],
      }),
      new Paragraph({ spacing: { after: 240 }, children: [] }),
    ];
  } catch (e) {
    console.warn(`  ⚠ Error cargando diagrama: ${e.message}`);
    return new Paragraph({ children: [] });
  }
}

// ─── Documento Word ──────────────────────────────────────────
async function buildDocument(mdContent) {
  const tokens = marked.lexer(mdContent);
  const children = await processTokens(tokens);

  const doc = new Document({
    creator: 'Hospital Dr. Salvador Allende',
    title: 'Manual de Usuario — Sistema de Gestión de Citas Médicas',
    description: 'Manual de usuario del Sistema de Gestión de Citas Médicas v1.0',
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 },
          paragraph: { spacing: { line: 480 } },
        },
        heading1: {
          run: { font: 'Arial', size: 28, bold: true, color: '1F3864' },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 } },
        },
        heading2: {
          run: { font: 'Arial', size: 24, bold: true, color: '2B5797' },
          paragraph: { spacing: { before: 280, after: 160 } },
        },
        heading3: {
          run: { font: 'Arial', size: 22, bold: true, italics: true, color: '404040' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        heading4: {
          run: { font: 'Arial', size: 21, bold: true, color: '404040' },
          paragraph: { indent: { left: convertInchesToTwip(0.3) }, spacing: { before: 200, after: 100 } },
        },
      },
    },
    sections: [
      // ── PORTADA ──
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          new Paragraph({ spacing: { before: 3000 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [txt('HOSPITAL DR. SALVADOR ALLENDE', { font: 'Arial', size: 24, color: '666666' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            border: { bottom: { color: '2B5797', style: BorderStyle.SINGLE, size: 3 } },
            children: [txt(' ', { size: 8 })],
          }),
          new Paragraph({ spacing: { before: 300 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [txt('MANUAL DE USUARIO', { font: 'Arial', size: 56, bold: true, color: '1F3864' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [txt('Sistema de Gestión de Citas Médicas', { font: 'Arial', size: 32, bold: true, color: '2B5797' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [txt('Apoyo a la Toma de Decisiones del Departamento de Citas', { font: 'Arial', size: 22, color: '666666', italics: true })],
          }),
          new Paragraph({ spacing: { before: 600 }, children: [] }),
          ...[
            ['Sistema', 'Sistema de Gestión de Citas Médicas'],
            ['Institución', 'Hospital Dr. Salvador Allende'],
            ['Versión', '1.0'],
            ['Fecha de Emisión', 'Julio 2026'],
            ['Clasificación', 'Documento de Usuario Interno'],
            ['Norma de Referencia', 'ISO/IEC 18019:2004 / IEEE 1063-2001'],
          ].map(([k, v]) => new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [bold(`${k}: `, {}), txt(v)],
          })),
          new Paragraph({ children: [new PageBreak()] }),
        ],
      },
      // ── CONTENIDO ──
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [txt('Manual de Usuario — Sistema de Citas Médicas v1.0', { size: 18, color: '999999', italics: true })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { color: 'CCCCCC', style: BorderStyle.SINGLE, size: 1, space: 4 } },
                children: [
                  txt('Hospital Dr. Salvador Allende  |  Página ', { size: 18, color: '999999' }),
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 18, color: '999999' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  return doc;
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Generador de Manual — Hospital S. Allende      ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  if (!fs.existsSync(MD_PATH)) {
    console.error(`✗ No se encontró: ${MD_PATH}`);
    process.exit(1);
  }

  console.log('▸ Leyendo archivo Markdown...');
  const md = fs.readFileSync(MD_PATH, 'utf-8');
  console.log(`  ${md.length} caracteres, ${md.split('\n').length} líneas`);

  console.log('▸ Parseando tokens...');
  const tokens = marked.lexer(md);
  console.log(`  ${tokens.length} tokens encontrados`);

  console.log('▸ Generando diagramas PlantUML...');
  console.log('▸ Construyendo documento Word con formato APA...');

  const doc = await buildDocument(md);

  console.log('▸ Empaquetando archivo .docx...');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_PATH, buffer);

  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
  console.log();
  console.log(`✓ Documento generado:`);
  console.log(`  → ${OUT_PATH}`);
  console.log(`  → ${sizeMB} MB`);

  if (fs.existsSync(PLANTUML_TMP)) {
    const cached = fs.readdirSync(PLANTUML_TMP);
    console.log(`  → ${cached.length} diagramas PlantUML renderizados`);
  }
  console.log();
}

main().catch(e => {
  console.error('✗ Error:', e.message);
  process.exit(1);
});
