import { useMemo, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, CalendarDays, ArrowLeft, FileDown, Loader2, Check, X, ChevronsUpDown, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RowActions } from '@/components/shared/RowActions';
import { TablePagination } from '@/components/shared/TablePagination';
import { cn } from '@/lib/utils';
import { useReportableTable } from '@/components/reports/useReportableTable';
import type { ReportableModule } from '@/components/reports/types';
import { usePacientes, useCreatePaciente, useUpdatePaciente, useDeletePaciente } from '@/services/usePacientes';
import { CITAS_KEY, MOTIVOS_KEY, buildCreateCitaPayload, useCitas, useCreateCita, useCreateMotivoConsulta, useUpdateCita, useDeleteCita } from '@/services/useCitas';
import { useMedicos, useEspecialidades } from '@/services/useMedicos';
import { useSesionesMedicas, useCreateSesion } from '@/services/useJornadas';
import { useComunidades, useCreateComunidad } from '@/services/useComunidades';
import { validateWithZod, pacienteRegistroRapidoSchema, nuevaComunidadSchema, motivoConsultaSchema } from '@/lib/validators';

export type Patient = {
  num: number | string;
  ci: string;
  nombres: string;
  apellidos: string;
  fechaNac: string;
  sexo: string;
  direccion: string;
  telefono: string;
  nacionalidad: string;
  estadoCivil: string;
  estado: string;
  comunidad: string;
  estadoGeo: string;
  municipio: string;
  parroquia: string;
};

const baseTimeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
];

const statusColors: Record<string, string> = {
  confirmada: 'bg-success/20 text-success',
  pendiente: 'bg-warning/20 text-warning',
  cancelada: 'bg-destructive/20 text-destructive',
};

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type ModalStep = 'closed' | 'search' | 'register' | 'schedule' | 'motivo' | 'fullCita';

