import { useState } from 'react';
import { UserCog, Plus, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ModalFormButtons } from '@/components/shared/ModalFormButtons';

const specialists = [
  { id: 1, mpps: 'MPPS-001', name: 'Dr. Juan López', specialty: 'Cardiología', patients: 245, phone: '555-0101', available: true },
  { id: 2, mpps: 'MPPS-002', name: 'Dra. Ana Martínez', specialty: 'Pediatría', patients: 312, phone: '555-0102', available: true },
  { id: 3, mpps: 'MPPS-003', name: 'Dr. Carlos Sánchez', specialty: 'Dermatología', patients: 189, phone: '555-0103', available: false },
  { id: 4, mpps: 'MPPS-004', name: 'Dra. María Díaz', specialty: 'Neurología', patients: 156, phone: '555-0104', available: true },
  { id: 5, mpps: 'MPPS-005', name: 'Dr. Pedro Torres', specialty: 'Traumatología', patients: 278, phone: '555-0105', available: true },
  { id: 6, mpps: 'MPPS-006', name: 'Dra. Laura Fernández', specialty: 'Ginecología', patients: 298, phone: '555-0106', available: true },
];

type ModalView = 'closed' | 'search' | 'new';

export function EspecialistasPage() {
  const [modalView, setModalView] = useState<ModalView>('closed');
  const [searchQuery, setSearchQuery] = useState('');
  const [newSpec, setNewSpec] = useState({ mpps: '', nombre: '', apellido: '', telefono: '', especialidad: '' });

  const filteredSpecialists = specialists.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mpps.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    setModalView('closed');
    setNewSpec({ mpps: '', nombre: '', apellido: '', telefono: '', especialidad: '' });
  };

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
        {specialists.map(specialist => (
          <div key={specialist.id} className="metric-card">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <UserCog className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                specialist.available ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                {specialist.available ? 'Disponible' : 'No disponible'}
              </span>
            </div>

            <h3 className="font-semibold text-foreground">{specialist.name}</h3>
            <p className="text-sm text-primary mb-1">{specialist.specialty}</p>
            <p className="text-xs text-muted-foreground font-mono mb-3">{specialist.mpps}</p>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">{specialist.patients} pacientes</span>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{specialist.phone}</span>
              </div>
            </div>
          </div>
        ))}
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
              Nuevo
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
                    <td className="p-2 text-foreground">{s.name.split(' ').slice(1).join(' ')}</td>
                    <td className="p-2 text-foreground">{s.name.split(' ')[0]}</td>
                    <td className="p-2 text-muted-foreground">{s.phone}</td>
                    <td className="p-2 text-foreground">{s.patients}</td>
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
              <Input value={newSpec.especialidad} onChange={e => setNewSpec({ ...newSpec, especialidad: e.target.value })} />
            </div>
          </div>

          <ModalFormButtons
            onSave={handleSave}
            onSaveAndAnother={() => { handleSave(); setModalView('new'); }}
            onCancel={() => setModalView('search')}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
