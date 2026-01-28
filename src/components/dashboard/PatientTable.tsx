import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  comunidad: string;
  condicion: string;
  urgencia: boolean;
  tipoEnfermedad: 'viral' | 'transmision' | 'otra';
  edad: number;
}

const patients: Patient[] = [
  { id: 'P001', nombre: 'María', apellido: 'García', direccion: 'Calle Principal 123', telefono: '555-0101', comunidad: 'Centro', condicion: 'Gripe', urgencia: false, tipoEnfermedad: 'viral', edad: 34 },
  { id: 'P002', nombre: 'Carlos', apellido: 'López', direccion: 'Av. Libertad 456', telefono: '555-0102', comunidad: 'Norte', condicion: 'Fractura', urgencia: true, tipoEnfermedad: 'otra', edad: 45 },
  { id: 'P003', nombre: 'Ana', apellido: 'Martínez', direccion: 'Calle del Sol 789', telefono: '555-0103', comunidad: 'Sur', condicion: 'COVID-19', urgencia: true, tipoEnfermedad: 'viral', edad: 62 },
  { id: 'P004', nombre: 'Pedro', apellido: 'Sánchez', direccion: 'Plaza Mayor 12', telefono: '555-0104', comunidad: 'Este', condicion: 'Hepatitis', urgencia: false, tipoEnfermedad: 'transmision', edad: 28 },
  { id: 'P005', nombre: 'Laura', apellido: 'Fernández', direccion: 'Calle Luna 34', telefono: '555-0105', comunidad: 'Oeste', condicion: 'Varicela', urgencia: false, tipoEnfermedad: 'viral', edad: 8 },
  { id: 'P006', nombre: 'Miguel', apellido: 'Torres', direccion: 'Av. Central 567', telefono: '555-0106', comunidad: 'Centro', condicion: 'Infarto', urgencia: true, tipoEnfermedad: 'otra', edad: 71 },
  { id: 'P007', nombre: 'Sofia', apellido: 'Ruiz', direccion: 'Calle Verde 89', telefono: '555-0107', comunidad: 'Norte', condicion: 'Influenza', urgencia: false, tipoEnfermedad: 'viral', edad: 15 },
  { id: 'P008', nombre: 'Diego', apellido: 'Moreno', direccion: 'Paseo del Río 23', telefono: '555-0108', comunidad: 'Sur', condicion: 'Tuberculosis', urgencia: true, tipoEnfermedad: 'transmision', edad: 52 },
  { id: 'P009', nombre: 'Elena', apellido: 'Jiménez', direccion: 'Calle Azul 45', telefono: '555-0109', comunidad: 'Este', condicion: 'Diabetes', urgencia: false, tipoEnfermedad: 'otra', edad: 48 },
  { id: 'P010', nombre: 'Andrés', apellido: 'Díaz', direccion: 'Av. Principal 678', telefono: '555-0110', comunidad: 'Oeste', condicion: 'Sarampión', urgencia: false, tipoEnfermedad: 'viral', edad: 5 },
];

type SortField = 'id' | 'nombre' | 'apellido' | 'comunidad' | 'condicion' | 'edad';
type SortOrder = 'asc' | 'desc';

export function PatientTable() {
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [diseaseFilter, setDiseaseFilter] = useState<string>('all');
  const [communityFilter, setCommunityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const communities = useMemo(() => 
    [...new Set(patients.map(p => p.comunidad))],
    []
  );

  const filteredPatients = useMemo(() => {
    return patients
      .filter(patient => {
        const matchesSearch = 
          patient.nombre.toLowerCase().includes(search.toLowerCase()) ||
          patient.apellido.toLowerCase().includes(search.toLowerCase()) ||
          patient.id.toLowerCase().includes(search.toLowerCase()) ||
          patient.condicion.toLowerCase().includes(search.toLowerCase());
        
        const matchesUrgency = 
          urgencyFilter === 'all' ||
          (urgencyFilter === 'urgent' && patient.urgencia) ||
          (urgencyFilter === 'non-urgent' && !patient.urgencia);
        
        const matchesDisease =
          diseaseFilter === 'all' ||
          patient.tipoEnfermedad === diseaseFilter;
        
        const matchesCommunity =
          communityFilter === 'all' ||
          patient.comunidad === communityFilter;
        
        return matchesSearch && matchesUrgency && matchesDisease && matchesCommunity;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
  }, [search, urgencyFilter, diseaseFilter, communityFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const getAgeGroup = (edad: number): string => {
    if (edad <= 12) return '0-12';
    if (edad <= 18) return '13-18';
    if (edad <= 59) return '19-59';
    return '60+';
  };

  return (
    <div className="chart-container animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Pacientes Registrados</h3>
          <p className="text-sm text-muted-foreground">
            {filteredPatients.length} de {patients.length} pacientes
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Urgencia" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="urgent">Urgentes</SelectItem>
              <SelectItem value="non-urgent">No Urgentes</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="viral">Viral</SelectItem>
              <SelectItem value="transmision">Transmisión</SelectItem>
              <SelectItem value="otra">Otra</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={communityFilter} onValueChange={setCommunityFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Comunidad" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              <SelectItem value="all">Todas</SelectItem>
              {communities.map(community => (
                <SelectItem key={community} value={community}>{community}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th 
                className="text-left p-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('id')}
              >
                ID <SortIcon field="id" />
              </th>
              <th 
                className="text-left p-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('nombre')}
              >
                Nombre <SortIcon field="nombre" />
              </th>
              <th 
                className="text-left p-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('apellido')}
              >
                Apellido <SortIcon field="apellido" />
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Dirección</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Teléfono</th>
              <th 
                className="text-left p-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('comunidad')}
              >
                Comunidad <SortIcon field="comunidad" />
              </th>
              <th 
                className="text-left p-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('condicion')}
              >
                Condición <SortIcon field="condicion" />
              </th>
              <th 
                className="text-left p-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('edad')}
              >
                Edad <SortIcon field="edad" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, idx) => (
              <tr 
                key={patient.id}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-secondary/50",
                  idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <td className="p-3 text-sm font-mono text-foreground">{patient.id}</td>
                <td className="p-3 text-sm text-foreground">{patient.nombre}</td>
                <td className="p-3 text-sm text-foreground">{patient.apellido}</td>
                <td className="p-3 text-sm text-muted-foreground">{patient.direccion}</td>
                <td className="p-3 text-sm text-muted-foreground">{patient.telefono}</td>
                <td className="p-3 text-sm text-foreground">{patient.comunidad}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      patient.urgencia 
                        ? "bg-destructive/20 text-destructive" 
                        : "bg-success/20 text-success"
                    )}>
                      {patient.urgencia ? 'Urgente' : 'Normal'}
                    </span>
                    <span className="text-sm text-foreground">{patient.condicion}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{patient.edad}</span>
                    <span className="text-xs text-muted-foreground">({getAgeGroup(patient.edad)})</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron pacientes con los filtros seleccionados.
        </div>
      )}
    </div>
  );
}
