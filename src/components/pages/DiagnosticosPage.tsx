import { useMemo, useState } from 'react';
import { Plus, Eye, Trash2, Stethoscope, Loader2, AlertCircle, RefreshCw, PenSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { cn } from '@/lib/utils';
import { useDiagnosticos, useCitasMedicas, useCreateDiagnostico, useUpdateDiagnostico } from '@/hooks/useDiagnosticos';

type Sintoma = { nombre: string; descripcion: string; gravedad: number };

const emptySintoma = (): Sintoma => ({ nombre: '', descripcion: '', gravedad: 3 });

const emptyForm = () => ({
  citaId: '',
  ci: '',
  nombres: '',
  apellidos: '',
  fechaCita: '',
  motivo: '',
  tratamientoPrevio: '',
  urgencia: false,
  sintomas: [emptySintoma()],
  enfermedad: { nombre: '', descripcion: '', cronico: false },
});

// ---------- HealthMeter ----------
const meterMap: Record<number, { color: string; emoji: string }> = {
  1: { color: 'bg-red-500', emoji: '😫' },
  2: { color: 'bg-orange-500', emoji: '😟' },
  3: { color: 'bg-yellow-400', emoji: '😐' },
  4: { color: 'bg-blue-500', emoji: '🙂' },
  5: { color: 'bg-green-500', emoji: '😁' },
};

function HealthMeter({ value }: { value: number }) {
  const v = Math.min(5, Math.max(1, Math.round(value)));
  const { color, emoji } = meterMap[v];
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex items-end gap-4">
        <div className="relative w-12 h-48 rounded-full border border-border bg-muted overflow-hidden">
          <div
            className={cn('absolute bottom-0 left-0 w-full transition-all duration-500', color)}
            style={{ height: `${v * 20}%` }}
          />
        </div>
        <span className="text-5xl leading-none">{emoji}</span>
      </div>
      <p className="text-sm font-medium text-foreground">Gravedad General: {v}/5</p>
    </div>
  );
}

