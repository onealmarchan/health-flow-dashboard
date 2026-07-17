import { useMemo, useState, useEffect } from 'react';
import { Plus, Eye, Trash2, Stethoscope, X, Loader2, Search } from 'lucide-react';
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
import { SearchBar } from '@/components/shared/SearchBar';
import { FiltersButton } from '@/components/shared/FiltersButton';
import { TablePagination } from '@/components/shared/TablePagination';
import { cn } from '@/lib/utils';
import { useReportableTable } from '@/components/reports/useReportableTable';
import type { ReportableModule } from '@/components/reports/types';
import { useDiagnosticos, useCreateDiagnostico, useDeleteDiagnostico, useEnfermedades, useCreateEnfermedad, useSintomas, useCreateSintoma, useCreateDiagnosticoSintoma, useDiagnosticoSintomas } from '@/services/useDiagnosticos';
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
  etapa: '' as '' | 'leve' | 'inicial' | 'avanzada',
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
  const { data: apiDiagnosticos = [], isLoading } = useDiagnosticos();
  const { data: apiEnfermedades = [] } = useEnfermedades();
  const { data: apiSintomas = [] } = useSintomas();
  const { data: apiCitas = [] } = useCitas();
  const { data: apiPacientes = [] } = usePacientes();
  const { data: apiDiagnosticoSintomas = [] } = useDiagnosticoSintomas();
  
  const createDiagnostico = useCreateDiagnostico();
  const deleteDiagnostico = useDeleteDiagnostico();
  const createEnfermedad = useCreateEnfermedad();
  const createSintoma = useCreateSintoma();
  const createDiagnosticoSintoma = useCreateDiagnosticoSintoma();

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
        id: d.id || d.pk_num_diagnostico || idx + 1,
        numCitaOrigen: `CITA-${cita?.pk_num_cita_medica || cita?.pk_num_cita || cita?.id || idx + 1}`,
        paciente: paciente ? `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim() : 'Sin paciente',
        pacienteId: Number(d.fk_ps_b001_num_paciente) || 0,
        ci: paciente?.ci || 'N/D',
        nombres: paciente?.nombres || '',
        apellidos: paciente?.apellidos || '',
        fechaCita: cita?.fecha || '',
        fechaDiagnostico: d.fecha_diagnostico || new Date().toISOString().slice(0, 10),
        motivo: '', // Se puede obtener del motivo de consulta relacionado
        tratamientoPrevio: d.tratamiento || '',
        urgencia: d.critico || false,
        sintomas: apiDiagnosticoSintomas
          .filter((ds: any) => String(ds.fk_cm_b003_num_diagnostico) === String(d.pk_num_diagnostico || d.id))
          .map((ds: any) => ({
            nombre: ds.sintoma?.nombre || '',
            descripcion: ds.sintoma?.descripcion || '',
            gravedad: Number(ds.sintoma?.gravedad) || 3,
          })),
        enfermedad: {
          nombre: enfermedad?.nombre || 'Sin especificar',
          descripcion: enfermedad?.descripcion || '',
          cronico: enfermedad?.enfermedad_cronica || false,
        },
        enfermedadId: d.fk_cm_a002_num_enfermedad || 0,
        critico: d.critico || false,
        etapa: d.etapa || 'inicial',
        estado: 'Activo',
      };
    });
  }, [apiDiagnosticos, apiPacientes, apiEnfermedades, apiCitas, apiDiagnosticoSintomas]);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [viewing, setViewing] = useState<Diagnostico | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEtapa, setFilterEtapa] = useState<string>('todas');
  const [filterCriticidad, setFilterCriticidad] = useState<string>('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      pacienteId: Number(c.fk_ps_b001_num_paciente),
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

  const handleSave = async () => {
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

    const etapaCalculada = form.etapa || (avg >= 4 ? 'avanzada' : avg >= 2 ? 'inicial' : 'leve') as 'leve' | 'inicial' | 'avanzada';

    try {
      let enfermedadId = form.enfermedadId;

      if (!enfermedadId || enfermedadId <= 0) {
        const newEnfermedad: any = await createEnfermedad.mutateAsync({
          nombre: form.enfermedad.nombre,
          enfermedad_cronica: form.enfermedad.cronico,
          descripcion: form.enfermedad.descripcion,
        });
        enfermedadId = newEnfermedad?.id || newEnfermedad?.pk_num_enfermedad;
        if (!enfermedadId) {
          toast.error('No se pudo crear la enfermedad');
          return;
        }
      }

      const res: any = await createDiagnostico.mutateAsync({
        fk_ps_b001_num_paciente: Number(form.pacienteId),
        fk_cm_a002_num_enfermedad: enfermedadId,
        fk_cm_b002_num_cita_medica: form.citaId,
        critico: avg >= 4 || form.urgencia,
        tratamiento: form.tratamientoPrevio,
        etapa: etapaCalculada,
        fecha_diagnostico: new Date().toISOString().slice(0, 10),
      });

      const diagnosticoId = res?.pk_num_diagnostico || res?.id;
      if (diagnosticoId && form.sintomas.length > 0) {
        for (const s of form.sintomas) {
          if (!s.nombre.trim()) continue;
          try {
            const sintomaRes: any = await createSintoma.mutateAsync({
              nombre: s.nombre,
              descripcion: s.descripcion,
              gravedad: String(Math.min(5, Math.max(1, Math.round(s.gravedad)))) as '1' | '2' | '3' | '4' | '5',
            });
            const sintomaId = sintomaRes?.id || sintomaRes?.pk_num_sintoma;
            if (sintomaId) {
              await createDiagnosticoSintoma.mutateAsync({
                fk_cm_b003_num_diagnostico: diagnosticoId,
                fk_cm_a003_num_sintoma: sintomaId,
              });
            }
          } catch {
            // Symptom creation is best-effort; don't block the diagnosis
          }
        }
      }

      toast.success('Diagnóstico registrado exitosamente');
      setForm(emptyForm());
      setRegisterOpen(false);
      setConfirmOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al registrar diagnóstico');
    }
  };

  const symptomAvg = useMemo(() => {
    if (form.sintomas.length === 0) return 3;
    return form.sintomas.reduce((acc, s) => acc + (Number(s.gravedad) || 0), 0) / form.sintomas.length;
  }, [form.sintomas]);

  const viewMeterValue = useMemo(() => {
    if (!viewing) return 3;
    if (viewing.sintomas.length > 0) {
      const avg = viewing.sintomas.reduce((a, s) => a + s.gravedad, 0) / viewing.sintomas.length;
      return Math.round(avg);
    }
    return 3;
  }, [viewing]);

  const filteredDiagnosticos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return diagnosticos.filter(d => {
      if (filterEtapa !== 'todas' && d.etapa.toLowerCase() !== filterEtapa) return false;
      if (filterCriticidad === 'criticos' && !d.critico) return false;
      if (filterCriticidad === 'no-criticos' && d.critico) return false;
      if (!q) return true;
      return (
        d.paciente.toLowerCase().includes(q) ||
        d.enfermedad.nombre.toLowerCase().includes(q) ||
        d.numCitaOrigen.toLowerCase().includes(q) ||
        d.ci.toLowerCase().includes(q)
      );
    });
  }, [diagnosticos, search, filterEtapa, filterCriticidad]);

  const totalPages = Math.max(1, Math.ceil(filteredDiagnosticos.length / itemsPerPage));
  const paginatedDiagnosticos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDiagnosticos.slice(start, start + itemsPerPage);
  }, [filteredDiagnosticos, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search, filterEtapa, filterCriticidad]);

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

  const diagReports = useReportableTable({ module: diagModule, visibleRows: filteredDiagnosticos });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Control de Diagnósticos
          </h1>
          <p className="text-sm text-muted-foreground">Registro y seguimiento de diagnósticos médicos</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {diagReports.SplitButton}
          <Button
            size="sm"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={() => { setForm(emptyForm()); setRegisterOpen(true); }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Registrar Diagnóstico
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Buscar por paciente, enfermedad o cita..." />
        <FiltersButton onClear={() => { setFilterEtapa('todas'); setFilterCriticidad('todas'); }}>
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Etapa</Label>
            <Select value={filterEtapa} onValueChange={setFilterEtapa}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-[60]">
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="inicial">Inicial</SelectItem>
                <SelectItem value="avanzada">Avanzada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Criticidad</Label>
            <Select value={filterCriticidad} onValueChange={setFilterCriticidad}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-[60]">
                <SelectItem value="todas">Todos</SelectItem>
                <SelectItem value="criticos">Críticos</SelectItem>
                <SelectItem value="no-criticos">No críticos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FiltersButton>
      </div>

      {diagReports.ContextBar}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando diagnósticos...</span>
            </div>
          ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 px-3 py-2.5">{diagReports.HeaderCheckbox}</th>
                {['Nº', 'Paciente', 'Nº Cita Origen', 'Enfermedad', 'Crítico', 'Etapa', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedDiagnosticos.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    {filteredDiagnosticos.length === 0 ? 'No se encontraron diagnósticos' : 'Sin diagnósticos registrados'}
                  </td>
                </tr>
              )}
              {paginatedDiagnosticos.map((d, i) => {
                const selected = diagReports.isRowSelected(d.id);
                const rowNum = (currentPage - 1) * itemsPerPage + i + 1;
                return (
                  <tr key={d.id} className={cn(
                    'border-t border-border/50 transition-colors hover:bg-secondary/30',
                    selected && 'bg-primary/10'
                  )}>
                    <td className="px-3 py-2.5"><diagReports.RowCheckbox id={d.id} /></td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{rowNum}</td>
                    <td className="px-3 py-2.5 text-foreground font-medium">{d.paciente}</td>
                    <td className="px-3 py-2.5 text-foreground font-mono text-xs">{d.numCitaOrigen}</td>
                    <td className="px-3 py-2.5 text-foreground">{d.enfermedad.nombre}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        d.critico ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'
                      )}>
                        {d.critico ? 'Crítico' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        d.etapa.toLowerCase() === 'avanzada' ? 'bg-destructive/15 text-destructive' :
                        d.etapa.toLowerCase() === 'inicial' ? 'bg-warning/15 text-warning' :
                        'bg-success/15 text-success'
                      )}>
                        {d.etapa}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{d.fechaDiagnostico}</td>
                    <td className="px-3 py-2.5">
                      <Button size="sm" variant="ghost" onClick={() => setViewing(d)} className="h-7 text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDiagnosticos.length}
          onPageChange={setCurrentPage}
        />
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

            {/* Etapa del diagnóstico */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-foreground">Etapa del Diagnóstico</Label>
              <p className="text-xs text-muted-foreground">Seleccione la etapa o deje vacío para calcular automáticamente desde los síntomas</p>
              <Select value={form.etapa} onValueChange={v => setForm({ ...form, etapa: v as '' | 'leve' | 'inicial' | 'avanzada' })}>
                <SelectTrigger><SelectValue placeholder="Auto-calculada" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="inicial">Inicial</SelectItem>
                  <SelectItem value="avanzada">Avanzada</SelectItem>
                </SelectContent>
              </Select>
              {!form.etapa && (
                <p className="text-xs text-muted-foreground italic">
                  Calculada: {symptomAvg >= 4 ? 'Avanzada' : symptomAvg >= 2 ? 'Inicial' : 'Leve'} (promedio gravedad: {form.sintomas.length > 0 ? (symptomAvg).toFixed(1) : '3.0'}/5)
                </p>
              )}
            </div>

            {/* Enfermedad Determinada */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Enfermedad Determinada</h3>
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
