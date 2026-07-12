import { useMemo, useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useReportableTable } from '@/components/reports/useReportableTable';
import type { ReportableModule } from '@/components/reports/types';
import { TablePagination } from '@/components/shared/TablePagination';
import { usePacientes } from '@/services/usePacientes';
import { useComunidades } from '@/services/useComunidades';

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

function calcAge(fechaNac: string): number {
  if (!fechaNac) return 0;
  const birth = new Date(fechaNac);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const sexoLabel = (s: string) => (s === 'M' ? 'Masculino' : s === 'F' ? 'Femenino' : s);

export function PatientTable() {
  const { data: apiPatients = [], isLoading } = usePacientes();
  const { data: apiComunidades = [] } = useComunidades();

  const comunidadMap = useMemo(() => {
    const map = new Map<string, any>();
    apiComunidades.forEach((c: any) => {
      const id = String(c.pk_num_comunidad ?? c.id ?? '');
      if (id) map.set(id, c);
    });
    return map;
  }, [apiComunidades]);

  const patients = useMemo(() => apiPatients.map((p: any, idx: number) => {
    const comunidadId = String(p.fk_ps_a001_num_comunidad ?? '');
    const com = comunidadMap.get(comunidadId);
    return {
      num: p.pk_num_paciente || p.id || String(idx + 1).padStart(4, '0'),
      ci: p.ci || '',
      nombres: p.nombres || '',
      apellidos: p.apellidos || '',
      fechaNac: p.fecha_nacimiento || p.fechaNac || '',
      sexo: p.sexo === 'femenino' ? 'F' : p.sexo === 'masculino' ? 'M' : p.sexo || '',
      direccion: p.direccion || '',
      telefono: p.telefono || '',
      nacionalidad: p.nacionalidad === 'venezolano' ? 'V' : p.nacionalidad === 'extranjero' ? 'E' : p.nacionalidad || '',
      estadoCivil: p.estado_civil || '',
      comunidad: com?.nombre_comunidad || com?.nombre || 'Desconocida',
      estadoGeo: com?.estado || 'Desconocido',
      municipio: com?.municipio || 'Desconocido',
      parroquia: com?.parroquia || 'Desconocida',
      estado: p.estado_paciente === 'activo' ? 'Activo' : p.estado_paciente === 'encamado' ? 'Encamado' : p.estado_paciente || 'Activo',
    };
  }), [apiPatients, comunidadMap]);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [comunidadFilter, setComunidadFilter] = useState<string>('all');
  const [complDetail, setComplDetail] = useState<Patient | null>(null);
  const [comunDetail, setComunDetail] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const communities = useMemo(() => Array.from(new Set(patients.map(p => p.comunidad))), [patients]);

  const filtered = useMemo(() => patients.filter(p => {
    const s = search.toLowerCase();
    const okSearch = !s ||
      p.nombres.toLowerCase().includes(s) ||
      p.apellidos.toLowerCase().includes(s) ||
      p.ci.toLowerCase().includes(s);
    const okEstado = estadoFilter === 'all' || p.estado === estadoFilter;
    const okComunidad = comunidadFilter === 'all' || p.comunidad === comunidadFilter;
    return okSearch && okEstado && okComunidad;
  }), [patients, search, estadoFilter, comunidadFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search, estadoFilter, comunidadFilter]);

  const reportModule: ReportableModule<Patient> = useMemo(() => ({
    name: 'Pacientes',
    itemSingular: 'paciente',
    itemPlural: 'pacientes',
    rows: patients,
    getId: r => r.num,
    fields: [
      { key: 'num', label: 'Nº', accessor: r => r.num },
      { key: 'ci', label: 'C.I.', accessor: r => r.ci },
      { key: 'nombres', label: 'Nombres', accessor: r => r.nombres },
      { key: 'apellidos', label: 'Apellidos', accessor: r => r.apellidos },
      { key: 'fechaNac', label: 'Fecha de Nacimiento', accessor: r => r.fechaNac },
      { key: 'edad', label: 'Edad', accessor: r => calcAge(r.fechaNac) },
      { key: 'sexo', label: 'Sexo', accessor: r => sexoLabel(r.sexo) },
      { key: 'direccion', label: 'Dirección', accessor: r => r.direccion },
      { key: 'telefono', label: 'Teléfono', accessor: r => r.telefono },
      { key: 'nacionalidad', label: 'Nacionalidad', accessor: r => r.nacionalidad },
      { key: 'estadoCivil', label: 'Estado Civil', accessor: r => r.estadoCivil },
      { key: 'comunidad', label: 'Comunidad', accessor: r => r.comunidad },
      { key: 'estadoGeo', label: 'Estado', accessor: r => r.estadoGeo },
      { key: 'municipio', label: 'Municipio', accessor: r => r.municipio },
      { key: 'parroquia', label: 'Parroquia', accessor: r => r.parroquia },
      { key: 'estado', label: 'Estado del Paciente', accessor: r => r.estado },
    ],
    metrics: rows => ({
      'Total exportados': rows.length,
      'Activos': rows.filter(r => r.estado === 'Activo').length,
      'Encamados': rows.filter(r => r.estado === 'Encamado').length,
    }),
  }), [patients]);

  const reports = useReportableTable({ module: reportModule, visibleRows: filtered });

  if (isLoading) {
    return (
      <div className="chart-container animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4"></div>
        <div className="flex gap-4 mb-4">
          <div className="h-10 w-48 bg-muted rounded"></div>
          <div className="h-10 w-36 bg-muted rounded"></div>
          <div className="h-10 w-36 bg-muted rounded"></div>
        </div>
        <div className="h-64 bg-muted/50 rounded w-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="chart-container animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Pacientes Registrados</h3>
            <p className="text-xs text-muted-foreground">{filtered.length} de {patients.length} pacientes</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Encamado">Encamado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={comunidadFilter} onValueChange={setComunidadFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Comunidad" /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="all">Todas</SelectItem>
                {communities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {reports.SplitButton}
          </div>
        </div>

        {reports.ContextBar}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 p-3">{reports.HeaderCheckbox}</th>
                {['Nº', 'C.I.', 'Nombres', 'Apellidos', 'Detalles Complementarios', 'Detalles Comunitarios', 'Estado'].map(h => (
                  <th key={h} className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                  {filtered.length === 0 ? 'No se encontraron pacientes' : 'Sin pacientes registrados'}
                </td></tr>
              )}
              {paginatedPatients.map((p, idx) => {
                const selected = reports.isRowSelected(p.num);
                const rowNum = (currentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={p.num}
                    className={cn(
                      'border-b border-border/50 transition-colors',
                      selected ? 'bg-primary/10' : 'hover:bg-secondary/30'
                    )}>
                    <td className="p-3"><reports.RowCheckbox id={p.num} /></td>
                    <td className="p-3 font-mono text-muted-foreground text-xs">{p.num}</td>
                    <td className="p-3 font-mono text-foreground text-xs">{p.ci}</td>
                    <td className="p-3 text-foreground">{p.nombres}</td>
                    <td className="p-3 text-foreground">{p.apellidos}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => setComplDetail(p)} className="h-7 text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                      </Button>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => setComunDetail(p)} className="h-7 text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                      </Button>
                    </td>
                    <td className="p-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                        p.estado === 'Activo' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning')}>
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {reports.ReportSheet}

      {/* Detalles Complementarios */}
      <Dialog open={!!complDetail} onOpenChange={(o) => !o && setComplDetail(null)}>
        <DialogContent className="bg-card border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalles Complementarios</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {complDetail?.nombres} {complDetail?.apellidos}
            </DialogDescription>
          </DialogHeader>
          {complDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Fecha de Nacimiento" value={complDetail.fechaNac} />
              <Field label="Edad" value={`${calcAge(complDetail.fechaNac)} años`} />
              <Field label="Sexo" value={sexoLabel(complDetail.sexo)} />
              <Field label="Nacionalidad" value={complDetail.nacionalidad} />
              <Field label="Teléfono" value={complDetail.telefono} />
              <Field label="Estado Civil" value={complDetail.estadoCivil} />
              <Field label="Dirección" value={complDetail.direccion} colSpan={2} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detalles Comunitarios */}
      <Dialog open={!!comunDetail} onOpenChange={(o) => !o && setComunDetail(null)}>
        <DialogContent className="bg-card border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Detalles Comunitarios</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {comunDetail?.nombres} {comunDetail?.apellidos}
            </DialogDescription>
          </DialogHeader>
          {comunDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Nº" value={String(comunDetail.num)} />
              <Field label="Comunidad" value={comunDetail.comunidad} />
              <Field label="Estado" value={comunDetail.estadoGeo} />
              <Field label="Municipio" value={comunDetail.municipio} />
              <Field label="Parroquia" value={comunDetail.parroquia} colSpan={2} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, value, colSpan }: { label: string; value: string; colSpan?: number }) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-foreground">{value || '—'}</div>
    </div>
  );
}
