import { useState } from 'react';
import { Download, Upload, ChevronDown, DatabaseBackup } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportBackup, importBackup, type BackupFormat } from '@/services/backup';

interface BackupActionsProps {
  className?: string;
}

export function BackupActions({ className }: BackupActionsProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'import' | 'export'>('import');
  const [format, setFormat] = useState<BackupFormat>('json');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExport = async (fmt: BackupFormat) => {
    try {
      setIsSubmitting(true);
      await exportBackup(fmt);
      toast({ title: 'Respaldo exportado', description: `El respaldo en ${fmt.toUpperCase()} se descargó correctamente.` });
    } catch (error: any) {
      toast({ title: 'No se pudo exportar', description: error?.message || 'Revisa la conexión con el servidor.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({ title: 'Selecciona un archivo', description: 'Adjunta un respaldo para continuar.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await importBackup(format, selectedFile);
      toast({ title: 'Respaldo importado', description: `El archivo ${selectedFile.name} se procesó correctamente.` });
      setOpen(false);
      setSelectedFile(null);
    } catch (error: any) {
      toast({ title: 'No se pudo importar', description: error?.message || 'El archivo no pudo procesarse.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <DatabaseBackup className="h-4 w-4" />
            Respaldo
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover border border-border z-[60]">
          <DropdownMenuItem onClick={() => { setMode('export'); setFormat('json'); setOpen(true); }}>
            <Download className="mr-2 h-4 w-4" /> Exportar JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setMode('export'); setFormat('csv'); setOpen(true); }}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setMode('import'); setFormat('json'); setOpen(true); }}>
            <Upload className="mr-2 h-4 w-4" /> Importar JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setMode('import'); setFormat('csv'); setOpen(true); }}>
            <Upload className="mr-2 h-4 w-4" /> Importar CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === 'export' ? 'Exportar respaldo' : 'Importar respaldo'}</DialogTitle>
            <DialogDescription>
              {mode === 'export'
                ? `Genera un respaldo en formato ${format.toUpperCase()} para descargar.`
                : `Sube un archivo en formato ${format.toUpperCase()} para restaurar el respaldo.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {mode === 'export' ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                El archivo se descargará automáticamente en formato {format.toUpperCase()}.
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Archivo de respaldo</label>
                <input
                  type="file"
                  accept={format === 'csv' ? '.csv' : '.json'}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                />
                <p className="text-xs text-muted-foreground">Solo se aceptan archivos con extensión .{format}.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            {mode === 'export' ? (
              <Button onClick={() => handleExport(format)} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : `Exportar ${format.toUpperCase()}`}
              </Button>
            ) : (
              <Button onClick={handleImport} disabled={isSubmitting || !selectedFile}>
                {isSubmitting ? 'Importando...' : `Importar ${format.toUpperCase()}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