export function DiagnosticosPage() {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [completeFinalOpen, setCompleteFinalOpen] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  // API Hooks
  const { data: diagnosticos = [], isLoading, isError, error, refetch } = useDiagnosticos();
  const { data: citas = [], isLoading: isLoadingCitas } = useCitasMedicas();
  
  const createMutation = useCreateDiagnostico();
  const updateMutation = useUpdateDiagnostico();

  const handleCitaChange = (citaId: string) => {
    const cita = citas.find((c: any) => c.pk_num_cita_medica.toString() === citaId);
    if (cita && cita.paciente) {
      setForm(f => ({
        ...f,
        citaId,
        ci: cita.paciente.ci || '',
        nombres: cita.paciente.nombres || '',
        apellidos: cita.paciente.apellidos || '',
        fechaCita: cita.fecha || '',
      }));
    } else {
      setForm(f => ({ ...f, citaId }));
    }
  };

  const addSintoma = () => setForm(f => ({ ...f, sintomas: [...f.sintomas, emptySintoma()] }));
  const removeSintoma = (idx: number) =>
    setForm(f => ({ ...f, sintomas: f.sintomas.filter((_, i) => i !== idx) }));
  const updateSintoma = (idx: number, patch: Partial<Sintoma>) =>
    setForm(f => ({
      ...f,
      sintomas: f.sintomas.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  const requestSave = () => {
    if (!form.citaId) {
      toast.error('Seleccione un Nº de Cita para vincular este diagnóstico');
      return;
    }
    setConfirmOpen(true);
  };

  // CREATE INICIAL
  const handleSave = () => {
    // Calculo critico front-end por experiencia
    const avg = form.sintomas.length > 0
        ? form.sintomas.reduce((acc, s) => acc + (Number(s.gravedad) || 0), 0) / form.sintomas.length
        : 3;
        
    const payload = {
       fk_cm_b002_num_cita_medica: parseInt(form.citaId, 10),
       motivo: form.motivo,
       tratamiento: form.tratamientoPrevio,
       urgencia: form.urgencia,
       critico: avg >= 4 || form.urgencia,
       sintomas: form.sintomas, // Backend lo procesa
       enfermedad: form.enfermedad, // Backend decide a crear
    };
    
    createMutation.mutate(payload, {
       onSuccess: () => {
         setForm(emptyForm());
         setRegisterOpen(false);
         setConfirmOpen(false);
       }
    });
  };

  // UPDATE FINAL
  const handleUpdateFinal = () => {
     if (!form.enfermedad.nombre.trim()) {
        toast.error('Indique un nombre de enfermedad definitiva');
        return;
     }
     
     const payload = {
        etapa: 'Final',
        enfermedad: form.enfermedad
     };
     
     updateMutation.mutate({ id: viewing.pk_num_diagnostico_enfermedad, data: payload }, {
         onSuccess: () => {
            setCompleteFinalOpen(false);
            setViewing(null);
            setForm(emptyForm());
         }
     });
  };

  const viewMeterValue = useMemo(() => {
    if (!viewing || !viewing.sintomas) return 3;
    if (viewing.sintomas.length > 0) {
      const avg = viewing.sintomas.reduce((a: number, s: any) => a + (Number(s.gravedad) || 2), 0) / viewing.sintomas.length;
      return Math.round(avg);
    }
    return 3;
  }, [viewing]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Cargando histórico de diagnósticos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <p className="text-foreground text-lg font-semibold">Error al cargar diagnósticos</p>
        <p className="text-muted-foreground text-sm max-w-md text-center">
          {error instanceof Error ? error.message : 'Error desconocido de red.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            Control de Diagnósticos
          </h1>
          <p className="text-muted-foreground">Registro de dictámenes iniciales y finales</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => { setForm(emptyForm()); setRegisterOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Diagnóstico Inicial
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {['Nº', 'Paciente', 'Cita Referencia', 'Afección / Enfermedad', 'Severo', 'Fase', 'Fecha', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diagnosticos.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    <Stethoscope className="w-12 h-12 opacity-20 mx-auto mb-3" />
                    Sin historial de diagnósticos médicos
                  </td>
                </tr>
              )}
              {diagnosticos.map((d: any, i: number) => {
                 const pacNombre = d.paciente ? `${d.paciente.nombres} ${d.paciente.apellidos}` : 'No disponible';
                 const esPendienteFinal = d.etapa === 'Final' && d.estado?.toLowerCase() === 'pendiente';
                 
                 return (
                  <tr key={d.pk_num_diagnostico_enfermedad} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-3 py-2 text-foreground font-mono">{i + 1}</td>
                    <td className="px-3 py-2 text-foreground truncate max-w-[200px]">{pacNombre}</td>
                    <td className="px-3 py-2 text-muted-foreground font-mono">CITA-{d.fk_cm_b002_num_cita_medica}</td>
                    <td className="px-3 py-2 text-foreground flex items-center gap-2">
                       {esPendienteFinal ? <span className="text-orange-500 font-medium italic">Sin dictamen</span> : (d.enfermedad?.nombre || '—')}
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        d.critico ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                      )}>
                        {d.critico ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">
                       {d.etapa === 'Inicial' ? <span className="text-blue-500">Inicial</span> : <span className="text-indigo-500">Final</span>}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{d.fecha_diagnostico || 'N/A'}</td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
                        d.estado === 'Activo' || d.estado === 'Completado' ? 'bg-success/20 text-success' :
                        d.estado === 'Pendiente' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {d.estado || 'Activo'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {esPendienteFinal ? (
                        <Button size="sm" variant="default" className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => { setViewing(d); setCompleteFinalOpen(true); }}>
                           <PenSquare className="w-3 h-3 mr-1" /> Rellenar Final
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full" onClick={() => setViewing(d)}>
                           <Eye className="w-3 h-3 mr-1" /> Inspeccionar
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR INICIAL */}
      <Dialog open={registerOpen} onOpenChange={(o) => { if(!createMutation.isPending) setRegisterOpen(o)}}>
        <DialogContent className="bg-card border border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Diagnóstico Clínico Inicial</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Toma de síntomas e indicadores presuntivos. Esto creará el latente para el final de forma delegada en backend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Vincular a Cita Activa</Label>
                <Select value={form.citaId} onValueChange={handleCitaChange} disabled={isLoadingCitas || createMutation.isPending}>
                  <SelectTrigger>
                     <SelectValue placeholder={isLoadingCitas ? "Cargando..." : "Seleccione cita vinculante..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {citas.map((c: any) => (
                       <SelectItem key={c.pk_num_cita_medica} value={c.pk_num_cita_medica.toString()}>
                         CITA-{c.pk_num_cita_medica} | {c.paciente?.nombres} {c.paciente?.apellidos}
                       </SelectItem>
                    ))}
                    {citas.length === 0 && <SelectItem value="na" disabled>No hay citas agendadas</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Fecha Original de Cita</Label>
                <Input value={form.fechaCita} readOnly disabled className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Identidad del Paciente</Label>
                <Input value={form.ci} readOnly disabled className="bg-secondary/50 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Urgencia Detectada</Label>
                <RadioGroup
                  value={form.urgencia ? 'si' : 'no'}
                  onValueChange={v => setForm({ ...form, urgencia: v === 'si' })}
                  className="flex gap-4 pt-2"
                  disabled={createMutation.isPending}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="si" id="urg-si" />
                    <Label htmlFor="urg-si" className="text-destructive font-medium">Sí (Crítico)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="urg-no" />
                    <Label htmlFor="urg-no" className="text-foreground">Moderada/No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground">Tratamiento o Medicación Previa</Label>
                <Textarea value={form.tratamientoPrevio} onChange={e => setForm({ ...form, tratamientoPrevio: e.target.value })} disabled={createMutation.isPending} placeholder="El paciente indicó haber tomado..." />
              </div>
            </div>

            {/* Sintomas */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Relato de Síntomas</h3>
                <Button type="button" size="sm" variant="outline" onClick={addSintoma} disabled={createMutation.isPending}>
                  <Plus className="w-3 h-3 mr-1" /> Añadir otro
                </Button>
              </div>
              {form.sintomas.map((s, idx) => (
                <div key={idx} className="border border-border rounded-md p-3 space-y-3 bg-secondary/30 relative">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dolencia {idx + 1}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeSintoma(idx)}
                      disabled={form.sintomas.length === 1 || createMutation.isPending}
                      className="h-6 w-6 text-destructive hover:bg-destructive hover:text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Ocurrencia</Label>
                      <Input value={s.nombre} onChange={e => updateSintoma(idx, { nombre: e.target.value })} placeholder="Ej. Jaqueca" disabled={createMutation.isPending} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Clarificación</Label>
                      <Input value={s.descripcion} onChange={e => updateSintoma(idx, { descripcion: e.target.value })} placeholder="Ej. Constante y pulsátil" disabled={createMutation.isPending} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Intensidad</Label>
                      <Select value={String(s.gravedad)} onValueChange={v => updateSintoma(idx, { gravedad: Number(v) })} disabled={createMutation.isPending}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(n => (
                            <SelectItem key={n} value={String(n)}>{n} - {n===1?'Leve':n===5?'Severo':'Moderado'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Opcional: Enfermedad Presuntiva */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Enfermedad Presuntiva <span className="text-muted-foreground font-normal text-xs">(Opcional en fase inicial)</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground">Nombre / Sospecha</Label>
                  <Input
                    value={form.enfermedad.nombre}
                    onChange={e => setForm({ ...form, enfermedad: { ...form.enfermedad, nombre: e.target.value } })}
                    placeholder="Sospecha clínica..."
                  />
                </div>
              </div>
            </div>
            
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setRegisterOpen(false)} disabled={createMutation.isPending}>Abortar</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-32" onClick={requestSave} disabled={createMutation.isPending}>
               {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Archivar Inicial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* MODAL COMPLETAR DIAGNÓSTICO FINAL */}
      <Dialog open={completeFinalOpen} onOpenChange={(o) => { if(!updateMutation.isPending) setCompleteFinalOpen(o)}}>
        <DialogContent className="bg-card border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] max-w-xl">
           <DialogHeader>
             <DialogTitle className="text-orange-500 flex items-center gap-2">
                 <PenSquare className="w-5 h-5" /> Determinar Fallo Final
             </DialogTitle>
             <DialogDescription className="text-muted-foreground pt-1">
                 Usted va a liquidar el dictamen final pendiente para la cita médica referenciada. Por favor tipifique la enfermedad definitiva.
             </DialogDescription>
           </DialogHeader>
           
           <div className="space-y-4 py-4 rounded-md">
             <div className="bg-orange-500/10 p-3 rounded-md border border-orange-500/20 mb-4">
                 <p className="text-xs text-orange-600 font-mono">REFERENCIA: CITA-{viewing?.fk_cm_b002_num_cita_medica}</p>
                 <p className="text-sm font-semibold text-foreground mt-1">Paciente: {viewing?.paciente?.nombres} {viewing?.paciente?.apellidos}</p>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <Label className="text-foreground">Enfermedad Exacta</Label>
                  <Input
                    value={form.enfermedad.nombre}
                    onChange={e => setForm({ ...form, enfermedad: { ...form.enfermedad, nombre: e.target.value } })}
                    placeholder="Escriba condición definitiva ej. Diabetes Mellitus Tipo 2"
                    className="border-primary focus-visible:ring-primary"
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-start">
                  <Label className="text-foreground mb-2">¿Es condición Crónica?</Label>
                  <RadioGroup
                    value={form.enfermedad.cronico ? 'si' : 'no'}
                    onValueChange={v => setForm({ ...form, enfermedad: { ...form.enfermedad, cronico: v === 'si' } })}
                    className="flex gap-4"
                    disabled={updateMutation.isPending}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="si" id="fcron-si" />
                      <Label htmlFor="fcron-si" className="text-destructive font-medium cursor-pointer">Sí, incurable o prolongada</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="fcron-no" />
                      <Label htmlFor="fcron-no" className="text-foreground cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-1 mt-2">
                  <Label className="text-foreground">Dictamen o Anotaciones Finales</Label>
                  <Textarea
                    value={form.enfermedad.descripcion}
                    onChange={e => setForm({ ...form, enfermedad: { ...form.enfermedad, descripcion: e.target.value } })}
                    placeholder="El tratamiento a seguir constará de..."
                    disabled={updateMutation.isPending}
                    rows={4}
                  />
                </div>
              </div>
           </div>
           
           <DialogFooter>
             <Button variant="ghost" onClick={() => { setCompleteFinalOpen(false); setForm(emptyForm()); }} disabled={updateMutation.isPending}>Cancelar</Button>
             <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleUpdateFinal} disabled={updateMutation.isPending}>
               {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Sellar Diagnóstico
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleSave}
        title="Validación Previa"
        description="Se rubricará este ingreso como 'Diagnóstico Inicial' y el backend aprovisionará la etapa Final subyacente. ¿Desea proceder?"
      />

      {/* Ver diagnóstico completo (Solo lectura) */}
      <Dialog open={!!viewing && !completeFinalOpen} onOpenChange={(o) => { if (!o) { setViewing(null); } }}>
        <DialogContent className="bg-card border border-border max-w-5xl max-h-[92vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <DialogTitle className="text-foreground text-xl flex items-center gap-2">
                            Apertura de Dictamen
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm",
                                viewing.etapa === 'Inicial' ? "bg-blue-500/20 text-blue-500" : "bg-indigo-500/20 text-indigo-500"
                            )}>{viewing.etapa}</span>
                        </DialogTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-2 text-sm">
                          <span className="text-foreground">
                            <span className="text-muted-foreground mr-1">Correlativo Cita: </span>
                            <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">CITA-{viewing.fk_cm_b002_num_cita_medica}</span>
                          </span>
                          <span className="text-foreground">
                            <span className="text-muted-foreground mr-1">Instaurado: </span>
                            <span className="font-medium">{viewing.fecha_diagnostico || 'Reciente'}</span>
                          </span>
                        </div>
                    </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                {/* A */}
                <div className="border border-border rounded-lg p-5 bg-background shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -z-10" />
                  <h4 className="font-bold text-primary text-sm flex items-center border-b border-border pb-2">
                     <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center mr-2 text-primary">A</span> Ficha del Solicitante
                  </h4>
                  <Row label="Nº Identidad" value={viewing.paciente?.ci} />
                  <Row label="Paciente" value={`${viewing.paciente?.nombres} ${viewing.paciente?.apellidos}`} />
                  <Row label="Tratamiento Base" value={viewing.tratamiento || 'Ninguno prescrito previamente'} />
                  <Row label="Estado Crítico" value={viewing.critico ? 'Sí' : 'No'} isCritical={viewing.critico} />
                </div>

                {/* B */}
                <div className="border border-border rounded-lg p-5 bg-background shadow-sm flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-bl-full -z-10" />
                  <h4 className="font-bold text-success text-sm flex items-center border-b border-border pb-2 mb-4">
                     <span className="w-5 h-5 rounded bg-success/20 flex items-center justify-center mr-2 text-success">B</span> Escala de Severidad
                  </h4>
                  <div className="flex-1 flex items-center justify-center scale-90 origin-top">
                    {viewing.sintomas && viewing.sintomas.length > 0 ? (
                        <HealthMeter value={viewMeterValue} />
                    ) : (
                        <div className="text-center text-muted-foreground flex flex-col items-center">
                           <span className="text-4xl mb-2">😴</span>
                           <p className="text-sm">Sin sintomatología tabulada</p>
                        </div>
                    )}
                  </div>
                </div>

                {/* C */}
                <div className="border border-border rounded-lg p-5 bg-background shadow-sm md:col-span-2 relative">
                  <h4 className="font-bold text-orange-500 text-sm flex items-center border-b border-border pb-2 mb-3">
                     <span className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center mr-2 text-orange-500">C</span> Bitácora Sintomática
                  </h4>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left p-2.5 text-xs font-semibold text-foreground">Signo Clínico</th>
                          <th className="text-left p-2.5 text-xs font-semibold text-foreground w-1/2">Desglose Referido</th>
                          <th className="text-center p-2.5 text-xs font-semibold text-foreground">Coef. Impacto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!viewing.sintomas || viewing.sintomas.length === 0 ? (
                          <tr><td colSpan={3} className="text-center py-6 text-muted-foreground bg-background/50 italic">Sin evidencias recolectadas</td></tr>
                        ) : viewing.sintomas.map((s: any, i: number) => (
                          <tr key={i} className="border-t border-border bg-background hover:bg-secondary/20">
                            <td className="p-2.5 text-foreground font-medium">{s.nombre || s.Sintoma?.nombre}</td>
                            <td className="p-2.5 text-muted-foreground">{s.descripcion || s.observacion}</td>
                            <td className="p-2.5 text-center">
                                <span className={cn(
                                    "px-2 py-0.5 rounded font-mono text-xs",
                                    (s.gravedad || s.nivel) >= 4 ? "bg-red-500/20 text-red-500" :
                                    (s.gravedad || s.nivel) >= 3 ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500"
                                )}>{(s.gravedad || s.nivel || 1)}/5</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* D */}
                <div className="border border-border rounded-lg p-5 bg-background shadow-sm md:col-span-2 relative">
                  <h4 className="font-bold text-indigo-500 text-sm flex items-center border-b border-border pb-2 mb-3">
                     <span className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center mr-2 text-indigo-500">D</span> Fallo Patológico
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      <Row label="Tipificación Exacta" value={viewing.enfermedad?.nombre || 'Indeterminada / A evaluar'} />
                      <Row label="Condición Crónica" value={viewing.enfermedad?.enfermedad_cronico ? 'Positivo' : 'Negativo'} isCritical={viewing.enfermedad?.enfermedad_cronico} />
                      <div className="md:col-span-2 pt-2 mt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Notas Oficiales del Fallo</span>
                          <p className="text-sm text-foreground bg-secondary/30 p-3 rounded-md border border-border leading-relaxed">
                            {viewing.enfermedad?.descripcion || 'Sin observaciones dictaminadas en acta.'}
                          </p>
                      </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, isCritical }: { label: string; value: string; isCritical?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-sm border-b border-border/30 pb-2 border-dashed">
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn("text-right break-words font-medium", isCritical ? "text-destructive" : "text-foreground")}>{value}</span>
    </div>
  );
}
