import { useMemo, useState } from 'react';
import { Plus, Eye, Trash2, Stethoscope, X } from 'lucide-react';
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
import { useReportableTable } from '@/components/reports/useReportableTable';
import type { ReportableModule } from '@/components/reports/types';
import { useDiagnosticos, useCreateDiagnostico, useDeleteDiagnostico, useEnfermedades, useCreateEnfermedad, useSintomas, useCreateSintoma } from '@/services/useDiagnosticos';
import { useCitas } from '@/services/useCitas';
import { usePacientes } from '@/services/usePacientes';

type Sintoma = { nombre: string; descripcion: string; gravedad: number };

type Diagnostico = {
  id: number;
  numCitaOrigen: string;
  paciente: string;
  pacienteId: number;
  ci: string;
  nombres: string;
  apellidos: string;
  fechaCita: string;
  fechaDiagnostico: string;
  motivo: string;
  tratamientoPrevio: string;
  urgencia: boolean;
  sintomas: Sintoma[];
  enfermedad: { nombre: string; descripcion: string; cronico: boolean };
  enfermedadId: number;
  critico: boolean;
  etapa: string;
  estado: string;
};

const emptySintoma = (): Sintoma => ({ nombre: '', descripcion: '', gravedad: 3 });

const emptyForm = () => ({
  numCitaOrigen: '',
  pacienteId: 0,
  ci: '',
  nombres: '',
  apellidos: '',
  fechaCita: '',
  motivo: '',
  tratamientoPrevio: '',
  urgencia: false,
  sintomas: [emptySintoma()],
  enfermedad: { nombre: '', descripcion: '', cronico: false },
  enfermedadId: 0,
  citaId: 0,
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
      <p className="text-sm font-medium text-foreground">Gravedad: {v}/5</p>
    </div>
  );
}

