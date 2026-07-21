import { useMemo, useState, useEffect } from 'react';
import {
  Plus, Eye, Stethoscope, X, Loader2, CheckCircle2, AlertTriangle,
} from 'lucide-react';
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
import {
  useDiagnosticos,
  useCreateDiagnostico,
  useUpdateDiagnostico,
  useDeleteDiagnostico,
  useEnfermedades,
  useCreateEnfermedad,
  useSintomas,
  useCreateSintoma,
  useCreateDiagnosticoSintoma,
  useDiagnosticoSintomas,
  usePlaceholderEnfermedad,
  PLACEHOLDER_NAME,
} from '@/services/useDiagnosticos';
import { useCitas, useUpdateCita } from '@/services/useCitas';
import { usePacientes } from '@/services/usePacientes';

type Sintoma = { nombre: string; descripcion: string; gravedad: number };

type Diagnostico = {
  id: number;
  rawId: number;
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
  estado: 'pendiente' | 'completado';
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

const emptyCompleteForm = () => ({
  diagnosticoId: 0,
  pacienteId: 0,
  citaId: 0,
  numCitaOrigen: '',
  paciente: '',
  ci: '',
  tratamientoPrevio: '',
  sintomas: [] as Sintoma[],
  enfermedadId: 0,
  enfermedad: { nombre: '', descripcion: '', cronico: false },
  etapa: '' as '' | 'leve' | 'inicial' | 'avanzada',
  critico: false,
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
  const { data: apiDiagnosticos = [], isLoading } = useDiagnosticos();
  const { data: apiEnfermedades = [] } = useEnfermedades();
  const { data: apiSintomas = [] } = useSintomas();
  const { data: apiCitas = [] } = useCitas();
  const { data: apiPacientes = [] } = usePacientes();
  const { data: apiDiagnosticoSintomas = [] } = useDiagnosticoSintomas();

  const createDiagnostico = useCreateDiagnostico();
  const updateDiagnostico = useUpdateDiagnostico();
  const updateCita = useUpdateCita();
  const deleteDiagnostico = useDeleteDiagnostico();
  const createEnfermedad = useCreateEnfermedad();
  const createSintoma = useCreateSintoma();
  const createDiagnosticoSintoma = useCreateDiagnosticoSintoma();
  const { placeholderId, isLoading: placeholderLoading } = usePlaceholderEnfermedad();

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
      const isPending = placeholderId !== undefined && Number(d.fk_cm_a002_num_enfermedad) === placeholderId;
      return {
        id: idx + 1,
        rawId: d.pk_num_diagnostico || d.id || idx + 1,
        numCitaOrigen: `CITA-${cita?.pk_num_cita_medica || cita?.pk_num_cita || cita?.id || idx + 1}`,
        paciente: paciente ? `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim() : 'Sin paciente',
        pacienteId: Number(d.fk_ps_b001_num_paciente) || 0,
        ci: paciente?.ci || 'N/D',
        nombres: paciente?.nombres || '',
        apellidos: paciente?.apellidos || '',
        fechaCita: cita?.fecha || '',
        fechaDiagnostico: d.fecha_diagnostico || new Date().toISOString().slice(0, 10),
        motivo: '',
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
        estado: isPending ? 'pendiente' : 'completado',
      };
    });
  }, [apiDiagnosticos, apiPacientes, apiEnfermedades, apiCitas, apiDiagnosticoSintomas, placeholderId]);

  // ---------- UI state ----------
  const [formMode, setFormMode] = useState<'initial' | 'complete' | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [viewing, setViewing] = useState<Diagnostico | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [completeForm, setCompleteForm] = useState(emptyCompleteForm());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEtapa, setFilterEtapa] = useState<string>('todas');
  const [filterCriticidad, setFilterCriticidad] = useState<string>('todas');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // All non-cancelled citas (receptionist can mark as atendida when saving)
  const citasDisponibles = useMemo(
    () =>
      apiCitas
        .filter((c: any) => c.estado_cita !== 'cancelada')
        .map((c: any, idx: number) => {
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
            estado: c.estado_cita,
          };
        }),
    [apiCitas, apiPacientes],
  );

  const handleCitaChange = (numCita: string) => {
    const cita = citasDisponibles.find((c) => c.numCita === numCita);
    if (cita) {
      setForm((f) => ({
        ...f,
        numCitaOrigen: numCita,
        citaId: Number(cita.id),
        pacienteId: cita.pacienteId,
        ci: cita.ci,
        nombres: cita.nombres,
        apellidos: cita.apellidos,
        fechaCita: cita.fechaCita,
      }));
    }
  };

  const addSintoma = () => setForm((f) => ({ ...f, sintomas: [...f.sintomas, emptySintoma()] }));
  const removeSintoma = (idx: number) =>
    setForm((f) => ({ ...f, sintomas: f.sintomas.filter((_, i) => i !== idx) }));
  const updateSintoma = (idx: number, patch: Partial<Sintoma>) =>
    setForm((f) => ({
      ...f,
      sintomas: f.sintomas.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  const requestSaveInitial = () => {
    if (!form.numCitaOrigen) {
      toast.error('Seleccione un Nº de Cita');
      return;
    }
    if (form.sintomas.every((s) => !s.nombre.trim())) {
      toast.error('Ingrese al menos un síntoma');
      return;
    }
    setConfirmOpen(true);
  };

  // ----- SAVE INITIAL (receptionist) -----
  const handleSaveInitial = async () => {
    if (!form.citaId || !form.pacienteId) {
      toast.error('Debe seleccionar una cita válida');
      return;
    }
    if (!placeholderId) {
      toast.error('No se pudo determinar la enfermedad placeholder. Intente de nuevo.');
      return;
    }

    try {
      // 1) Mark cita as atendida
      await updateCita.mutateAsync({
        id: form.citaId,
        data: { estado_cita: 'atendida' },
      });

      // 2) Create diagnosis with placeholder enfermedad
      const avg =
        form.sintomas.length > 0
          ? form.sintomas.reduce((a, s) => a + (Number(s.gravedad) || 0), 0) / form.sintomas.length
          : 3;
      const etapaCalculada =
        form.etapa || (avg >= 4 ? 'avanzada' : avg >= 2 ? 'inicial' : 'leve');

      const res: any = await createDiagnostico.mutateAsync({
        fk_ps_b001_num_paciente: Number(form.pacienteId),
        fk_cm_a002_num_enfermedad: placeholderId,
        fk_cm_b002_num_cita_medica: form.citaId,
        critico: avg >= 4 || form.urgencia,
        tratamiento: form.tratamientoPrevio.trim() || 'N/A',
        etapa: etapaCalculada as 'leve' | 'inicial' | 'avanzada',
        fecha_diagnostico: new Date().toISOString().slice(0, 10),
      });

      const diagnosticoId = res?.pk_num_diagnostico || res?.id;
      if (diagnosticoId && form.sintomas.length > 0) {
        for (const s of form.sintomas) {
          if (!s.nombre.trim()) continue;
          try {
            const sintomaRes: any = await createSintoma.mutateAsync({
              nombre: s.nombre.trim().slice(0, 100),
              descripcion: s.descripcion?.trim().slice(0, 100) || undefined,
              gravedad: String(Math.min(5, Math.max(1, Math.round(s.gravedad)))) as '1' | '2' | '3' | '4' | '5',
            });
            const sintomaId = sintomaRes?.pk_num_sintoma || sintomaRes?.id;
            if (sintomaId) {
              await createDiagnosticoSintoma.mutateAsync({
                fk_cm_b003_num_diagnostico: Number(diagnosticoId),
                fk_cm_a003_num_sintoma: Number(sintomaId),
              });
            }
          } catch (sintomaErr: any) {
            console.error('Error creando/asociando síntoma:', sintomaErr?.response?.data?.message || sintomaErr);
          }
        }
      }

      toast.success('Diagnóstico inicial registrado. Pendiente de determinación por especialista.');
      setForm(emptyForm());
      setRegisterOpen(false);
      setConfirmOpen(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      const detail = Array.isArray(msg) ? msg.join(', ') : msg || 'Error al registrar diagnóstico';
      console.error('Error registering initial diagnosis:', error?.response?.data || error);
      toast.error(detail);
    }
  };

  // ----- SAVE FINAL (specialist) -----
  const handleSaveFinal = async () => {
    if (!completeForm.diagnosticoId) return;
    if (!completeForm.enfermedadId || completeForm.enfermedadId === 0) {
      toast.error('Seleccione una enfermedad');
      return;
    }
    if (!completeForm.etapa) {
      toast.error('Seleccione una etapa');
      return;
    }

    try {
      let enfermedadId = completeForm.enfermedadId;

      // Create enfermedad if it's a new one
      if (enfermedadId === -1) {
        if (!completeForm.enfermedad.nombre.trim()) {
          toast.error('Ingrese el nombre de la nueva enfermedad');
          return;
        }
        const newEnf: any = await createEnfermedad.mutateAsync({
          nombre: completeForm.enfermedad.nombre.trim(),
          enfermedad_cronica: completeForm.enfermedad.cronico,
          descripcion: completeForm.enfermedad.descripcion.trim() || 'Sin descripción',
        });
        enfermedadId = Number(newEnf?.pk_num_enfermedad || newEnf?.id || newEnf?.data?.pk_num_enfermedad || newEnf?.data?.id);
        if (!enfermedadId) {
          toast.error('No se pudo crear la enfermedad');
          return;
        }
      }

      await updateDiagnostico.mutateAsync({
        id: completeForm.diagnosticoId,
        data: {
          fk_cm_a002_num_enfermedad: enfermedadId,
          etapa: completeForm.etapa as 'leve' | 'inicial' | 'avanzada',
          critico: completeForm.critico,
        },
      });

      toast.success('Diagnóstico completado exitosamente');
      setCompleteForm(emptyCompleteForm());
      setFormMode(null);
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      const detail = Array.isArray(msg) ? msg.join(', ') : msg || 'Error al completar diagnóstico';
      console.error('Error completing diagnosis:', error?.response?.data || error);
      toast.error(detail);
    }
  };

  // ---------- open completion modal ----------
  const openCompleteModal = (d: Diagnostico) => {
    setCompleteForm({
      diagnosticoId: d.rawId,
      pacienteId: d.pacienteId,
      citaId: 0,
      numCitaOrigen: d.numCitaOrigen,
      paciente: d.paciente,
      ci: d.ci,
      tratamientoPrevio: d.tratamientoPrevio,
      sintomas: d.sintomas,
      enfermedadId: 0,
      enfermedad: { nombre: '', descripcion: '', cronico: false },
      etapa: '' as '' | 'leve' | 'inicial' | 'avanzada',
      critico: d.critico,
    });
    setFormMode('complete');
  };

  // ---------- filters ----------
  const symptomAvg = useMemo(() => {
    if (form.sintomas.length === 0) return 3;
    return form.sintomas.reduce((a, s) => a + (Number(s.gravedad) || 0), 0) / form.sintomas.length;
  }, [form.sintomas]);

  const viewMeterValue = useMemo(() => {
    if (!viewing) return 3;
    if (viewing.sintomas.length > 0) {
      return Math.round(viewing.sintomas.reduce((a, s) => a + s.gravedad, 0) / viewing.sintomas.length);
    }
    return 3;
  }, [viewing]);

  const filteredDiagnosticos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return diagnosticos.filter((d) => {
      if (filterEtapa !== 'todas' && d.etapa.toLowerCase() !== filterEtapa) return false;
      if (filterCriticidad === 'criticos' && !d.critico) return false;
      if (filterCriticidad === 'no-criticos' && d.critico) return false;
      if (filterEstado === 'pendientes' && d.estado !== 'pendiente') return false;
      if (filterEstado === 'completados' && d.estado !== 'completado') return false;
      if (!q) return true;
      return (
        d.paciente.toLowerCase().includes(q) ||
        d.enfermedad.nombre.toLowerCase().includes(q) ||
        d.numCitaOrigen.toLowerCase().includes(q) ||
        d.ci.toLowerCase().includes(q)
      );
    });
  }, [diagnosticos, search, filterEtapa, filterCriticidad, filterEstado]);

  const totalPages = Math.max(1, Math.ceil(filteredDiagnosticos.length / itemsPerPage));
  const paginatedDiagnosticos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDiagnosticos.slice(start, start + itemsPerPage);
  }, [filteredDiagnosticos, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterEtapa, filterCriticidad, filterEstado]);

  const diagModule: ReportableModule<Diagnostico> = useMemo(
    () => ({
      name: 'Diagnósticos',
      itemSingular: 'diagnóstico',
      itemPlural: 'diagnósticos',
      rows: diagnosticos,
      getId: (r) => r.id,
      fields: [
        { key: 'paciente', label: 'Paciente', accessor: (r) => r.paciente },
        { key: 'ci', label: 'C.I.', accessor: (r) => r.ci },
        { key: 'numCitaOrigen', label: 'Nº Cita Origen', accessor: (r) => r.numCitaOrigen },
        { key: 'enfermedad', label: 'Enfermedad', accessor: (r) => r.enfermedad.nombre },
        { key: 'motivo', label: 'Motivo', accessor: (r) => r.motivo },
        { key: 'critico', label: 'Crítico', accessor: (r) => (r.critico ? 'Sí' : 'No') },
        { key: 'etapa', label: 'Etapa', accessor: (r) => r.etapa },
        { key: 'estado', label: 'Estado', accessor: (r) => (r.estado === 'pendiente' ? 'Pendiente' : 'Completado') },
        { key: 'fechaDiagnostico', label: 'Fecha Diagnóstico', accessor: (r) => r.fechaDiagnostico },
      ],
      dateField: { accessor: (r) => r.fechaDiagnostico, label: 'Fecha Diagnóstico' },
      advancedVariant: 'diagnosticos',
      metrics: (rows) => {
        const total = rows.length;
        const criticos = rows.filter((r) => r.critico).length;
        const pendientes = rows.filter((r) => r.estado === 'pendiente').length;
        return {
          'Total exportados': total,
          'Casos críticos': criticos,
          Pendientes: pendientes,
          Completados: total - pendientes,
        };
      },
    }),
    [diagnosticos],
  );

  const diagReports = useReportableTable({ module: diagModule, visibleRows: filteredDiagnosticos });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Control de Diagnósticos
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro y seguimiento de diagnósticos médicos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {diagReports.SplitButton}
          <Button
            size="sm"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            onClick={() => {
              setForm(emptyForm());
              setFormMode('initial');
              setRegisterOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Registrar Diagnóstico Inicial
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Buscar por paciente, enfermedad o cita..."
        />
        <FiltersButton
          onClear={() => {
            setFilterEtapa('todas');
            setFilterCriticidad('todas');
            setFilterEstado('todos');
          }}
        >
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Estado</Label>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-[60]">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendientes">Pendientes</SelectItem>
                <SelectItem value="completados">Completados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Etapa</Label>
            <Select value={filterEtapa} onValueChange={setFilterEtapa}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading || placeholderLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando diagnósticos...</span>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-10 px-3 py-2.5">{diagReports.HeaderCheckbox}</th>
                  {['Nº', 'Paciente', 'Nº Cita', 'Enfermedad', 'Crítico', 'Etapa', 'Estado', 'Acciones'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedDiagnosticos.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      {filteredDiagnosticos.length === 0
                        ? 'No se encontraron diagnósticos'
                        : 'Sin diagnósticos registrados'}
                    </td>
                  </tr>
                )}
                {paginatedDiagnosticos.map((d, i) => {
                  const selected = diagReports.isRowSelected(d.id);
                  const rowNum = (currentPage - 1) * itemsPerPage + i + 1;
                  return (
                    <tr
                      key={d.rawId}
                      className={cn(
                        'border-t border-border/50 transition-colors hover:bg-secondary/30',
                        selected && 'bg-primary/10',
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <diagReports.RowCheckbox id={d.id} />
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{rowNum}</td>
                      <td className="px-3 py-2.5 text-foreground font-medium">{d.paciente}</td>
                      <td className="px-3 py-2.5 text-foreground font-mono text-xs">{d.numCitaOrigen}</td>
                      <td className="px-3 py-2.5 text-foreground text-xs">
                        {d.enfermedad.nombre === PLACEHOLDER_NAME ? (
                          <span className="italic text-muted-foreground">Sin determinar</span>
                        ) : (
                          d.enfermedad.nombre
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                            d.critico
                              ? 'bg-destructive/15 text-destructive'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {d.critico ? 'Crítico' : 'No'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            d.etapa.toLowerCase() === 'avanzada'
                              ? 'bg-destructive/15 text-destructive'
                              : d.etapa.toLowerCase() === 'inicial'
                                ? 'bg-warning/15 text-warning'
                                : 'bg-success/15 text-success',
                          )}
                        >
                          {d.etapa}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                            d.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                          )}
                        >
                          {d.estado === 'pendiente' ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {d.estado === 'pendiente' ? 'Pendiente' : 'Completado'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewing(d)}
                            className="h-7 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Ver
                          </Button>
                          {d.estado === 'pendiente' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openCompleteModal(d)}
                              className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              Completar
                            </Button>
                          )}
                        </div>
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

      {/* ===== REGISTRAR DIAGNÓSTICO INICIAL ===== */}
      <Dialog
        open={registerOpen && formMode === 'initial'}
        onOpenChange={(o) => {
          if (!o) {
            setRegisterOpen(false);
            setFormMode(null);
          }
        }}
      >
        <DialogContent className="bg-card border border-border w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Registrar Diagnóstico Inicial</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Registre los síntomas y tratamiento. La enfermedad será determinada por el especialista.
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
                    {citasDisponibles.map((c) => (
                      <SelectItem key={c.numCita} value={c.numCita}>
                        {c.numCita} — {c.nombres} {c.apellidos}
                        {c.estado === 'atendida' && (
                          <span className="ml-2 text-xs text-muted-foreground">(atendida)</span>
                        )}
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
                <Input value={form.ci} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nombres</Label>
                <Input value={form.nombres} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellidos</Label>
                <Input value={form.apellidos} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Urgencia</Label>
                <RadioGroup
                  value={form.urgencia ? 'si' : 'no'}
                  onValueChange={(v) => setForm({ ...form, urgencia: v === 'si' })}
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="si" id="urg-si" />
                    <Label htmlFor="urg-si" className="text-foreground">
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="urg-no" />
                    <Label htmlFor="urg-no" className="text-foreground">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground">Tratamiento / Indicaciones</Label>
                <Textarea
                  value={form.tratamientoPrevio}
                  onChange={(e) => setForm({ ...form, tratamientoPrevio: e.target.value })}
                  placeholder="Tratamiento o indicaciones iniciales..."
                />
              </div>
            </div>

            {/* Síntomas */}
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
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Nombre</Label>
                      <Input value={s.nombre} onChange={(e) => updateSintoma(idx, { nombre: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Descripción</Label>
                      <Input
                        value={s.descripcion}
                        onChange={(e) => updateSintoma(idx, { descripcion: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-foreground">Gravedad</Label>
                      <Select value={String(s.gravedad)} onValueChange={(v) => updateSintoma(idx, { gravedad: Number(v) })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground italic">
                Promedio de gravedad:{' '}
                {form.sintomas.length > 0 ? (symptomAvg).toFixed(1) : '3.0'}/5
                {!form.etapa &&
                  ` → Etapa calculada: ${symptomAvg >= 4 ? 'Avanzada' : symptomAvg >= 2 ? 'Inicial' : 'Leve'}`}
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => {
                setRegisterOpen(false);
                setFormMode(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={requestSaveInitial}
              disabled={createDiagnostico.isPending || updateCita.isPending}
            >
              {(createDiagnostico.isPending || updateCita.isPending) && (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              )}
              Registrar Diagnóstico Inicial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleSaveInitial}
        title="¿Registrar diagnóstico inicial?"
        description="La cita se marcará como atendida y se creará el diagnóstico pendiente de determinación por especialista."
      />

      {/* ===== COMPLETAR DIAGNÓSTICO (especialista) ===== */}
      <Dialog
        open={formMode === 'complete'}
        onOpenChange={(o) => {
          if (!o) {
            setFormMode(null);
            setCompleteForm(emptyCompleteForm());
          }
        }}
      >
        <DialogContent className="bg-card border border-border w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Completar Diagnóstico</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Determine la enfermedad, etapa y criticidad del caso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Read-only context */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/30 rounded-md p-3 text-sm">
              <div>
                <span className="text-muted-foreground">Paciente: </span>
                <span className="text-foreground font-medium">{completeForm.paciente}</span>
              </div>
              <div>
                <span className="text-muted-foreground">C.I.: </span>
                <span className="text-foreground">{completeForm.ci}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cita: </span>
                <span className="text-foreground font-mono">{completeForm.numCitaOrigen}</span>
              </div>
            </div>

            {/* Síntomas (read-only) */}
            {completeForm.sintomas.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground">Síntomas registrados</h3>
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
                      {completeForm.sintomas.map((s, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="p-2 text-foreground">{s.nombre}</td>
                          <td className="p-2 text-muted-foreground">{s.descripcion || '—'}</td>
                          <td className="p-2 text-foreground">{s.gravedad}/5</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Enfermedad selector */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Enfermedad Determinada</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-foreground">Buscar enfermedad existente</Label>
                  <Select
                    value={completeForm.enfermedadId ? String(completeForm.enfermedadId) : ''}
                    onValueChange={(v) => {
                      if (v === 'nueva') {
                        setCompleteForm({
                          ...completeForm,
                          enfermedadId: -1,
                          enfermedad: { nombre: '', descripcion: '', cronico: false },
                        });
                      } else {
                        const enf = apiEnfermedades.find(
                          (e: any) => String(e.id || e.pk_num_enfermedad) === v,
                        );
                        if (enf) {
                          setCompleteForm({
                            ...completeForm,
                            enfermedadId: Number(v),
                            enfermedad: {
                              nombre: enf.nombre,
                              descripcion: enf.descripcion || '',
                              cronico: enf.enfermedad_cronica || false,
                            },
                          });
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar enfermedad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nueva">+ Nueva enfermedad</SelectItem>
                      {apiEnfermedades
                        .filter((e: any) => e.nombre !== PLACEHOLDER_NAME)
                        .map((e: any) => (
                          <SelectItem key={e.id || e.pk_num_enfermedad} value={String(e.id || e.pk_num_enfermedad)}>
                            {e.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {completeForm.enfermedadId === -1 && (
                  <div className="space-y-1">
                    <Label className="text-foreground">Nombre (nueva)</Label>
                    <Input
                      value={completeForm.enfermedad.nombre}
                      onChange={(e) =>
                        setCompleteForm({
                          ...completeForm,
                          enfermedad: { ...completeForm.enfermedad, nombre: e.target.value },
                        })
                      }
                      placeholder="Nombre de la enfermedad"
                    />
                  </div>
                )}
              </div>

              {/* Etapa */}
              <div className="space-y-2">
                <Label className="text-foreground">Etapa del Diagnóstico</Label>
                <Select
                  value={completeForm.etapa}
                  onValueChange={(v) => setCompleteForm({ ...completeForm, etapa: v as '' | 'leve' | 'inicial' | 'avanzada' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="inicial">Inicial</SelectItem>
                    <SelectItem value="avanzada">Avanzada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Crítico */}
              <div className="space-y-2">
                <Label className="text-foreground">¿Caso crítico?</Label>
                <RadioGroup
                  value={completeForm.critico ? 'si' : 'no'}
                  onValueChange={(v) => setCompleteForm({ ...completeForm, critico: v === 'si' })}
                  className="flex gap-4 pt-1"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="si" id="crit-si" />
                    <Label htmlFor="crit-si" className="text-foreground">
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="crit-no" />
                    <Label htmlFor="crit-no" className="text-foreground">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => {
                setFormMode(null);
                setCompleteForm(emptyCompleteForm());
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSaveFinal}
              disabled={updateDiagnostico.isPending}
            >
              {updateDiagnostico.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Completar Diagnóstico
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== VER DIAGNÓSTICO ===== */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-card border border-border w-[calc(100vw-2rem)] sm:max-w-5xl max-h-[92vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <DialogTitle className="text-foreground">Detalle del Diagnóstico</DialogTitle>
                  <span
                    className={cn(
                      'self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      viewing.estado === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                    )}
                  >
                    {viewing.estado === 'pendiente' ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {viewing.estado === 'pendiente' ? 'Pendiente de determinación' : 'Completado'}
                  </span>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="border border-border rounded-lg p-3 sm:p-4 bg-background/40 space-y-2">
                  <h4 className="font-semibold text-foreground mb-2">A. Datos del Paciente</h4>
                  <Row label="Nº Paciente" value={String(viewing.rawId)} />
                  <Row label="C.I." value={viewing.ci} />
                  <Row label="Nombre" value={viewing.nombres} />
                  <Row label="Apellido" value={viewing.apellidos} />
                  <Row
                    label="Diagnóstico Presuntivo"
                    value={
                      viewing.enfermedad.nombre === PLACEHOLDER_NAME
                        ? 'Sin determinar (pendiente de especialista)'
                        : viewing.enfermedad.nombre
                    }
                  />
                  <Row label="Tratamiento" value={viewing.tratamientoPrevio || 'No especificado'} />
                  <Row label="Urgencia" value={viewing.urgencia ? 'Sí' : 'No'} />
                </div>

                <div className="border border-border rounded-lg p-3 sm:p-4 bg-background/40 flex flex-col">
                  <h4 className="font-semibold text-foreground mb-2">B. Medidor de Salud</h4>
                  <div className="flex-1 flex items-center justify-center">
                    <HealthMeter value={viewMeterValue} />
                  </div>
                </div>

                <div className="border border-border rounded-lg p-3 sm:p-4 bg-background/40">
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
                          <tr>
                            <td colSpan={3} className="text-center py-3 text-muted-foreground">
                              Sin síntomas
                            </td>
                          </tr>
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

                <div className="border border-border rounded-lg p-3 sm:p-4 bg-background/40 space-y-2">
                  <h4 className="font-semibold text-foreground mb-2">D. Enfermedad Determinada</h4>
                  <Row
                    label="Nombre"
                    value={
                      viewing.enfermedad.nombre === PLACEHOLDER_NAME
                        ? 'Sin determinar'
                        : viewing.enfermedad.nombre
                    }
                  />
                  <Row label="Descripción" value={viewing.enfermedad.descripcion || '—'} />
                  <Row label="Crónica" value={viewing.enfermedad.cronico ? 'Sí' : 'No'} />
                </div>
              </div>

              {viewing.estado === 'pendiente' && (
                <DialogFooter className="pt-3">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      setViewing(null);
                      openCompleteModal(viewing);
                    }}
                  >
                    Completar Diagnóstico
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="text-foreground break-words">{value}</span>
    </div>
  );
}
