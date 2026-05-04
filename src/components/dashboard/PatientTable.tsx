import { useMemo, useState } from 'react';
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
import { usePatients, type Patient } from '@/data/patientsStore';
import { useReportableTable } from '@/components/reports/useReportableTable';
import type { ReportableModule } from '@/components/reports/types';

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
  const patients = usePatients();
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [comunidadFilter, setComunidadFilter] = useState<string>('all');
  const [complDetail, setComplDetail] = useState<Patient | null>(null);
  const [comunDetail, setComunDetail] = useState<Patient | null>(null);

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

  return (
    <>
      <div className="chart-container animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Pacientes Registrados</h3>
            <p className="text-sm text-muted-foreground">{filtered.length} de {patients.length} pacientes</p>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 p-3">{reports.HeaderCheckbox}</th>
                {['Nº', 'C.I.', 'Nombres', 'Apellidos', 'Detalles Complementarios', 'Detalles Comunitarios', 'Estado'].map(h => (
                  <th key={h} className="text-left p-3 text-sm font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const selected = reports.isRowSelected(p.num);
                return (
                  <tr key={p.num}
                    className={cn(
                      'border-b border-border/50 transition-colors',
                      selected ? 'bg-primary/10' : (idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'),
                      'hover:bg-secondary/50'
                    )}>
                    <td className="p-3"><reports.RowCheckbox id={p.num} /></td>
                    <td className="p-3 text-sm font-mono text-foreground">{p.num}</td>
                    <td className="p-3 text-sm font-mono text-foreground">{p.ci}</td>
                    <td className="p-3 text-sm text-foreground">{p.nombres}</td>
                    <td className="p-3 text-sm text-foreground">{p.apellidos}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => setComplDetail(p)}>
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Button>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => setComunDetail(p)}>
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Button>
                    </td>
                    <td className="p-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                        p.estado === 'Activo' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning')}>
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No se encontraron pacientes.</div>
        )}
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