export function DiagnosticosPage() {
  // API Hooks
  const { data: apiDiagnosticos = [] } = useDiagnosticos();
  const { data: apiEnfermedades = [] } = useEnfermedades();
  const { data: apiSintomas = [] } = useSintomas();
  const { data: apiCitas = [] } = useCitas();
  const { data: apiPacientes = [] } = usePacientes();
  
  const createDiagnostico = useCreateDiagnostico();
  const deleteDiagnostico = useDeleteDiagnostico();
  const createEnfermedad = useCreateEnfermedad();
  const createSintoma = useCreateSintoma();

  // Transform API data to local format
  const diagnosticos: Diagnostico[] = useMemo(() => {
    return apiDiagnosticos.map((d: any, idx: number) => {
      const paciente = apiPacientes.find((p: any) => 
        String(p.pk_num_paciente || p.id) === String(d.fk_ps_b001_num_paciente)
      );
      const enfermedad = apiEnfermedades.find((e: any) => 
        String(e.id || e.pk_num_enfermedad) === String(d.fk_cm_a002_num_enfermedad)
      );
      const cita = apiCitas.find((c: any) => 
        String(c.pk_num_cita_medica || c.pk_num_cita || c.id) === String(d.fk_cm_b002_num_cita_medica)
      );
      
      return {
        id: d.id || d.pk_num_diagnostico_enfermedad || idx + 1,
        numCitaOrigen: `CITA-${cita?.pk_num_cita_medica || cita?.pk_num_cita || cita?.id || idx + 1}`,
        paciente: paciente ? `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim() : 'Sin paciente',
        pacienteId: d.fk_ps_b001_num_paciente || 0,
        ci: paciente?.ci || 'N/D',
        nombres: paciente?.nombres || '',
        apellidos: paciente?.apellidos || '',
        fechaCita: cita?.fecha || '',
        fechaDiagnostico: d.fecha_diagnostico || new Date().toISOString().slice(0, 10),
        motivo: '', // Se puede obtener del motivo de consulta relacionado
        tratamientoPrevio: d.tratamiento || '',
        urgencia: d.critico || false,
        sintomas: [], // Se pueden obtener de la relación diagnóstico-síntoma
        enfermedad: {
          nombre: enfermedad?.nombre || 'Sin especificar',
          descripcion: enfermedad?.descripcion || '',
          cronico: enfermedad?.enfermedad_cronica || false,
        },
        enfermedadId: d.fk_cm_a002_num_enfermedad || 0,
        critico: d.critico || false,
        etapa: d.etapa || 'Inicial',
        estado: 'Activo',
      };
    });
  }, [apiDiagnosticos, apiPacientes, apiEnfermedades, apiCitas]);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [viewing, setViewing] = useState<Diagnostico | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Transform citas for selection dropdown
  const citasDisponibles = useMemo(() => apiCitas.map((c: any, idx: number) => {
    const paciente = apiPacientes.find((p: any) => 
      String(p.pk_num_paciente || p.id) === String(c.fk_ps_b001_num_paciente)
    );
    return {
      id: c.pk_num_cita_medica || c.pk_num_cita || c.id || idx + 1,
      numCita: `CITA-${c.pk_num_cita_medica || c.pk_num_cita || c.id || idx + 1}`,
      ci: paciente?.ci || 'N/D',
      nombres: paciente?.nombres || '',
      apellidos: paciente?.apellidos || '',
      fechaCita: c.fecha || '',
      pacienteId: c.fk_ps_b001_num_paciente,
    };
  }), [apiCitas, apiPacientes]);

  const handleCitaChange = (numCita: string) => {
    const cita = citasDisponibles.find((c: any) => c.numCita === numCita);
    if (cita) {
      setForm(f => ({
        ...f,
        numCitaOrigen: numCita,
        citaId: Number(cita.id),
        pacienteId: cita.pacienteId,
        ci: cita.ci,
        nombres: cita.nombres,
        apellidos: cita.apellidos,
        fechaCita: cita.fechaCita,
      }));
    } else {
      setForm(f => ({ ...f, numCitaOrigen: numCita }));
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
    if (!form.numCitaOrigen) {
      toast.error('Seleccione un Nº de Cita');
      return;
    }
    if (!form.enfermedad.nombre.trim()) {
      toast.error('El nombre del diagnóstico final es obligatorio');
      return;
    }
    setConfirmOpen(true);
  };

  const handleSave = () => {
    if (!form.citaId || !form.pacienteId) {
      toast.error('Debe seleccionar una cita válida');
      return;
    }
    if (!form.enfermedad.nombre.trim()) {
      toast.error('El nombre del diagnóstico final es obligatorio');
      return;
    }

    const avg =
      form.sintomas.length > 0
        ? form.sintomas.reduce((acc, s) => acc + (Number(s.gravedad) || 0), 0) / form.sintomas.length
        : 3;

    const crearDiagnostico = (enfermedadId: number) => {
      createDiagnostico.mutate({
        fk_ps_b001_num_paciente: form.pacienteId,
        fk_cm_a002_num_enfermedad: enfermedadId,
        fk_cm_b002_num_cita_medica: form.citaId,
        critico: avg >= 4 || form.urgencia,
        tratamiento: form.tratamientoPrevio,
        etapa: (avg >= 4 ? 'avanzada' : avg >= 2 ? 'inicial' : 'leve') as 'leve' | 'inicial' | 'avanzada',
        fecha_diagnostico: new Date().toISOString().slice(0, 10),
      }, {
        onSuccess: () => {
          toast.success('Diagnóstico registrado exitosamente');
          setForm(emptyForm());
          setRegisterOpen(false);
          setConfirmOpen(false);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Error al registrar diagnóstico');
        }
      });
    };

    // Si ya se seleccionó una enfermedad existente, usarla directamente
    if (form.enfermedadId && form.enfermedadId > 0) {
      crearDiagnostico(form.enfermedadId);
    } else {
      // Crear la enfermedad primero
      createEnfermedad.mutate({
        nombre: form.enfermedad.nombre,
        enfermedad_cronica: form.enfermedad.cronico,
        descripcion: form.enfermedad.descripcion,
      }, {
        onSuccess: (newEnfermedad: any) => {
          crearDiagnostico(newEnfermedad.id || newEnfermedad.pk_num_enfermedad);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Error al crear enfermedad');
        }
      });
    }
  };

  const viewMeterValue = useMemo(() => {
    if (!viewing) return 3;
    if (viewing.sintomas.length > 0) {
      const avg = viewing.sintomas.reduce((a, s) => a + s.gravedad, 0) / viewing.sintomas.length;
      return Math.round(avg);
    }
    return 3;
  }, [viewing]);

  const diagModule: ReportableModule<Diagnostico> = useMemo(() => ({
    name: 'Diagnósticos',
    itemSingular: 'diagnóstico',
    itemPlural: 'diagnósticos',
    rows: diagnosticos,
    getId: r => r.id,
    fields: [
      { key: 'paciente', label: 'Paciente', accessor: r => r.paciente },
      { key: 'ci', label: 'C.I.', accessor: r => r.ci },
      { key: 'numCitaOrigen', label: 'Nº Cita Origen', accessor: r => r.numCitaOrigen },
      { key: 'enfermedad', label: 'Enfermedad', accessor: r => r.enfermedad.nombre },
      { key: 'motivo', label: 'Motivo', accessor: r => r.motivo },
      { key: 'critico', label: 'Crítico', accessor: r => (r.critico ? 'Sí' : 'No') },
      { key: 'etapa', label: 'Etapa', accessor: r => r.etapa },
      { key: 'fechaDiagnostico', label: 'Fecha Diagnóstico', accessor: r => r.fechaDiagnostico },
      { key: 'estado', label: 'Estado', accessor: r => r.estado },
    ],
    dateField: { accessor: r => r.fechaDiagnostico, label: 'Fecha Diagnóstico' },
    advancedVariant: 'diagnosticos',
    metrics: rows => {
      const total = rows.length;
      const criticos = rows.filter(r => r.critico).length;
      return {
        'Total exportados': total,
        'Casos críticos': criticos,
        '% Críticos': total > 0 ? `${((criticos / total) * 100).toFixed(1)}%` : '0%',
      };
    },
  }), [diagnosticos]);

  const diagReports = useReportableTable({ module: diagModule, visibleRows: diagnosticos });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            Control de Diagnósticos
          </h1>
          <p className="text-muted-foreground">Registro y seguimiento de diagnósticos médicos</p>
        </div>
        <div className="flex items-center gap-2">
          {diagReports.SplitButton}
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => { setForm(emptyForm()); setRegisterOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Diagnóstico
          </Button>
        </div>
      </div>

      {diagReports.ContextBar}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="w-10 px-3 py-2">{diagReports.HeaderCheckbox}</th>
                {['Nº', 'Paciente', 'Nº Cita Origen', 'Enfermedad', 'Crítico', 'Etapa', 'Fecha', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diagnosticos.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-muted-foreground">
                    Sin diagnósticos registrados
                  </td>
                </tr>
              )}
              {diagnosticos.map((d, i) => {
                const selected = diagReports.isRowSelected(d.id);
                return (
                  <tr key={d.id} className={cn('border-t border-border hover:bg-secondary/30', selected && 'bg-primary/10')}>
                    <td className="px-3 py-2"><diagReports.RowCheckbox id={d.id} /></td>
                    <td className="px-3 py-2 text-foreground">{i + 1}</td>
                    <td className="px-3 py-2 text-foreground">{d.paciente}</td>
                    <td className="px-3 py-2 text-foreground font-mono">{d.numCitaOrigen}</td>
                    <td className="px-3 py-2 text-foreground">{d.enfermedad.nombre}</td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        d.critico ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                      )}>
                        {d.critico ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-foreground">{d.etapa}</td>
                    <td className="px-3 py-2 text-muted-foreground">{d.fechaDiagnostico}</td>
                    <td className="px-3 py-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        d.estado === 'Activo' ? 'bg-success/20 text-success' :
                        d.estado === 'Resuelto' ? 'bg-primary/20 text-primary' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {d.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => setViewing(d)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver diagnóstico
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {diagReports.ReportSheet}

      {/* Registrar Diagnóstico */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-card border border-border max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Registrar Diagnóstico</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Complete la información del diagnóstico médico
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nº Cita del Paciente</Label>
                <Select value={form.numCitaOrigen} onValueChange={handleCitaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una cita" />
                  </SelectTrigger>
                  <SelectContent>
                    {citasDisponibles.map((c: any) => (
                      <SelectItem key={c.numCita} value={c.numCita}>
                        {c.numCita} — {c.nombres} {c.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Fecha de Cita</Label>
                <Input value={form.fechaCita} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">C.I.</Label>
                <Input value={form.ci} onChange={e => setForm({ ...form, ci: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nombres</Label>
                <Input value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellidos</Label>
                <Input value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Urgencia</Label>
                <RadioGroup
                  value={form.urgencia ? 'si' : 'no'}
                  onValueChange={v => setForm({ ...form, urgencia: v === 'si' })}
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="si" id="urg-si" />
                    <Label htmlFor="urg-si" className="text-foreground">Sí</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="urg-no" />
                    <Label htmlFor="urg-no" className="text-foreground">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground">Motivo de la Cita</Label>
                <Textarea value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground">Tratamiento Previo</Label>
                <Textarea value={form.tratamientoPrevio} onChange={e => setForm({ ...form, tratamientoPrevio: e.target.value })} />
              </div>
            </div>

            {/* Sintomas */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Síntomas Detectados</h3>
                <Button type="button" size="sm" variant="outline" onClick={addSintoma}>
                  <Plus className="w-4 h-4 mr-1" /> Agregar síntoma
                </Button>
              </div>
              {form.sintomas.map((s, idx) => (
                <div key={idx} className="border border-border rounded-md p-3 space-y-3 bg-secondary/30 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Síntoma {idx + 1}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeSintoma(idx)}
                      disabled={form.sintomas.length === 1}
                      className="h-7 w-7"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Nombre</Label>
                      <Input value={s.nombre} onChange={e => updateSintoma(idx, { nombre: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Descripción</Label>
                      <Input value={s.descripcion} onChange={e => updateSintoma(idx, { descripcion: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Gravedad</Label>
                      <Select value={String(s.gravedad)} onValueChange={v => updateSintoma(idx, { gravedad: Number(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Diagnóstico Final */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Diagnóstico Final</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground">Buscar enfermedad existente</Label>
                  <Select 
                    value={form.enfermedadId ? String(form.enfermedadId) : ''} 
                    onValueChange={(v) => {
                      if (v === 'nueva') {
                        setForm({ ...form, enfermedadId: 0, enfermedad: { nombre: '', descripcion: '', cronico: false } });
                      } else {
                        const enf = apiEnfermedades.find((e: any) => String(e.id || e.pk_num_enfermedad) === v);
                        if (enf) {
                          setForm({ 
                            ...form, 
                            enfermedadId: Number(v),
                            enfermedad: { 
                              nombre: enf.nombre, 
                              descripcion: enf.descripcion || '', 
                              cronico: enf.enfermedad_cronica || false 
                            }
                          });
                        }
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar o escribir nueva" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nueva">+ Nueva enfermedad</SelectItem>
                      {apiEnfermedades.map((e: any) => (
                        <SelectItem key={e.id || e.pk_num_enfermedad} value={String(e.id || e.pk_num_enfermedad)}>
                          {e.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground">Nombre {form.enfermedadId ? '(cargado)' : '(nueva)'}</Label>
                  <Input
                    value={form.enfermedad.nombre}
                    onChange={e => setForm({ ...form, enfermedad: { ...form.enfermedad, nombre: e.target.value } })}
                    placeholder="Nombre de la enfermedad"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-foreground">Crónico</Label>
                  <RadioGroup
                    value={form.enfermedad.cronico ? 'si' : 'no'}
                    onValueChange={v => setForm({ ...form, enfermedad: { ...form.enfermedad, cronico: v === 'si' } })}
                    className="flex gap-4 pt-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="si" id="cron-si" />
                      <Label htmlFor="cron-si" className="text-foreground">Sí</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="cron-no" />
                      <Label htmlFor="cron-no" className="text-foreground">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-foreground">Descripción</Label>
                  <Textarea
                    value={form.enfermedad.descripcion}
                    onChange={e => setForm({ ...form, enfermedad: { ...form.enfermedad, descripcion: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={requestSave}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleSave}
        title="¿Estás seguro?"
        description="Se registrará el diagnóstico con la información ingresada."
      />

      {/* Ver diagnóstico */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-card border border-border max-w-5xl max-h-[92vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">Detalle del Diagnóstico</DialogTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-1 text-sm">
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Nº Cita Paciente: </span>
                    <span className="font-mono">{viewing.numCitaOrigen}</span>
                  </span>
                  <span className="text-foreground">
                    <span className="text-muted-foreground">Fecha de Diagnóstico: </span>
                    {viewing.fechaDiagnostico}
                  </span>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* A */}
                <div className="border border-border rounded-lg p-4 bg-background/40 space-y-2">
                  <h4 className="font-semibold text-foreground mb-2">A. Datos del Paciente</h4>
                  <Row label="Nº Paciente" value={viewing.id.toString()} />
                  <Row label="C.I." value={viewing.ci} />
                  <Row label="Nombre" value={viewing.nombres} />
                  <Row label="Apellido" value={viewing.apellidos} />
                  <Row label="Diagnóstico Presuntivo" value={viewing.enfermedad.nombre} />
                  <Row label="Tratamiento" value={viewing.tratamientoPrevio || 'No especificado'} />
                  <Row label="Urgencia" value={viewing.urgencia ? 'Sí' : 'No'} />
                </div>

                {/* B */}
                <div className="border border-border rounded-lg p-4 bg-background/40 flex flex-col">
                  <h4 className="font-semibold text-foreground mb-2">B. Medidor de Salud</h4>
                  <div className="flex-1 flex items-center justify-center">
                    <HealthMeter value={viewMeterValue} />
                  </div>
                </div>

                {/* C */}
                <div className="border border-border rounded-lg p-4 bg-background/40">
                  <h4 className="font-semibold text-foreground mb-2">C. Síntomas Detectados</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Nombre</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Descripción</th>
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground">Gravedad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewing.sintomas.length === 0 && (
                          <tr><td colSpan={3} className="text-center py-3 text-muted-foreground">Sin síntomas</td></tr>
                        )}
                        {viewing.sintomas.map((s, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="p-2 text-foreground">{s.nombre}</td>
                            <td className="p-2 text-muted-foreground">{s.descripcion}</td>
                            <td className="p-2 text-foreground">{s.gravedad}/5</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* D */}
                <div className="border border-border rounded-lg p-4 bg-background/40 space-y-2">
                  <h4 className="font-semibold text-foreground mb-2">D. Enfermedad Determinada</h4>
                  <Row label="Nombre" value={viewing.enfermedad.nombre} />
                  <Row label="Descripción" value={viewing.enfermedad.descripcion || '—'} />
                  <Row label="Crónica" value={viewing.enfermedad.cronico ? 'Sí' : 'No'} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground text-right break-words">{value}</span>
    </div>
  );
}