type Doctor = { id: string; name: string; mpps: string; carga: string };
type SelectedDoctor = Doctor & { specialty: string };

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert: Sunday=0 → 6, Monday=1 → 0 (week starts on Monday)
  const offset = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function calcAge(fechaNac: string): number {
  if (!fechaNac) return 0;
  const birth = new Date(fechaNac);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function CitasPage() {
  const [modalStep, setModalStep] = useState<ModalStep>('closed');
  const [patientSearch, setPatientSearch] = useState('');
  const { data: apiPacientes = [], isLoading: isLoadingPacientes } = usePacientes();
  const createPaciente = useCreatePaciente();
  const { data: apiMedicos = [], isLoading: isLoadingMedicos } = useMedicos();
  const { data: apiEspecialidades = [] } = useEspecialidades();
  const { data: apiSesiones = [], isLoading: isLoadingSesiones } = useSesionesMedicas();
  const qc = useQueryClient();

  // Build lookup maps — all IDs come as strings from the backend
  const pacienteMap = useMemo(() => {
    const map = new Map<string, any>();
    apiPacientes.forEach((p: any) => {
      const id = String(p.pk_num_paciente ?? p.id ?? '');
      if (id) map.set(id, p);
    });
    return map;
  }, [apiPacientes]);

  const medicoMap = useMemo(() => {
    const map = new Map<string, any>();
    apiMedicos.forEach((m: any) => {
      const id = String(m.pk_num_medico_ministerio_salud ?? m.id ?? '');
      if (id) map.set(id, m);
    });
    return map;
  }, [apiMedicos]);

  const especialidadMap = useMemo(() => {
    const map = new Map<string, any>();
    apiEspecialidades.forEach((e: any) => {
      const id = String(e.id ?? e.pk_num_especialidad ?? '');
      if (id) map.set(id, e);
    });
    return map;
  }, [apiEspecialidades]);

  // Map sesion ID → medico ID
  const sesionMedicoMap = useMemo(() => {
    const map = new Map<string, string>();
    apiSesiones.forEach((s: any) => {
      const sesionId = String(s.pk_num_sesion_medica ?? s.pk_num_sesion ?? s.id ?? '');
      const medicoId = String(s.fk_cm_b001_num_medico_ministerio_salud ?? s.fk_cm_a001_num_medico ?? '');
      if (sesionId && medicoId) map.set(sesionId, medicoId);
    });
    return map;
  }, [apiSesiones]);

  const doctorSessionMap = useMemo(() => {
    const map = new Map<string, string>();
    apiSesiones.forEach((s: any) => {
      const sesionId = String(s.pk_num_sesion_medica ?? s.pk_num_sesion ?? s.id ?? '');
      const medicoId = String(s.fk_cm_b001_num_medico_ministerio_salud ?? s.fk_cm_a001_num_medico ?? '');
      if (sesionId && medicoId && !map.has(medicoId)) map.set(medicoId, sesionId);
    });
    return map;
  }, [apiSesiones]);

  const { data: apiComunidades = [] } = useComunidades();
  const createComunidad = useCreateComunidad();

  const comunidadMap = useMemo(() => {
    const map = new Map<string, any>();
    apiComunidades.forEach((c: any) => {
      const id = String(c.pk_num_comunidad ?? c.id ?? '');
      if (id) map.set(id, c);
    });
    return map;
  }, [apiComunidades]);

  const allPatients = useMemo(() => apiPacientes.map((p: any, idx: number) => {
    const comunidadId = String(p.fk_ps_a001_num_comunidad ?? '');
    const com = comunidadMap.get(comunidadId);
    return {
      num: p.pk_num_paciente || String(idx + 1).padStart(4, '0'),
      ci: p.ci || '',
      nombres: p.nombres || '',
      apellidos: p.apellidos || '',
      fechaNac: p.fecha_nacimiento || '',
      sexo: p.sexo === 'femenino' ? 'F' : p.sexo === 'masculino' ? 'M' : p.sexo || '',
      direccion: p.direccion || '',
      telefono: p.telefono || '',
      nacionalidad: p.nacionalidad === 'venezolano' ? 'V' : p.nacionalidad === 'extranjero' ? 'E' : p.nacionalidad || '',
      estadoCivil: p.estado_civil || '',
      comunidad: com?.nombre_comunidad || com?.nombre || 'N/D',
      estadoGeo: com?.estado || 'N/D',
      municipio: com?.municipio || 'N/D',
      parroquia: com?.parroquia || 'N/D',
      estado: p.estado_paciente === 'activo' ? 'Activo' : p.estado_paciente === 'encamado' ? 'Encamado' : p.estado_paciente || 'Activo',
    };
  }), [apiPacientes, comunidadMap]);

  const [localAppointments, setLocalAppointments] = useState<any[]>([]);
  const { data: apiCitas = [], isLoading: isLoadingCitas } = useCitas();
  const createCita = useCreateCita();
  const updateCita = useUpdateCita();
  const createMotivoConsulta = useCreateMotivoConsulta();

  const mergedAppointments = useMemo(() => {
    const seen = new Set<string>();
    return [...localAppointments, ...apiCitas].filter((c: any) => {
      const key = String(c?.pk_num_cita_medica ?? c?.pk_num_cita ?? c?.id ?? '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [apiCitas, localAppointments]);

  const appointments = useMemo(() => mergedAppointments.map((c: any, idx: number) => {
    const extractName = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object') {
        return `${val.nombres || val.nombre || ''} ${val.apellidos || val.apellido || ''}`.trim();
      }
      return String(val);
    };

    const pacienteNombreDirect = extractName(c.patient) || extractName(c.paciente);
    const medicoNombreDirect = extractName(c.doctor) || extractName(c.medico);

    const pacienteId = String(c.fk_ps_b001_num_paciente ?? '');
    const sesionId = String(c.fk_cm_b005_num_sesion ?? '');
    const medicoId = sesionMedicoMap.get(sesionId) ?? '';

    const paciente = pacienteId ? pacienteMap.get(pacienteId) ?? null : null;
    const medico = medicoId ? medicoMap.get(medicoId) ?? null : null;

    const pacienteNombre = pacienteNombreDirect || (paciente
      ? `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim()
      : '');
    const medicoNombre = medicoNombreDirect || (medico
      ? `${medico.nombre || ''} ${medico.apellido || ''}`.trim()
      : '');

    const specId = String(medico?.fk_cm_a001_num_especialidad || medico?.especialidad?.id || '');
    const spec = especialidadMap.get(specId);
    const especialidad = spec?.nombre || (typeof medico?.especialidad === 'object' ? medico?.especialidad?.nombre : '') || (typeof c.medico?.especialidad === 'object' ? c.medico?.especialidad?.nombre : '') || 'General';

    return {
      id: c.pk_num_cita_medica || c.pk_num_cita || c.id || idx + 1,
      patient: pacienteNombre || 'Sin paciente',
      doctor: medicoNombre || 'Sin médico',
      specialty: especialidad,
      date: typeof c.fecha === 'string' ? c.fecha : String(c.fecha || ''),
      time: typeof c.hora === 'string' ? c.hora : String(c.hora || ''),
      status: c.estado_cita === 'confirmada' ? 'confirmada'
        : c.estado_cita === 'cancelada' ? 'cancelada'
        : c.estado_cita === 'atendida' ? 'atendida'
        : 'pendiente',
    };
  }), [mergedAppointments, pacienteMap, medicoMap, sesionMedicoMap]);


  const doctorsBySpecialty = useMemo(() => {
    const groups: Record<string, { specialty: string, doctors: any[] }> = {};
    apiMedicos.forEach((m: any) => {
      const specId = String(m.fk_cm_a001_num_especialidad || m.especialidad?.id || '');
      const spec = especialidadMap.get(specId);
      const specName = spec?.nombre || m.especialidad?.nombre || 'Sin especialidad';
      if (!groups[specName]) groups[specName] = { specialty: specName, doctors: [] };
      groups[specName].doctors.push({
        id: m.pk_num_medico_ministerio_salud || m.id,
        name: `${m.nombre || m.nombres || ''} ${m.apellido || m.apellidos || ''}`.trim(),
        mpps: m.pk_num_medico_ministerio_salud || '',
        carga: `${m.carga_paciente ?? 0}/16`
      });
    });
    return Object.values(groups);
  }, [apiMedicos, especialidadMap]);

  const doctorDaysMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    apiSesiones.forEach((s: any) => {
      const medicoId = String(s.fk_cm_b001_num_medico_ministerio_salud ?? '');
      const dia = s.dias_semana;
      if (medicoId && dia) {
        if (!map.has(medicoId)) map.set(medicoId, new Set());
        map.get(medicoId)!.add(dia);
      }
    });
    return map;
  }, [apiSesiones]);

  // Derive occupied dates from API appointments + local appointments
  const apiReservedDates = useMemo(() => {
    const reserved: Record<string, 'available' | 'reserved'> = {};
    const allCitas = [...apiCitas, ...localAppointments];
    for (const c of allCitas) {
      const fecha = (c as any).fecha;
      if (fecha && typeof fecha === 'string') {
        reserved[fecha] = 'reserved';
      }
    }
    return reserved;
  }, [apiCitas, localAppointments]);

  const [localDayOverrides, setLocalDayOverrides] = useState<Record<string, 'available' | 'reserved'>>({});

  const dayAvailability = useMemo(() => ({
    ...apiReservedDates,
    ...localDayOverrides,
  }), [apiReservedDates, localDayOverrides]);

  // Track CIs that belong to minors (registered with representative's cédula)
  const [minorCis, setMinorCis] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('minorCis');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  // New patient form state
  const [isMinor, setIsMinor] = useState(false);
  const [newPatient, setNewPatient] = useState({
    ci: '', nombres: '', apellidos: '', fechaNac: '', sexo: '',
    direccion: '', telefono: '', nacionalidad: '', estado: 'Activo', estadoCivil: '',
    ciRepresentante: '',
    comunidad: '', estadoUbic: '', municipio: '', parroquia: '',
  });

  const [comunidadOpen, setComunidadOpen] = useState(false);
  const [comunidadSearch, setComunidadSearch] = useState('');
  const [selectedComunidadId, setSelectedComunidadId] = useState<number | null>(null);
  const [showNewComunidadForm, setShowNewComunidadForm] = useState(false);
  const [newComunidad, setNewComunidad] = useState({ nombre_comunidad: '', estado: '', municipio: '', parroquia: '' });

  const [confirmAction, setConfirmAction] = useState<'save' | 'saveContinue' | 'cancel' | null>(null);

  // Appointment scheduling state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<SelectedDoctor | null>(null);

  // Motivo de Consulta state
  const [motivoData, setMotivoData] = useState({
    numPaciente: '',
    descripcion: '',
    urgencia: '',
    fecha: '',
    observacion: '',
  });

  // Cita Médica fullscreen state
  const [citaNumber, setCitaNumber] = useState('');
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tipoCita, setTipoCita] = useState('');
  const [motivoTexto, setMotivoTexto] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [turno, setTurno] = useState<'Mañana' | 'Tarde' | 'Noche' | ''>('');
  const [remitido, setRemitido] = useState<'si' | 'no'>('no');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmada' | 'pendiente' | 'cancelada' | 'atendida'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [cancelCitaId, setCancelCitaId] = useState<number | string | null>(null);
  const itemsPerPage = 8;

  const emptyPatient = {
    ci: '', nombres: '', apellidos: '', fechaNac: '', sexo: '',
    direccion: '', telefono: '', nacionalidad: '', estado: 'Activo', estadoCivil: '',
    ciRepresentante: '',
    comunidad: '', estadoUbic: '', municipio: '', parroquia: '',
  };

  const filteredPatients = allPatients.filter(p =>
    p.nombres.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.apellidos.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.ci.includes(patientSearch)
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const persistNewPatient = () => {
    if (isMinor && !newPatient.ciRepresentante.trim()) {
      toast.error('La cédula del representante es obligatoria para menores');
      return;
    }

    if (!selectedComunidadId) {
      toast.error('Selecciona una comunidad');
      return;
    }

    const validationError = validateWithZod(pacienteRegistroRapidoSchema, {
      ci: isMinor ? newPatient.ciRepresentante.trim() : newPatient.ci,
      nombres: newPatient.nombres,
      apellidos: newPatient.apellidos,
      fechaNac: newPatient.fechaNac,
      sexo: newPatient.sexo as 'M' | 'F' | '',
      direccion: newPatient.direccion,
      telefono: newPatient.telefono,
      nacionalidad: newPatient.nacionalidad as 'Venezolano' | 'Extranjero' | '',
      estado: newPatient.estado,
      estadoCivil: newPatient.estadoCivil as any,
      comunidadId: selectedComunidadId,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setFormErrors({});
    const ciFinal = isMinor && newPatient.ciRepresentante
      ? newPatient.ciRepresentante.trim()
      : newPatient.ci;
    createPaciente.mutate({
      fk_ps_a001_num_comunidad: selectedComunidadId,
      ci: ciFinal,
      nombres: newPatient.nombres.trim(),
      apellidos: newPatient.apellidos.trim(),
      fecha_nacimiento: newPatient.fechaNac || '2000-01-01',
      sexo: newPatient.sexo === 'M' ? 'masculino' : 'femenino',
      direccion: newPatient.direccion || 'Sin dirección',
      telefono: newPatient.telefono || '00000000000',
      nacionalidad: newPatient.nacionalidad?.toLowerCase() === 'extranjero' ? 'extranjero' : 'venezolano',
      estado_civil: mapEstadoCivil(newPatient.estadoCivil),
      estado_paciente: newPatient.estado === 'Activo' ? 'activo' : 'encamado'
    }, {
      onSuccess: () => {
        if (isMinor && ciFinal) {
          setMinorCis(prev => {
            const next = new Set(prev);
            next.add(ciFinal);
            localStorage.setItem('minorCis', JSON.stringify([...next]));
            return next;
          });
        }
        toast.success('Paciente registrado exitosamente');
      },
      onError: (e: any) => {
        const data = e?.response?.data;
        const msg = data?.message || e?.message || 'Error al registrar paciente';
        const detail = Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : JSON.stringify(msg);
        console.error('[Paciente] Error completo:', JSON.stringify(data, null, 2));
        toast.error(detail);
      },
    });
  };

  const mapEstadoCivil = (ec: string): 'soltero' | 'casado' | 'divorciado' | 'viudo' => {
    if (ec.includes('Casado')) return 'casado';
    if (ec.includes('Divorciado')) return 'divorciado';
    if (ec.includes('Viudo')) return 'viudo';
    return 'soltero';
  };

  const handleSavePatient = () => {
    persistNewPatient();
    setModalStep('search');
    setNewPatient(emptyPatient);
    setIsMinor(false);
    setSelectedComunidadId(null);
    setShowNewComunidadForm(false);
    setComunidadSearch('');
  };

  const handleSaveAndContinue = () => {
    persistNewPatient();
    setNewPatient(emptyPatient);
    setIsMinor(false);
    setSelectedComunidadId(null);
    setShowNewComunidadForm(false);
    setComunidadSearch('');
  };

  const handleCancelRegister = () => {
    setNewPatient(emptyPatient);
    setIsMinor(false);
    setModalStep('search');
    setSelectedComunidadId(null);
    setShowNewComunidadForm(false);
    setComunidadSearch('');
  };

  const handleCancelCita = async () => {
    if (!cancelCitaId) return;
    try {
      await updateCita.mutateAsync({
        id: Number(cancelCitaId),
        data: { estado_cita: 'cancelada' },
      });
      toast.success('Cita cancelada exitosamente');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al cancelar la cita');
    } finally {
      setCancelCitaId(null);
    }
  };

  const handleMinorChange = (checked: boolean) => {
    setIsMinor(checked);

    if (checked) {
      setNewPatient(prev => ({
        ...prev,
        ci: '',
      }));
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'save') handleSavePatient();
    else if (confirmAction === 'saveContinue') handleSaveAndContinue();
    else if (confirmAction === 'cancel') handleCancelRegister();
    setConfirmAction(null);
  };

  // Open Motivo modal from a doctor card
  const handleAsignarCita = (doctor: SelectedDoctor) => {
    setSelectedDoctor(doctor);
    setModalStep('fullCita');
  };

  const isMotivoValid = useMemo(() => {
    return (
      motivoData.numPaciente.trim() !== '' &&
      motivoData.descripcion.trim().length >= 10 &&
      motivoData.urgencia.trim() !== '' &&
      motivoData.fecha.trim() !== ''
    );
  }, [motivoData]);

  const handleSiguienteMotivo = () => {
    const err = validateWithZod(motivoConsultaSchema, {
      descripcion: motivoData.descripcion,
      urgencia: (motivoData.urgencia as 'Bajo' | 'Medio' | 'Alto') || ('' as any),
      fecha: motivoData.fecha,
      observacion: motivoData.observacion,
    });
    if (err) {
      toast.error(err);
      return;
    }
    const nuevoNumero = `CITA-${Date.now().toString().slice(-6)}`;
    setCitaNumber(nuevoNumero);
    setMotivoTexto(motivoData.descripcion);
    const d = new Date(motivoData.fecha);
    if (!isNaN(d.getTime())) {
      setCalMonth(d.getMonth());
      setCalYear(d.getFullYear());
      setSelectedDate(motivoData.fecha);
    } else {
      setSelectedDate(null);
    }
    setTipoCita('');
    setHoraSeleccionada('');
    setTurno('');
    setRemitido('no');
    setModalStep('schedule');
  };

  const cells = useMemo(() => buildMonthGrid(calYear, calMonth), [calYear, calMonth]);

  const yearsRange = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current + i);
  }, []);

  const usedHoursForDate = useMemo(() => {
    if (!selectedDate) return new Set<string>();
    return new Set(appointments.filter(a => a.date === selectedDate).map(a => a.time));
  }, [selectedDate, appointments]);

  const availableHours = useMemo(() => {
    const filtered = baseTimeSlots.filter(h => !usedHoursForDate.has(h));
    if (!turno) return filtered;
    return filtered.filter(h => {
      const hour = parseInt(h.split(':')[0], 10);
      if (turno === 'Mañana') return hour >= 6 && hour < 12;
      if (turno === 'Tarde') return hour >= 12 && hour < 18;
      return hour >= 18 && hour < 24;
    });
  }, [usedHoursForDate, turno]);

  const isResumenReady = tipoCita && motivoTexto && horaSeleccionada;

  const selectedDayNumber = useMemo(() => {
    if (!selectedDate) return null;
    return parseInt(selectedDate.split('-')[2], 10);
  }, [selectedDate]);

  const handleAgendarCitaFinal = () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate || !horaSeleccionada) {
      toast.error('Complete los datos de la cita antes de registrar');
      return;
    }
    if (!tipoCita) {
      toast.error('Seleccione el tipo de cita');
      return;
    }
    if (!motivoTexto || motivoTexto.trim().length < 5) {
      toast.error('El motivo de la consulta debe tener al menos 5 caracteres');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(selectedDate + 'T12:00:00');
    if (checkDate < today) {
      toast.error('No se pueden agendar citas en fechas pasadas');
      return;
    }

    const pacienteId = Number(selectedPatient.num) || 1;
    const medicoId = Number(selectedDoctor.id) || 1;

    const toMinutes = (t: string) => {
      const [hh, mm] = (t || '').split(':').map((v) => Number(v));
      return Number.isFinite(hh) && Number.isFinite(mm) ? hh * 60 + mm : -1;
    };

    const weekdayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const selDate = new Date(selectedDate + 'T12:00:00');
    const selDayName = weekdayNames[selDate.getDay()];
    const targetMin = toMinutes(horaSeleccionada);

    // Find matching session for this doctor, day, and time
    let sesionId = 0;
    let matchedSession: any = null;

    for (const s of apiSesiones) {
      const sesMedId = String(s.fk_cm_b001_num_medico_ministerio_salud ?? '');
      if (!sesMedId || String(medicoId) !== sesMedId) continue;

      const hi = toMinutes(s.hora_inicio || '');
      const hf = toMinutes(s.hora_fin || '');
      const diasRaw = String(s.dias_semana || '').trim();
      const diasLower = diasRaw.toLowerCase();

      // Exact day name match (e.g. "lunes" in "Lunes")
      const dayMatches = !diasLower || diasLower.includes(selDayName.toLowerCase());
      const timeMatches = targetMin >= 0 && hi >= 0 && hf > hi ? (targetMin >= hi && targetMin < hf) : true;

      if (dayMatches && timeMatches) {
        sesionId = Number(s.pk_num_sesion_medica ?? s.pk_num_sesion ?? s.id ?? 0);
        matchedSession = s;
        break;
      }
    }

    // Fallback: any session for the doctor (try to match day first)
    if (!sesionId) {
      for (const s of apiSesiones) {
        const sesMedId = String(s.fk_cm_b001_num_medico_ministerio_salud ?? '');
        if (!sesMedId || String(medicoId) !== sesMedId) continue;
        const diasLower = String(s.dias_semana || '').toLowerCase();
        if (diasLower.includes(selDayName.toLowerCase())) {
          sesionId = Number(s.pk_num_sesion_medica ?? s.pk_num_sesion ?? s.id ?? 0);
          matchedSession = s;
          break;
        }
      }
    }

    // Last fallback: any session for the doctor
    if (!sesionId) {
      sesionId = Number(doctorSessionMap.get(String(medicoId)) || 0);
      if (sesionId) {
        matchedSession = apiSesiones.find((s: any) => String(s.pk_num_sesion_medica ?? s.pk_num_sesion ?? s.id ?? '') === String(sesionId)) || null;
      }
    }

    if (!sesionId) {
      toast.error('No hay una sesión médica configurada para este doctor. Cree una jornada primero.');
      return;
    }

    const motivoPayload = {
      fk_ps_b001_num_paciente: pacienteId,
      descripcion_motivo: motivoTexto || motivoData.descripcion || 'Consulta médica',
      nivel_urgencia: (motivoData.urgencia?.toLowerCase() === 'medio' ? 'media' : motivoData.urgencia?.toLowerCase() === 'alto' ? 'alta' : 'baja') as 'baja' | 'media' | 'alta',
      fecha_motivo: motivoData.fecha || selectedDate,
      observacion_motivo: motivoData.observacion || 'Registrado desde el flujo de citas',
    };

    createMotivoConsulta.mutate(motivoPayload, {
      onSuccess: (motivoCreado: any) => {
        qc.invalidateQueries({ queryKey: MOTIVOS_KEY });
        const motivoId = Number(motivoCreado?.pk_num_motivo_consulta ?? motivoCreado?.id ?? 1);
        const citaPayload = buildCreateCitaPayload({
          pacienteId,
          sesionId,
          motivoId,
          fecha: selectedDate,
          hora: horaSeleccionada,
          tipoCita: tipoCita || 'control',
          estadoCita: 'agendada',
          estadoCaso: 'nuevo',
          remitido: remitido === 'si',
        });

        createCita.mutate(citaPayload, {
          onSuccess: (created) => {
            const createdAppointment = created || {
              pk_num_cita_medica: Date.now(),
              fk_ps_b001_num_paciente: pacienteId,
              fk_cm_b005_num_sesion: sesionId,
              fk_cm_b004_num_motivo_consulta: motivoId,
              fecha: selectedDate,
              hora: horaSeleccionada,
              estado_cita: 'agendada',
            };

            setLocalAppointments(prev => [createdAppointment, ...prev]);
            qc.invalidateQueries({ queryKey: CITAS_KEY });
            qc.invalidateQueries({ queryKey: MOTIVOS_KEY });
            toast.success('Cita registrada correctamente');
            setModalStep('closed');
            setSelectedPatient(null);
            setSelectedDoctor(null);
            setSelectedDate(null);
            setTipoCita('');
            setMotivoTexto('');
            setHoraSeleccionada('');
            setTurno('');
            setCitaNumber('');
            setCurrentPage(1);
          },
          onError: (error: any) => {
            const apiBody = error?.response?.data;
            const apiMsg = apiBody?.message || error?.message;
            console.error('Error creating cita:', error);
            const short = apiMsg || (apiBody ? JSON.stringify(apiBody) : null);
            toast.error(short ? `No se pudo registrar la cita: ${short}` : 'No se pudo registrar la cita. Verifique los datos.');
          },
        });
      },
      onError: () => {
        toast.error('No se pudo crear el motivo de consulta');
      },
    });
  };

  const handleDayClick = (day: number) => {
    const key = formatDateKey(calYear, calMonth, day);
    if (dayAvailability[key] === 'reserved') return;
    setSelectedDate(key);
    setHoraSeleccionada('');
  };

  // Reports module for appointments table
  const appointmentsModule: ReportableModule<typeof appointments[number]> = useMemo(() => ({
    name: 'Citas',
    itemSingular: 'cita',
    itemPlural: 'citas',
    rows: appointments,
    getId: r => r.id,
    fields: [
      { key: 'patient', label: 'Paciente', accessor: r => r.patient },
      { key: 'doctor', label: 'Doctor', accessor: r => r.doctor },
      { key: 'specialty', label: 'Especialidad', accessor: r => r.specialty },
      { key: 'date', label: 'Fecha', accessor: r => r.date },
      { key: 'time', label: 'Hora', accessor: r => r.time },
      { key: 'status', label: 'Estado', accessor: r => r.status },
    ],
    dateField: { accessor: r => r.date, label: 'Fecha' },
    advancedVariant: 'citas',
    metrics: rows => ({
      'Total exportadas': rows.length,
      'Confirmadas': rows.filter(r => r.status === 'confirmada').length,
      'Pendientes': rows.filter(r => r.status === 'pendiente').length,
      'Canceladas': rows.filter(r => r.status === 'cancelada').length,
    }),
    onImport: (rows: any[]) => {
      // Attempt to map imported rows into displayable appointment entries.
      const mapped = rows.map((row: any, idx: number) => {
        // prefer CSV headers matching field keys or labels
        const date = row.fecha || row.date || row.Fecha || '';
        const hora = row.hora || row.time || row.Hora || '';
        const patient = row.patient || row.paciente || row.Paciente || '';
        const doctor = row.doctor || row.medico || row.Doctor || '';
        const fkPaciente = row.fk_ps_b001_num_paciente || row.pacienteId || row.paciente_id || undefined;
        const fkSesion = row.fk_cm_b005_num_sesion || row.sesionId || row.sesion_id || undefined;

        // If foreign keys present, create API-like object to allow name resolution
        if (fkPaciente || fkSesion) {
          return {
            pk_num_cita_medica: `imp-${Date.now()}-${idx}`,
            fk_ps_b001_num_paciente: fkPaciente,
            fk_cm_b005_num_sesion: fkSesion,
            fecha: date,
            hora: hora,
            estado_cita: row.status || row.estado || 'agendada',
          };
        }

        // Otherwise include direct patient/doctor fields so the table can show names
        return {
          pk_num_cita_medica: `imp-${Date.now()}-${idx}`,
          fecha: date,
          hora: hora,
          estado_cita: row.status || row.estado || 'agendada',
          patient,
          doctor,
        };
      });

      // prepend imported rows to localAppointments so they display immediately
      setLocalAppointments(prev => [...mapped, ...prev]);
      toast.success(`Se importaron ${mapped.length} filas correctamente`);
    },
  }), [appointments]);

  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return appointments.filter((apt) => {
      const patient = String(apt.patient || '').toLowerCase();
      const doctor = String(apt.doctor || '').toLowerCase();
      const specialty = String(apt.specialty || '').toLowerCase();
      const date = String(apt.date || '').toLowerCase();
      const matchesSearch = !term || patient.includes(term) || doctor.includes(term) || specialty.includes(term) || date.includes(term);
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesDate = !dateFilter || apt.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, dateFilter, searchTerm, statusFilter]);

  const appointmentsReports = useReportableTable({ module: appointmentsModule, visibleRows: filteredAppointments });

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / itemsPerPage));
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, dateFilter]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Citas Médicas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Gestión de citas y programación</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm w-full sm:w-auto" onClick={() => setModalStep('search')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente, doctor o fecha"
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as typeof statusFilter); }}>
            <SelectTrigger className="flex-1 sm:flex-none sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-[60]">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="confirmada">Confirmada</SelectItem>
              <SelectItem value="atendida">Atendida</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1 sm:flex-none sm:w-[180px]">
            <Input
              type="date"
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(event.target.value);
              }}
              className="w-full"
            />
          </div>
        </div>
        <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDateFilter(''); }} className="hidden sm:flex">
          <Filter className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      </div>

      {/* Appointments Table */}
        <div className="chart-container">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Próximas Citas Médicas</h3>
          {appointmentsReports.SplitButton}
        </div>
        {appointmentsReports.ContextBar}
        {isLoadingPacientes || isLoadingMedicos || isLoadingCitas || isLoadingSesiones ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Cargando citas...</span>
          </div>
        ) : (
        <div className="overflow-x-auto scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 p-3">{appointmentsReports.HeaderCheckbox}</th>
                {['Paciente', 'Doctor', 'Especialidad', 'Fecha', 'Hora', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.length > 0 ? paginatedAppointments.map(apt => {
                const selected = appointmentsReports.isRowSelected(apt.id);
                return (
                  <tr key={apt.id}
                    className={cn('border-b border-border/50 transition-colors hover:bg-secondary/50',
                      selected && 'bg-primary/10')}>
                    <td className="p-3"><appointmentsReports.RowCheckbox id={apt.id} /></td>
                    <td className="p-3 text-sm font-medium text-foreground">{apt.patient}</td>
                    <td className="p-3 text-sm text-foreground">{apt.doctor}</td>
                    <td className="p-3 text-sm text-muted-foreground">{apt.specialty}</td>
                    <td className="p-3 text-sm text-foreground">{apt.date}</td>
                    <td className="p-3 text-sm text-foreground">{apt.time}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[apt.status] ?? 'bg-secondary/50 text-foreground'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {(apt.status === 'pendiente' || apt.status === 'confirmada') && (
                        <RowActions actions={[
                          {
                            icon: Ban,
                            label: 'Cancelar cita',
                            variant: 'destructive',
                            animateOnClick: true,
                            onClick: () => setCancelCitaId(apt.id),
                          },
                        ]} />
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">
                    No hay citas que coincidan con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAppointments.length}
          onPageChange={setCurrentPage}
        />
      </div>
      {appointmentsReports.ReportSheet}

      {/* Step 1: Search Patient */}
      <Dialog open={modalStep === 'search'} onOpenChange={(o) => !o && setModalStep('closed')}>
        <DialogContent className="bg-card border border-border max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Buscar Paciente</DialogTitle>
            <DialogDescription className="text-muted-foreground">Busque un paciente registrado o registre uno nuevo</DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, CI..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" onClick={() => setModalStep('register')}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Nuevo
            </Button>
          </div>

          <div className="overflow-x-auto scrollbar-thin -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  {['Nº', 'Cédula', 'Nombres', 'Apellidos', 'F. Nacimiento', 'Sexo', 'Dirección', 'Teléfono', 'Nacionalidad', 'Estado', 'E. Civil', 'Acciones'].map(h => (
                    <th key={h} className="text-left p-2 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.num} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="p-2 text-foreground whitespace-nowrap">{p.num}</td>
                    <td className="p-2 whitespace-nowrap">
                      {p.ci && !minorCis.has(p.ci) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                          <Check className="w-3 h-3" />
                          {p.ci}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                          <X className="w-3 h-3" />
                          Sin CI
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-foreground whitespace-nowrap">{p.nombres}</td>
                    <td className="p-2 text-foreground whitespace-nowrap">{p.apellidos}</td>
                    <td className="p-2 text-muted-foreground whitespace-nowrap">{p.fechaNac}</td>
                    <td className="p-2 text-foreground whitespace-nowrap">{p.sexo}</td>
                    <td className="p-2 text-muted-foreground truncate max-w-[120px]">{p.direccion}</td>
                    <td className="p-2 text-muted-foreground whitespace-nowrap">{p.telefono}</td>
                    <td className="p-2 text-muted-foreground whitespace-nowrap">{p.nacionalidad}</td>
                    <td className="p-2 text-foreground whitespace-nowrap">{p.estado}</td>
                    <td className="p-2 text-muted-foreground whitespace-nowrap">{p.estadoCivil}</td>
                    <td className="p-2 whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(p); setMotivoData({ numPaciente: String(p.num), descripcion: '', urgencia: '', fecha: '', observacion: '' }); setModalStep('motivo'); }}>
                        <CalendarDays className="w-3 h-3 mr-1" />
                        Agendar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 2: Register New Patient */}
      <Dialog open={modalStep === 'register'} onOpenChange={(o) => !o && setModalStep('search')}>
        <DialogContent className="bg-card border border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Registrar Nuevo Paciente</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Nº Paciente: AUTO-{String(allPatients.length + 1).padStart(4, '0')}
            </DialogDescription>
          </DialogHeader>

          {/* Minor without CI - relocated to top */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMinor"
                checked={isMinor}
                onChange={e => handleMinorChange(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="isMinor" className="text-foreground text-sm">
                Paciente menor de edad sin C.I.
              </Label>
            </div>
            {isMinor && (
              <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border">
                <Label className="text-foreground">Cédula del Representante</Label>
                <Input
                  value={newPatient.ciRepresentante}
                  onChange={e => setNewPatient({ ...newPatient, ciRepresentante: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                  placeholder="Ej: 4568987"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Se usará como documento de identificación del paciente menor.
                </p>
              </div>
            )}
          </div>

          {/* Section 1: Datos Personales */}
          <div className="space-y-4 mt-2">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Datos Personales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Cédula de Identidad</Label>
                <Input
                  value={isMinor ? '' : newPatient.ci}
                  disabled={isMinor}
                  onChange={e => {
                    if (!isMinor) setNewPatient({ ...newPatient, ci: e.target.value.replace(/\D/g, '').slice(0, 8) });
                  }}
                  placeholder={isMinor ? 'Se usará la cédula del representante' : 'Ej: 12345678'}
                  maxLength={8}
                />
                {isMinor && (
                  <p className="text-xs text-muted-foreground">
                    Campo anulado: se usará la Cédula del Representante como documento de identificación.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nombres <span className="text-destructive">*</span></Label>
                <Input value={newPatient.nombres} onChange={e => setNewPatient({ ...newPatient, nombres: e.target.value })} placeholder="Nombres completos" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellidos <span className="text-destructive">*</span></Label>
                <Input value={newPatient.apellidos} onChange={e => setNewPatient({ ...newPatient, apellidos: e.target.value })} placeholder="Apellidos completos" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Fecha de Nacimiento</Label>
                <Input type="date" value={newPatient.fechaNac} onChange={e => setNewPatient({ ...newPatient, fechaNac: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Sexo <span className="text-destructive">*</span></Label>
                <Select value={newPatient.sexo} onValueChange={v => setNewPatient({ ...newPatient, sexo: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Dirección</Label>
                <Input value={newPatient.direccion} onChange={e => setNewPatient({ ...newPatient, direccion: e.target.value })} placeholder="Dirección de residencia" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Teléfono</Label>
                <Input value={newPatient.telefono} onChange={e => setNewPatient({ ...newPatient, telefono: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="04141234567" maxLength={11} />
                {newPatient.telefono && !/^\d{11}$/.test(newPatient.telefono) && (
                  <p className="text-xs text-destructive">Debe ser exactamente 11 dígitos</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nacionalidad <span className="text-destructive">*</span></Label>
                <Select value={newPatient.nacionalidad} onValueChange={v => setNewPatient({ ...newPatient, nacionalidad: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="Venezolano">Venezolano</SelectItem>
                    <SelectItem value="Extranjero">Extranjero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado del Paciente</Label>
                <Select value={newPatient.estado} onValueChange={v => setNewPatient({ ...newPatient, estado: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado Civil <span className="text-destructive">*</span></Label>
                <Select value={newPatient.estadoCivil} onValueChange={v => setNewPatient({ ...newPatient, estadoCivil: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                    <SelectItem value="Casado/a">Casado/a</SelectItem>
                    <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                    <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Ubicación */}
          <div className="space-y-4 mt-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Ubicación
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Comunidad <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Popover open={comunidadOpen} onOpenChange={setComunidadOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comunidadOpen}
                          className="w-full justify-between text-foreground"
                        >
                          {selectedComunidadId
                            ? apiComunidades.find((c: any) => String(c.pk_num_comunidad ?? c.id) === String(selectedComunidadId))?.nombre_comunidad || 'Seleccionar...'
                            : 'Seleccionar comunidad...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[400px] overflow-hidden" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar comunidad..." value={comunidadSearch} onValueChange={setComunidadSearch} />
                          <CommandList>
                            <CommandEmpty>
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">No encontrada</div>
                            </CommandEmpty>
                            <CommandGroup>
                              {apiComunidades.map((c: any) => {
                                const id = String(c.pk_num_comunidad ?? c.id);
                                return (
                                  <CommandItem
                                    key={id}
                                    value={`${c.nombre_comunidad} ${c.estado} ${c.municipio} ${c.parroquia}`}
                                    onSelect={() => {
                                      setSelectedComunidadId(Number(id));
                                      setNewPatient({ ...newPatient, comunidad: c.nombre_comunidad, estadoUbic: c.estado, municipio: c.municipio, parroquia: c.parroquia });
                                      setComunidadOpen(false);
                                      setComunidadSearch('');
                                    }}
                                  >
                                    <Check className={cn('mr-2 h-4 w-4', selectedComunidadId === Number(id) ? 'opacity-100' : 'opacity-0')} />
                                    <div className="flex flex-col">
                                      <span>{c.nombre_comunidad}</span>
                                      <span className="text-xs text-muted-foreground">{c.estado} - {c.municipio} - {c.parroquia}</span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 px-2"
                    title="Crear nueva comunidad"
                    onClick={() => {
                      setShowNewComunidadForm(!showNewComunidadForm);
                      setNewComunidad({ nombre_comunidad: comunidadSearch || '', estado: '', municipio: '', parroquia: '' });
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {showNewComunidadForm && (
                  <div className="border border-border rounded-lg p-3 space-y-2 bg-background/50">
                    <p className="text-xs text-muted-foreground font-medium">Nueva Comunidad</p>
                    <Input placeholder="Nombre de la comunidad" value={newComunidad.nombre_comunidad} onChange={e => setNewComunidad({ ...newComunidad, nombre_comunidad: e.target.value })} className="h-8 text-sm" />
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="Estado *" value={newComunidad.estado} onChange={e => setNewComunidad({ ...newComunidad, estado: e.target.value })} className="h-8 text-sm" />
                      <Input placeholder="Municipio *" value={newComunidad.municipio} onChange={e => setNewComunidad({ ...newComunidad, municipio: e.target.value })} className="h-8 text-sm" />
                      <Input placeholder="Parroquia *" value={newComunidad.parroquia} onChange={e => setNewComunidad({ ...newComunidad, parroquia: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={async () => {
                          const err = validateWithZod(nuevaComunidadSchema, newComunidad);
                          if (err) {
                            toast.error(err);
                            return;
                          }
                          try {
                            const res = await createComunidad.mutateAsync(newComunidad);
                            const newId = res?.pk_num_comunidad || res?.id;
                            if (newId) {
                              setSelectedComunidadId(Number(newId));
                              setNewPatient({ ...newPatient, comunidad: newComunidad.nombre_comunidad, estadoUbic: newComunidad.estado, municipio: newComunidad.municipio, parroquia: newComunidad.parroquia });
                            }
                            setShowNewComunidadForm(false);
                            setComunidadOpen(false);
                            setComunidadSearch('');
                            toast.success('Comunidad creada');
                          } catch (err: any) {
                            toast.error(err?.response?.data?.message || 'Error al crear comunidad');
                          }
                        }}
                      >
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowNewComunidadForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado</Label>
                <Input value={newPatient.estadoUbic} onChange={e => setNewPatient({ ...newPatient, estadoUbic: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Municipio</Label>
                <Input value={newPatient.municipio} onChange={e => setNewPatient({ ...newPatient, municipio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Parroquia</Label>
                <Input value={newPatient.parroquia} onChange={e => setNewPatient({ ...newPatient, parroquia: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-border">
            <Button
              type="button"
              onClick={() => setConfirmAction('save')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Guardar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmAction('saveContinue')}
            >
              Guardar y Continuar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAction('cancel')}
            >
              Cancelar
            </Button>
          </div>

          <ConfirmDialog
            open={confirmAction !== null}
            onOpenChange={(open) => !open && setConfirmAction(null)}
            onConfirm={handleConfirmAction}
            title="¿Estás seguro?"
            description={
              confirmAction === 'cancel'
                ? 'Se perderán los cambios no guardados.'
                : confirmAction === 'saveContinue'
                ? 'Se guardarán los datos y podrá registrar otro paciente.'
                : 'Se guardarán los datos ingresados.'
            }
          />
        </DialogContent>
      </Dialog>

      {/* Step 3: Schedule - Doctors grouped by specialty */}
      <Dialog open={modalStep === 'schedule'} onOpenChange={(o) => !o && setModalStep('closed')}>
        <DialogContent className="bg-card border border-border max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Agendar Cita - {selectedPatient?.nombres} {selectedPatient?.apellidos}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Seleccione un especialista para asignar la cita
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {doctorsBySpecialty.map(group => (
              <div key={group.specialty} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                  {group.specialty}
                </h3>
                <div className="space-y-2">
                  {group.doctors.map(doc => {
                    const days = doctorDaysMap.get(String(doc.mpps));
                    const dayOrder = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];
                    const orderedDays = days ? dayOrder.filter(d => days.has(d)) : [];
                    const dayAbbr: Record<string, string> = { Lunes: 'Lu', Martes: 'Ma', Miercoles: 'Mi', Jueves: 'Ju', Viernes: 'Vi', Sabado: 'Sa', Domingo: 'Do' };
                    return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="font-medium text-foreground">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {doc.mpps} · Carga actual: {doc.carga}
                        </span>
                        {orderedDays.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {orderedDays.map(d => (
                              <span key={d} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/15 text-success border border-success/20">
                                {dayAbbr[d] || d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 ml-3"
                        onClick={() => handleAsignarCita({ ...doc, specialty: group.specialty })}
                      >
                        Asignar Cita
                      </Button>
                    </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 4: Motivo de Consulta */}
      <Dialog open={modalStep === 'motivo'} onOpenChange={(o) => !o && setModalStep('search')}>
        <DialogContent className="bg-card border border-border w-[92vw] max-w-2xl max-h-[82vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-foreground">Motivo de Consulta</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Paciente: {selectedPatient?.nombres} {selectedPatient?.apellidos}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 pr-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nº Paciente</Label>
              <Input value={motivoData.numPaciente} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Descripción <span className="text-destructive">*</span></Label>
              <Textarea
                value={motivoData.descripcion}
                onChange={e => setMotivoData({ ...motivoData, descripcion: e.target.value })}
                placeholder="Describa el motivo de la consulta (mínimo 10 caracteres)"
                rows={3}
              />
              {motivoData.descripcion && motivoData.descripcion.trim().length < 10 && (
                <p className="text-xs text-destructive">Mínimo 10 caracteres ({motivoData.descripcion.trim().length}/10)</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Nivel de Urgencia <span className="text-destructive">*</span></Label>
              <Select value={motivoData.urgencia} onValueChange={v => setMotivoData({ ...motivoData, urgencia: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="Bajo">Bajo</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Fecha <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={motivoData.fecha}
                onChange={e => setMotivoData({ ...motivoData, fecha: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Observación</Label>
              <Textarea
                value={motivoData.observacion}
                onChange={e => setMotivoData({ ...motivoData, observacion: e.target.value })}
                placeholder="Observaciones adicionales (opcional)"
                rows={2}
              />
            </div>
          </div>

          <div className="shrink-0 flex justify-end px-6 py-4 border-t border-border bg-card">
            <Button
              disabled={!isMotivoValid}
              onClick={handleSiguienteMotivo}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Siguiente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 5: Cita Médica - Fullscreen */}
      <Dialog open={modalStep === 'fullCita'} onOpenChange={(o) => !o && setModalStep('schedule')}>
        <DialogContent className="bg-card border border-border max-w-[95vw] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          {/* Hidden header for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>Cita Médica</DialogTitle>
            <DialogDescription>Seleccione fecha, hora y tipo de cita</DialogDescription>
          </DialogHeader>

          {/* Sticky top bar with Volver button */}
          <div className="flex items-center px-6 py-3 border-b border-border bg-card shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalStep('schedule')}
              className="text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          {/* Body: grid layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left column — calendar */}
            <div className="lg:col-span-8 p-6 overflow-y-auto border-r border-border min-h-0">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-foreground">Cita Médica</h2>
                <p className="text-sm text-muted-foreground">
                  Nº de Cita Médica: <span className="font-mono font-medium text-foreground">{citaNumber}</span>
                </p>
              </div>

              {/* Month/Year selectors */}
              <div className="flex gap-4 mb-5">
                <div className="flex-1 space-y-2">
                  <Label className="text-foreground font-medium">Mes</Label>
                  <Select value={String(calMonth)} onValueChange={v => setCalMonth(Number(v))}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50 max-h-72">
                      {monthNames.map((m, i) => (
                        <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-foreground font-medium">Año</Label>
                  <Select value={String(calYear)} onValueChange={v => setCalYear(Number(v))}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      {yearsRange.map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calendar */}
              <div className="rounded-xl border border-border p-5 bg-background/50">
                <div className="grid grid-cols-7 gap-2.5 mb-3">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className="text-center text-sm font-bold text-muted-foreground py-1.5">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2.5">
                  {cells.map((day, idx) => {
                    if (day === null) return <div key={idx} />;
                    const key = formatDateKey(calYear, calMonth, day);
                    const isReserved = dayAvailability[key] === 'reserved';
                    const isSelected = selectedDate === key;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        disabled={isReserved}
                        className={cn(
                          'mx-auto w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border-2 transition-all',
                          isReserved && 'bg-destructive text-destructive-foreground border-destructive cursor-not-allowed opacity-70',
                          isSelected && 'bg-primary text-primary-foreground border-primary shadow-md scale-110',
                          !isReserved && !isSelected && 'bg-background text-foreground border-border hover:border-primary hover:bg-primary/5'
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-5 mt-5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-background border-2 border-border" />
                    <span className="text-foreground">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-destructive border-2 border-destructive" />
                    <span className="text-foreground">Reservado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary border-2 border-primary" />
                    <span className="text-foreground">Seleccionado</span>
                  </div>
                </div>
              </div>

              {selectedDayNumber !== null && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Día seleccionado: <span className="font-semibold text-foreground">{selectedDayNumber}</span>
                </div>
              )}
            </div>

            {/* Right column — form controls */}
            <div className="lg:col-span-4 p-6 overflow-y-auto bg-background/30 min-h-0">
              {!selectedDate ? (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-muted-foreground text-base">
                    Seleccione una fecha disponible en el calendario
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Tipo de Cita</Label>
                    <Select value={tipoCita} onValueChange={setTipoCita}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="Primera vez">Primera vez</SelectItem>
                        <SelectItem value="Control">Control</SelectItem>
                        <SelectItem value="Urgencia">Urgencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Motivo</Label>
                    <Input value={motivoTexto} onChange={e => setMotivoTexto(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Turno</Label>
                    <Select value={turno} onValueChange={(v) => { setTurno(v as 'Mañana' | 'Tarde' | 'Noche'); setHoraSeleccionada(''); }}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Seleccionar turno" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="Mañana">Mañana</SelectItem>
                        <SelectItem value="Tarde">Tarde</SelectItem>
                        <SelectItem value="Noche">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Hora Disponible</Label>
                    <Select value={horaSeleccionada} onValueChange={setHoraSeleccionada} disabled={!turno}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={turno ? 'Seleccionar' : 'Seleccione un turno primero'} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        {availableHours.length === 0 ? (
                          <SelectItem value="none" disabled>Sin horarios</SelectItem>
                        ) : (
                          availableHours.map(h => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resumen card */}
                  {isResumenReady && selectedPatient && selectedDoctor && (() => {
                    const doctorSesion = apiSesiones.find((s: any) => {
                      const medicoId = String(s.fk_cm_b001_num_medico_ministerio_salud ?? s.fk_cm_a001_num_medico ?? '');
                      return medicoId === String(selectedDoctor.id);
                    });
                    const horarioSesion = doctorSesion
                      ? `${doctorSesion.hora_inicio || ''} – ${doctorSesion.hora_fin || ''} (${doctorSesion.turno || ''})`
                      : '—';

                    const field = (label: string, value: string | number | undefined | null) => (
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">{label}:</span>
                        <span className="text-foreground font-medium">{value || '—'}</span>
                      </div>
                    );

                    const generarComprobantePDF = async () => {
                      const { default: jsPDF } = await import('jspdf');
                      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
                      const W = doc.internal.pageSize.getWidth();
                      const H = doc.internal.pageSize.getHeight();
                      let y = 40;

                      const line = () => { doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(44, y, W - 44, y); y += 14; };
                      const row = (left: string, right?: string) => {
                        doc.setFontSize(9.5);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(60, 60, 60);
                        doc.text(left, 48, y);
                        if (right) doc.text(right, W / 2 + 10, y);
                        y += 15;
                      };
                      const rowBold = (left: string, right?: string) => {
                        doc.setFontSize(9.5);
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(30, 30, 30);
                        doc.text(left, 48, y);
                        if (right) doc.text(right, W / 2 + 10, y);
                        doc.setFont('helvetica', 'normal');
                        y += 15;
                      };
                      const section = (title: string) => {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(9);
                        doc.setTextColor(100, 100, 100);
                        doc.text(title, 48, y);
                        doc.setFont('helvetica', 'normal');
                        y += 14;
                      };

                      // Header
                      doc.setFillColor(41, 98, 255);
                      doc.rect(0, 0, W, 72, 'F');
                      doc.setTextColor(255, 255, 255);
                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(14);
                      doc.text('Centro Ambulatorio Dr. Salvador Allende', 48, 30);
                      doc.setFontSize(11);
                      doc.text('Comprobante de Cita Médica', 48, 50);
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(9);
                      doc.text(`N° ${citaNumber}`, W - 48, 50, { align: 'right' });
                      y = 88;

                      // Datos de la cita
                      section('DATOS DE LA CITA');
                      row(`Fecha: ${selectedDate || '—'}`, `Hora: ${horaSeleccionada || '—'}`);
                      row(`Turno: ${turno || '—'}`, `Tipo: ${tipoCita || '—'}`);
                      row(`Caso: ${remitido === 'si' ? 'Remitido' : 'Directo'}`, `Fecha de registro: ${new Date().toLocaleDateString('es-VE')}`);
                      line();

                      // Datos del paciente
                      section('DATOS DEL PACIENTE');
                      rowBold(`Cédula: ${selectedPatient.ci}`, `Nombres: ${selectedPatient.nombres}`);
                      rowBold(`Apellidos: ${selectedPatient.apellidos}`, `Fecha Nac.: ${selectedPatient.fechaNac}`);
                      row(`Sexo: ${selectedPatient.sexo}`, `Teléfono: ${selectedPatient.telefono || '—'}`);
                      row(`Dirección: ${selectedPatient.direccion || '—'}`);
                      row(`Comunidad: ${selectedPatient.comunidad || '—'}`, `Parroquia: ${selectedPatient.parroquia || '—'}`);
                      row(`Municipio: ${selectedPatient.municipio || '—'}`, `Estado: ${selectedPatient.estadoGeo || '—'}`);
                      row(`Estado de salud: ${selectedPatient.estado || '—'}`);
                      line();

                      // Médico tratante
                      section('MÉDICO TRATANTE');
                      rowBold(`N° MPPS: ${selectedDoctor.mpps}`, `Especialidad: ${selectedDoctor.specialty}`);
                      rowBold(`Nombres y Apellidos: ${selectedDoctor.name}`);
                      row(`Horario de sesión: ${horarioSesion}`, `Carga: ${selectedDoctor.carga || '—'}`);
                      line();

                      // Motivo de consulta
                      section('MOTIVO DE CONSULTA');
                      doc.setFontSize(9.5);
                      doc.setFont('helvetica', 'normal');
                      doc.setTextColor(60, 60, 60);
                      const descText = motivoData.descripcion || motivoTexto || '—';
                      const split = doc.splitTextToSize(descText, W - 96);
                      doc.text(split, 48, y);
                      y += split.length * 12 + 6;
                      row(`Nivel de Urgencia: ${motivoData.urgencia || '—'}`, `Remisión: ${remitido === 'si' ? 'Sí' : 'No'}`);
                      if (motivoData.observacion) {
                        row(`Observación: ${motivoData.observacion}`);
                      }
                      line();

                      // Footer
                      doc.setFontSize(7.5);
                      doc.setTextColor(150, 150, 150);
                      doc.text(`Centro Ambulatorio Dr. Salvador Allende — Comprobante de Cita — Generado: ${new Date().toLocaleString('es-VE')}`, W / 2, H - 24, { align: 'center' });

                      doc.save(`Comprobante_${citaNumber}.pdf`);
                    };

                    return (
                      <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <div className="bg-primary px-4 py-3 flex items-start justify-between">
                          <div>
                            <h3 className="text-xs font-semibold text-primary-foreground">Centro Ambulatorio Dr. Salvador Allende</h3>
                            <p className="text-sm font-bold text-primary-foreground">Comprobante de Cita Médica</p>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-primary-foreground/70">N° cita</div>
                            <div className="font-mono font-semibold text-sm text-primary-foreground">{citaNumber}</div>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs pb-3 border-b border-border/60">
                            {field('Fecha de Cita', selectedDate)}
                            {field('Hora Asignada', horaSeleccionada)}
                            {field('Turno', turno)}
                            {field('Tipo de Cita', tipoCita)}
                            <div className="col-span-2 flex items-center gap-2 pt-1">
                              <span className="text-muted-foreground text-xs">Caso:</span>
                              <RadioGroup value={remitido} onValueChange={(v) => setRemitido(v as 'si' | 'no')} className="flex gap-3">
                                <div className="flex items-center gap-1">
                                  <RadioGroupItem value="si" id="rem-si" />
                                  <Label htmlFor="rem-si" className="text-foreground text-xs">Remitido</Label>
                                </div>
                                <div className="flex items-center gap-1">
                                  <RadioGroupItem value="no" id="rem-no" />
                                  <Label htmlFor="rem-no" className="text-foreground text-xs">Directo</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>

                          <div className="space-y-1.5 pb-3 border-b border-border/60">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-primary">Datos del Paciente</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              {field('Cédula', selectedPatient.ci)}
                              {field('Nombres', selectedPatient.nombres)}
                              {field('Apellidos', selectedPatient.apellidos)}
                              {field('F. Nac.', selectedPatient.fechaNac)}
                              {field('Sexo', selectedPatient.sexo)}
                              {field('Teléfono', selectedPatient.telefono)}
                              {field('Dirección', selectedPatient.direccion)}
                              {field('Comunidad', selectedPatient.comunidad)}
                              {field('Parroquia', selectedPatient.parroquia)}
                              {field('Municipio', selectedPatient.municipio)}
                              {field('Estado', selectedPatient.estadoGeo)}
                              {field('Estado de salud', selectedPatient.estado)}
                            </div>
                          </div>

                          <div className="space-y-1.5 pb-3 border-b border-border/60">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-primary">Médico Tratante</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              {field('N° MPPS', selectedDoctor.mpps)}
                              {field('Especialidad', selectedDoctor.specialty)}
                              {field('Nombres y Apellidos', selectedDoctor.name)}
                              {field('Horario de Sesión', horarioSesion)}
                              {field('Carga de pacientes', selectedDoctor.carga)}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-primary">Motivo de Consulta</h4>
                            <p className="text-xs text-foreground whitespace-pre-wrap bg-muted/30 rounded-md p-2.5">{motivoTexto || '—'}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              {field('Nivel de Urgencia', motivoData.urgencia)}
                              {field('Remisión', remitido === 'si' ? 'Sí' : 'No')}
                              {motivoData.observacion && field('Observación', motivoData.observacion)}
                            </div>
                          </div>
                        </div>

                        <div className="px-4 pb-4">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={generarComprobantePDF}
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Generar Comprobante de Cita
                          </Button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bottom buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setModalStep('schedule')}
                    >
                      Regresar
                    </Button>
                    <Button
                      disabled={!isResumenReady}
                      onClick={handleAgendarCitaFinal}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Agendar Cita
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelCitaId !== null}
        onOpenChange={(open) => { if (!open) setCancelCitaId(null); }}
        onConfirm={handleCancelCita}
        title="¿Cancelar esta cita?"
        description="La cita quedará registrada como cancelada. Esta acción no se puede deshacer."
      />
    </div>
  );
}
