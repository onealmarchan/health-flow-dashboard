import { useState } from 'react';
import { UserCog, Plus, Phone, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ModalFormButtons } from '@/components/shared/ModalFormButtons';
import { useMedicos, useEspecialidades, useCreateMedico, useCreateEspecialidad } from '@/hooks/useMedicos';

type ModalView = 'closed' | 'search' | 'new';

export function EspecialistasPage() {
  const [modalView, setModalView] = useState<ModalView>('closed');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Formulario para Nuevo Médico
  const [newSpec, setNewSpec] = useState({ 
    mpps: '', 
    nombre: '', 
    apellido: '', 
    telefono: '', 
    especialidadId: '' 
  });
  
  // Modal de Especialidad
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [newEspecialidad, setNewEspecialidad] = useState({ nombre: '', descripcion: '' });

  // ─── Hooks de Datos (API) ───
  const { data: medicos = [], isLoading: isLoadingMedicos, isError: isErrorMedicos, error: errorMedicos, refetch: refetchMedicos } = useMedicos();
  const { data: especialidades = [], isLoading: isLoadingEsp } = useEspecialidades();
  const createMedicoMutation = useCreateMedico();
  const createEspecialidadMutation = useCreateEspecialidad();

  // ─── Filtrado ───
  const filteredSpecialists = medicos.filter(m => {
    const fullName = `${m.nombre} ${m.apellido}`.toLowerCase();
    const mppsString = m.pk_num_medico_ministerio_salud.toString();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || mppsString.includes(query);
  });

  // ─── Handlers de Acciones ───
  const resetForm = () => {
    setNewSpec({ mpps: '', nombre: '', apellido: '', telefono: '', especialidadId: '' });
  };

  const handleSave = (createAnother: boolean = false) => {
    // Basic validation
    if (!newSpec.mpps || !newSpec.nombre || !newSpec.apellido || !newSpec.especialidadId) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    const mppsNumber = parseInt(newSpec.mpps.replace(/\D/g, ''), 10);
    if (isNaN(mppsNumber)) {
      toast.error('El número MPPS debe contener valores numéricos validos');
      return;
    }

    createMedicoMutation.mutate({
      pk_num_medico_ministerio_salud: mppsNumber,
      nombre: newSpec.nombre.trim(),
      apellido: newSpec.apellido.trim(),
      telefono: newSpec.telefono.trim(),
      fk_cm_a001_num_especialidad: parseInt(newSpec.especialidadId, 10),
      carga_paciente: 0,
    }, {
      onSuccess: () => {
        resetForm();
        if (createAnother) {
            setModalView('new');
        } else {
            setModalView('search');
        }
      }
    });
  };

  const handleSaveEspecialidad = () => {
    const nombre = newEspecialidad.nombre.trim();
    if (!nombre) {
      toast.error('El nombre de la especialidad es obligatorio');
      return;
    }
    
    createEspecialidadMutation.mutate({
      nombre,
      descripcion: newEspecialidad.descripcion.trim(),
    }, {
      onSuccess: (data) => {
        // Enlazar inmediatamente a la nueva especialidad creada
        setNewSpec(s => ({ ...s, especialidadId: data.pk_num_especialidad.toString() }));
        setNewEspecialidad({ nombre: '', descripcion: '' });
        setSpecModalOpen(false);
      }
    });
  };

  // ─── Estados de Carga y Error Global ───
  if (isLoadingMedicos || isLoadingEsp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Cargando directorio de especialistas...</p>
      </div>
    );
  }

  if (isErrorMedicos) {
     return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <p className="text-foreground text-lg font-semibold">Error al cargar listado médico</p>
        <p className="text-muted-foreground text-sm max-w-md text-center">
          {errorMedicos instanceof Error ? errorMedicos.message : 'Error desconocido al conectar con el servidor.'}
        </p>
        <Button onClick={() => refetchMedicos()} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Especialistas Médicos</h1>
          <p className="text-muted-foreground">Directorio de profesionales de la salud</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setModalView('search')}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Especialista
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medicos.map(medico => (
          <div key={medico.pk_num_medico_ministerio_salud} className="metric-card">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <UserCog className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success`}>
                Disponible {/* Todo: Revisar manejo real de disponibilidad si en el futuro se implementa */}
              </span>
            </div>

            <h3 className="font-semibold text-foreground">{medico.nombre} {medico.apellido}</h3>
            <p className="text-sm text-primary mb-1">
               {medico.especialidad?.nombre || especialidades.find(e => e.pk_num_especialidad === medico.fk_cm_a001_num_especialidad)?.nombre || 'General'}
            </p>
            <p className="text-xs text-muted-foreground font-mono mb-3">MPPS-{medico.pk_num_medico_ministerio_salud}</p>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">{medico.carga_paciente || 0} pacientes</span>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{medico.telefono || 'Sin registro'}</span>
              </div>
            </div>
          </div>
        ))}
        {medicos.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
               <UserCog className="w-12 h-12 opacity-20" />
               <p>No se encontraron especialistas registrados en el sistema.</p>
            </div>
        )}
      </div>

      {/* Search Specialist Modal */}
      <Dialog open={modalView === 'search'} onOpenChange={(o) => !o && setModalView('closed')}>
        <DialogContent className="bg-card border border-border max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Buscar Especialista</DialogTitle>
            <DialogDescription className="text-muted-foreground">Busque por nombre, documento o colegiatura</DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" onClick={() => setModalView('new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Médico
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Nº MPPS', 'Nombre', 'Apellido', 'Especialidad', 'Teléfono', 'Pacientes'].map(h => (
                    <th key={h} className="text-left p-2 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSpecialists.map(m => (
                  <tr key={m.pk_num_medico_ministerio_salud} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="p-2 text-foreground font-mono">MPPS-{m.pk_num_medico_ministerio_salud}</td>
                    <td className="p-2 text-foreground">{m.nombre}</td>
                    <td className="p-2 text-foreground">{m.apellido}</td>
                    <td className="p-2 text-muted-foreground">
                       {m.especialidad?.nombre || especialidades.find(e => e.pk_num_especialidad === m.fk_cm_a001_num_especialidad)?.nombre || 'General'}
                    </td>
                    <td className="p-2 text-muted-foreground">{m.telefono}</td>
                    <td className="p-2 text-foreground">{m.carga_paciente || 0}</td>
                  </tr>
                ))}
                {filteredSpecialists.length === 0 && (
                   <tr>
                       <td colSpan={6} className="p-4 text-center text-muted-foreground">No se hallaron resultados para su búsqueda</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Specialist Modal */}
      <Dialog open={modalView === 'new'} onOpenChange={(o) => { if(!o){ setModalView('search'); resetForm(); } }}>
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Especialista</DialogTitle>
            <DialogDescription className="text-muted-foreground">Registre un nuevo especialista médico</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Número MPPS</Label>
              <Input 
                value={newSpec.mpps} 
                onChange={e => setNewSpec({ ...newSpec, mpps: e.target.value.replace(/\D/g, '') })} 
                placeholder="Ej. 12435" 
                type="text"
              />
               <p className="text-[10px] text-muted-foreground leading-none">Solo introduzca los dígitos numéricos de la matricula del MPPS.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nombre</Label>
                <Input value={newSpec.nombre} onChange={e => setNewSpec({ ...newSpec, nombre: e.target.value })} placeholder="Nombres" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellido</Label>
                <Input value={newSpec.apellido} onChange={e => setNewSpec({ ...newSpec, apellido: e.target.value })} placeholder="Apellidos" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Teléfono</Label>
              <Input value={newSpec.telefono} onChange={e => setNewSpec({ ...newSpec, telefono: e.target.value })} placeholder="Ej. 0414-0000000" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Especialidad</Label>
              <div className="flex gap-2">
                <Select value={newSpec.especialidadId} onValueChange={v => setNewSpec({ ...newSpec, especialidadId: v })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccione una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map(e => (
                      <SelectItem key={e.pk_num_especialidad} value={e.pk_num_especialidad.toString()}>
                         {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSpecModalOpen(true)}
                  title="Agregar nueva especialidad"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <ModalFormButtons
            saving={createMedicoMutation.isPending}
            onSave={() => handleSave(false)}
            onSaveAndAnother={() => handleSave(true)}
            onCancel={() => { setModalView('search'); resetForm(); }}
          />
        </DialogContent>
      </Dialog>

      {/* Nested: Registro de Especialidad Médica */}
      <Dialog open={specModalOpen} onOpenChange={setSpecModalOpen}>
        <DialogContent className="bg-card border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Registro de Especialidad Médica</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Agregue una nueva especialidad al catálogo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nombre <span className="text-destructive">*</span></Label>
              <Input
                value={newEspecialidad.nombre}
                onChange={e => setNewEspecialidad({ ...newEspecialidad, nombre: e.target.value })}
                placeholder="Ej. Oftalmología"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Descripción</Label>
              <Textarea
                value={newEspecialidad.descripcion}
                onChange={e => setNewEspecialidad({ ...newEspecialidad, descripcion: e.target.value })}
                placeholder="Descripción opcional de la especialidad..."
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={createEspecialidadMutation.isPending}
              onClick={() => { setNewEspecialidad({ nombre: '', descripcion: '' }); setSpecModalOpen(false); }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={createEspecialidadMutation.isPending}
              onClick={handleSaveEspecialidad}
            >
               {createEspecialidadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Guardar Especialidad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
