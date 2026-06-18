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
import { useEspecialistas, addEspecialista } from '@/data/especialistasStore';
import { EspecialistasExportDrawer } from '@/components/reports/EspecialistasExportDrawer';

type ModalView = 'closed' | 'search' | 'new';

export function EspecialistasPage() {
  const specialists = useEspecialistas();
  const [modalView, setModalView] = useState<ModalView>('closed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newSpec, setNewSpec] = useState({ mpps: '', nombre: '', apellido: '', telefono: '', especialidad: '' });
  const [especialidades, setEspecialidades] = useState<string[]>([
    'Cardiología', 'Pediatría', 'Dermatología', 'Neurología', 'Traumatología', 'Ginecología',
  ]);
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [newEspecialidad, setNewEspecialidad] = useState({ nombre: '', descripcion: '' });
  const [exportOpen, setExportOpen] = useState(false);

  const filteredSpecialists = useMemo(() => specialists.filter(s =>
    s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mpps.toLowerCase().includes(searchQuery.toLowerCase())
  ), [specialists, searchQuery]);

  const handleSave = () => {
    if (!newSpec.nombre.trim() || !newSpec.apellido.trim() || !newSpec.mpps.trim()) {
      toast.error('MPPS, nombre y apellido son obligatorios');
      return;
    }
    addEspecialista({
      mpps: newSpec.mpps,
      nombre: newSpec.nombre,
      apellido: newSpec.apellido,
      especialidad: newSpec.especialidad || 'Medicina General',
      telefono: newSpec.telefono,
      pacientes: 0,
      disponible: true,
      fechaIngreso: new Date().toISOString().slice(0, 10),
    });
    toast.success('Especialista registrado');
    setModalView('closed');
    setNewSpec({ mpps: '', nombre: '', apellido: '', telefono: '', especialidad: '' });
  };

  const handleSaveEspecialidad = () => {
    const nombre = newEspecialidad.nombre.trim();
    if (!nombre) { toast.error('El nombre de la especialidad es obligatorio'); return; }
    if (especialidades.some(e => e.toLowerCase() === nombre.toLowerCase())) {
      toast.error('Esa especialidad ya existe'); return;
    }
    setEspecialidades([...especialidades, nombre]);
    setNewSpec(s => ({ ...s, especialidad: nombre }));
    setNewEspecialidad({ nombre: '', descripcion: '' });
    setSpecModalOpen(false);
    toast.success('Especialidad registrada');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Especialistas Médicos</h1>
          <p className="text-muted-foreground">Directorio de profesionales de la salud</p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialists.map(s => (
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

            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{s.telefono}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Drawer */}
      <EspecialistasExportDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        especialistas={specialists}
        especialidades={especialidades}
      />

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

      {/* New Specialist Modal */}
      <Dialog open={modalView === 'new'} onOpenChange={(o) => !o && setModalView('search')}>
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Especialista</DialogTitle>
            <DialogDescription className="text-muted-foreground">Registre un nuevo especialista médico</DialogDescription>
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
                <Select value={newSpec.especialidad} onValueChange={v => setNewSpec({ ...newSpec, especialidad: v })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccione una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map(e => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
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
            onSaveAndAnother={() => { handleSave(); setModalView('new'); }}
            onCancel={() => setModalView('search')}
          />
        </DialogContent>
      </Dialog>

      {/* Nested: Registro de Especialidad Médica */}
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
    </div>
  );
}
