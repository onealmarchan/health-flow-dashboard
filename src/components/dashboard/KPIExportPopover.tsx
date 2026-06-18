import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun } from 'docx';
import { summaryForKPI } from './kpiCatalog';

type Fmt = 'png' | 'pdf' | 'docx';

interface Props {
  kpiId: string;
  kpiLabel: string;
  /** ref to the chart container to snapshot. */
  targetRef: React.RefObject<HTMLElement>;
}

async function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export function KPIExportPopover({ kpiId, kpiLabel, targetRef }: Props) {
  const [open, setOpen] = useState(false);
  const [picks, setPicks] = useState<Set<Fmt>>(new Set(['png']));
  const [includeSummary, setIncludeSummary] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = (f: Fmt) => {
    setPicks(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!targetRef.current || picks.size === 0) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(targetRef.current, { cacheBust: true, backgroundColor: 'white', pixelRatio: 2 });
      const summary = includeSummary ? summaryForKPI(kpiId) : '';
      const safe = kpiLabel.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
      const stamp = new Date().toISOString().slice(0, 10);
      const base = `${safe}_${stamp}`;

      if (picks.has('png')) {
        const blob = await (await fetch(dataUrl)).blob();
        await triggerDownload(blob, `${base}.png`);
      }

      if (picks.has('pdf')) {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        doc.setFontSize(14);
        doc.text(kpiLabel, 40, 40);
        const props = doc.getImageProperties(dataUrl);
        const pageW = doc.internal.pageSize.getWidth() - 80;
        const ratio = props.height / props.width;
        const w = pageW, h = w * ratio;
        doc.addImage(dataUrl, 'PNG', 40, 60, w, Math.min(h, 400));
        if (summary) {
          doc.setFontSize(10);
          doc.text(summary, 40, 60 + Math.min(h, 400) + 24, { maxWidth: pageW });
        }
        doc.save(`${base}.pdf`);
      }

      if (picks.has('docx')) {
        const b64 = dataUrl.split(',')[1];
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const doc = new Document({
          sections: [{
            children: [
              new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(kpiLabel)] }),
              new Paragraph({
                children: [new ImageRun({
                  type: 'png',
                  data: bytes,
                  transformation: { width: 560, height: 320 },
                  altText: { title: kpiLabel, description: kpiLabel, name: kpiLabel },
                })],
              }),
              ...(summary ? [new Paragraph(summary)] : []),
            ],
          }],
        });
        const blob = await Packer.toBlob(doc);
        await triggerDownload(blob, `${base}.docx`);
      }

      toast.success('Reporte generado correctamente');
      setOpen(false);
    } catch (e) {
      toast.error('No se pudo generar el informe.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Exportar"
          className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6}
        className="w-64 p-3 bg-popover border-2 border-primary/40 z-50 space-y-3">
        <div className="text-xs font-semibold text-foreground">
          Exportar · <span className="text-primary">{kpiLabel}</span>
        </div>
        <div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase mb-1.5">Formato</div>
          <div className="flex gap-1.5">
            {(['png', 'pdf', 'docx'] as Fmt[]).map(f => (
              <button
                key={f} type="button" onClick={() => toggle(f)}
                className={cn(
                  'flex-1 px-2 py-1 rounded-md border text-xs font-medium transition-colors',
                  picks.has(f)
                    ? 'bg-primary/15 border-primary text-primary'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-border" />
        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
          <Checkbox checked={includeSummary} onCheckedChange={v => setIncludeSummary(v === true)} />
          <span>Incluir resumen de datos</span>
        </label>
        <Button
          onClick={handleGenerate}
          disabled={picks.size === 0 || busy}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          size="sm"
        >
          {busy ? 'Generando…' : 'Generar informe'}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
