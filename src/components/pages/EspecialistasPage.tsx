import { useMemo, useState } from 'react';
import { UserCog, Plus, Phone, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ModalFormButtons } from '@/components/shared/ModalFormButtons';
import { useMedicos, useCreateMedico, useUpdateMedico, useDeleteMedico, useEspecialidades, useCreateEspecialidad } from '@/services/useMedicos';
import { EspecialistasExportDrawer } from '@/components/reports/EspecialistasExportDrawer';
import { SearchBar } from '@/components/shared/SearchBar';
import { FiltersButton } from '@/components/shared/FiltersButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Pencil, Trash2 } from 'lucide-react';

type ModalView = 'closed' | 'search' | 'new' | 'edit';

export function EspecialistasPage() {
  const { data: apiMedicos = [] } = useMedicos();
  const createMedico = useCreateMedico();
  const updateMedico = useUpdateMedico();
  const deleteMedico = useDeleteMedico();
  const { data: apiEspecialidades = [] } = useEspecialidades();
  const createEspecialidad = useCreateEspecialidad();

  const especialidadMap = useMemo(() => {
    const map = new Map<string, any>();
    apiEspecialidades.forEach((e: any) => {
      const id = String(e.id ?? e.pk_num_especialidad ?? '');
      if (id) map.set(id, e);
    });
    return map;
  }, [apiEspecialidades]);

  const specialists = useMemo(() => apiMedicos.map((m: any) => {
    const specId = String(m.fk_cm_a001_num_especialidad || m.especialidad?.id || '');
    const spec = especialidadMap.get(specId);
    return {
      id: m.id || m.pk_num_medico_ministerio_salud,
      mpps: String(m.pk_num_medico_ministerio_salud || ''),
      nombre: m.nombre || m.nombres || '',
      apellido: m.apellido || m.apellidos || '',
      especialidad: spec?.nombre || m.especialidad?.nombre || 'General',
      especialidadId: specId,
      pacientes: m.carga_paciente || 0,
      telefono: m.telefono || '',
      disponible: true,
    };
  }), [apiMedicos, especialidadMap]);

  const [modalView, setModalView] = useState<ModalView>('closed');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardSearch, setCardSearch] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState<string>('todas');
  const [filterDisponible, setFilterDisponible] = useState<string>('todos');
  const [newSpec, setNewSpec] = useState({ id: 0, mpps: '', nombre: '', apellido: '', telefono: '', especialidadId: '', carga_paciente: 0 });
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [newEspecialidad, setNewEspecialidad] = useState({ nombre: '', descripcion: '' });
  const [exportOpen, setExportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const especialidades = useMemo(() => apiEspecialidades, [apiEspecialidades]);

  const filteredSpecialists = useMemo(() => specialists.filter(s =>
    s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mpps.toLowerCase().includes(searchQuery.toLowerCase())
  ), [specialists, searchQuery]);

  const cardList = useMemo(() => {
    const q = cardSearch.trim().toLowerCase();
    return specialists.filter(s => {
      if (filterEspecialidad !== 'todas' && s.especialidad !== filterEspecialidad) return false;
      if (filterDisponible === 'si' && !s.disponible) return false;
      if (filterDisponible === 'no' && s.disponible) return false;
      if (!q) return true;
      return (
        s.nombre.toLowerCase().includes(q) ||
        s.apellido.toLowerCase().includes(q) ||
        s.mpps.toLowerCase().includes(q) ||
        s.especialidad.toLowerCase().includes(q)
      );
    });
  }, [specialists, cardSearch, filterEspecialidad, filterDisponible]);

  const handleSave = async () => {
    if (!newSpec.nombre.trim() || !newSpec.apellido.trim() || !newSpec.mpps.trim() || !newSpec.especialidadId || !newSpec.telefono.trim()) {
      toast.error('MPPS, nombre, apellido, teléfono y especialidad son obligatorios');
      return;
    }
    try {
      const payload = {
        pk_num_medico_ministerio_salud: Number(newSpec.mpps.replace(/\D/g, '')),
        nombre: newSpec.nombre,
        apellido: newSpec.apellido,
        telefono: newSpec.telefono,
        fk_cm_a001_num_especialidad: Number(newSpec.especialidadId),
        carga_paciente: newSpec.carga_paciente || 0
      };

      if (modalView === 'edit' && newSpec.id) {
        await updateMedico.mutateAsync({ id: newSpec.id, data: payload });
        toast.success('Especialista actualizado con éxito');
      } else {
        await createMedico.mutateAsync(payload as any);
        toast.success('Especialista registrado con éxito');
      }
      setModalView('closed');
      setNewSpec({ id: 0, mpps: '', nombre: '', apellido: '', telefono: '', especialidadId: '', carga_paciente: 0 });
    } catch (e: any) {
      console.error("Error saving medico:", e);
      if (e?.response) {
        const msg = e.response.data?.message;
        toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Error del servidor al guardar'));
      } else {
        toast.error(`Error interno: ${e?.message || e}`);
      }
    }
  };

  const handleEdit = (s: any) => {
    setNewSpec({
      id: s.id,
      mpps: s.mpps,
      nombre: s.nombre,
      apellido: s.apellido,
      telefono: s.telefono,
      especialidadId: String(s.especialidadId),
      carga_paciente: s.pacientes
    });
    setModalView('edit');
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMedico.mutateAsync(confirmDelete);
      toast.success('Especialista eliminado');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al eliminar');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleSaveEspecialidad = async () => {
    const nombre = newEspecialidad.nombre.trim();
    if (!nombre) { toast.error('El nombre de la especialidad es obligatorio'); return; }
    try {
      await createEspecialidad.mutateAsync({ nombre } as any);
      toast.success('Especialidad registrada');
      setNewEspecialidad({ nombre: '', descripcion: '' });
      setSpecModalOpen(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Error al registrar especialidad'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Especialistas Médicos</h1>
          <p className="text-muted-foreground">Directorio de profesionales de la salud</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setModalView('search')}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Especialista
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchBar
          value={cardSearch}
          onChange={setCardSearch}
          placeholder="Buscar por nombre, MPPS o especialidad..."
        />
        <FiltersButton
          onClear={() => { setFilterEspecialidad('todas'); setFilterDisponible('todos'); }}
        >
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Especialidad</Label>
            <Select value={filterEspecialidad} onValueChange={setFilterEspecialidad}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-[60]">
                <SelectItem value="todas">Todas</SelectItem>
                {especialidades.map((e: any, idx: number) => <SelectItem key={e.id || e.pk_num_especialidad || idx} value={e.nombre}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Disponibilidad</Label>
            <Select value={filterDisponible} onValueChange={setFilterDisponible}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-[60]">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="si">Disponible</SelectItem>
                <SelectItem value="no">No disponible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FiltersButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
        {cardList.map(s => (
          <div key={s.id} className="metric-card">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <UserCog className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                s.disponible ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                {s.disponible ? 'Disponible' : 'No disponible'}
              </span>
            </div>

            <h3 className="font-semibold text-foreground">Dr(a). {s.nombre} {s.apellido}</h3>
            <p className="text-sm text-primary mb-1">{s.especialidad}</p>
            <p className="text-xs text-muted-foreground font-mono mb-3">{s.mpps}</p>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">{s.pacientes} pacientes</span>
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{s.telefono}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20" onClick={() => handleEdit(s)}>
                  <Pencil className="h-4 w-4 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive" onClick={() => setConfirmDelete(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {cardList.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No se encontraron especialistas con los filtros seleccionados.
          </div>
        )}
      </div>

      <EspecialistasExportDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        especialistas={specialists}
        especialidades={especialidades}
      />

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
              <Plus className="w-4 h-4 mr-2" /> Nuevo
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Nº MPPS', 'Nombre', 'Apellido', 'Teléfono', 'Carga de Pacientes'].map(h => (
                    <th key={h} className="text-left p-2 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSpecialists.map(s => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="p-2 text-foreground font-mono">{s.mpps}</td>
                    <td className="p-2 text-foreground">{s.nombre}</td>
                    <td className="p-2 text-foreground">{s.apellido}</td>
                    <td className="p-2 text-muted-foreground">{s.telefono}</td>
                    <td className="p-2 text-foreground">{s.pacientes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalView === 'new' || modalView === 'edit'} onOpenChange={(o) => !o && setModalView('search')}>
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{modalView === 'new' ? 'Nuevo Especialista' : 'Editar Especialista'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{modalView === 'new' ? 'Registre un nuevo especialista médico' : 'Modifique los datos del especialista'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Número MPPS</Label>
              <Input value={newSpec.mpps} onChange={e => setNewSpec({ ...newSpec, mpps: e.target.value })} placeholder="MPPS-XXX" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nombre</Label>
                <Input value={newSpec.nombre} onChange={e => setNewSpec({ ...newSpec, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellido</Label>
                <Input value={newSpec.apellido} onChange={e => setNewSpec({ ...newSpec, apellido: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Teléfono</Label>
              <Input value={newSpec.telefono} onChange={e => setNewSpec({ ...newSpec, telefono: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Especialidad</Label>
              <div className="flex gap-2">
                <Select value={newSpec.especialidadId} onValueChange={v => setNewSpec({ ...newSpec, especialidadId: v })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccione una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map((e: any, idx: number) => {
                      const uid = String(e.id || e.pk_num_especialidad || idx);
                      return <SelectItem key={uid} value={uid}>{e.nombre}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setSpecModalOpen(true)} title="Agregar especialidad">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <ModalFormButtons
            onSave={handleSave}
            onSaveAndAnother={modalView === 'new' ? () => { handleSave(); setModalView('new'); } : undefined}
            onCancel={() => setModalView('search')}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={specModalOpen} onOpenChange={setSpecModalOpen}>
        <DialogContent className="bg-card border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Registro de Especialidad Médica</DialogTitle>
            <DialogDescription className="text-muted-foreground">Agregue una nueva especialidad al catálogo</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nombre <span className="text-destructive">*</span></Label>
              <Input value={newEspecialidad.nombre} onChange={e => setNewEspecialidad({ ...newEspecialidad, nombre: e.target.value })} placeholder="Ej. Oftalmología" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Descripción</Label>
              <Textarea value={newEspecialidad.descripcion} onChange={e => setNewEspecialidad({ ...newEspecialidad, descripcion: e.target.value })} placeholder="Descripción opcional" />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setNewEspecialidad({ nombre: '', descripcion: '' }); setSpecModalOpen(false); }}>
              Cancelar
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSaveEspecialidad}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Eliminar Especialista"
        description="¿Está seguro que desea eliminar a este especialista del registro? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        confirmText="Eliminar"
        confirmVariant="destructive"
      />
    </div>
  );
}
