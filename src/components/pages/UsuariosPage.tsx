import { useState } from 'react';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ModalFormButtons } from '@/components/shared/ModalFormButtons';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const users = [
  { id: 1, nombre: 'Roberto', apellido: 'García', email: 'rgarcia@medicitas.com', rol: 'Administrador', estado: 'Activo', creadoEn: '2022-03-15', actualizadoEn: '2024-01-20' },
  { id: 2, nombre: 'Carmen', apellido: 'Ruiz', email: 'cruiz@medicitas.com', rol: 'Recepcionista', estado: 'Activo', creadoEn: '2021-08-20', actualizadoEn: '2024-01-18' },
  { id: 3, nombre: 'Miguel', apellido: 'Torres', email: 'mtorres@medicitas.com', rol: 'Médico', estado: 'Activo', creadoEn: '2020-01-10', actualizadoEn: '2024-01-15' },
  { id: 4, nombre: 'Patricia', apellido: 'López', email: 'plopez@medicitas.com', rol: 'Enfermera', estado: 'Inhabilitado', creadoEn: '2019-05-22', actualizadoEn: '2023-12-01' },
  { id: 5, nombre: 'Fernando', apellido: 'Díaz', email: 'fdiaz@medicitas.com', rol: 'Técnico', estado: 'Activo', creadoEn: '2023-02-01', actualizadoEn: '2024-01-22' },
  { id: 6, nombre: 'Sandra', apellido: 'Moreno', email: 'smoreno@medicitas.com', rol: 'Recepcionista', estado: 'Activo', creadoEn: '2022-11-30', actualizadoEn: '2024-01-10' },
];

const statusColors: Record<string, string> = {
  Activo: 'bg-success/20 text-success',
  Inhabilitado: 'bg-destructive/20 text-destructive',
};

export function UsuariosPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDisable, setConfirmDisable] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ nombre: '', apellido: '', email: '', rol: '' });

  const filteredUsers = users.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.apellido.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    setShowModal(false);
    setNewUser({ nombre: '', apellido: '', email: '', rol: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar usuarios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="chart-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Nombre', 'Apellido', 'Email', 'Rol', 'Estado', 'Creado en', 'Actualizado en', 'Acciones'].map(h => (
                  <th key={h} className="text-left p-3 text-sm font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="p-3 text-sm font-mono text-foreground">{user.id}</td>
                  <td className="p-3 text-sm font-medium text-foreground">{user.nombre}</td>
                  <td className="p-3 text-sm text-foreground">{user.apellido}</td>
                  <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="p-3 text-sm text-foreground">{user.rol}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.estado] || ''}`}>
                      {user.estado}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{user.creadoEn}</td>
                  <td className="p-3 text-sm text-muted-foreground">{user.actualizadoEn}</td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover border border-border z-50">
                        <DropdownMenuItem className="cursor-pointer">Editar</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setConfirmDisable(user.id)}>
                          Inhabilitar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Usuario</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              ID: #{users.length + 1} — Los campos de auditoría se llenan automáticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nombre</Label>
                <Input value={newUser.nombre} onChange={e => setNewUser({ ...newUser, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellido</Label>
                <Input value={newUser.apellido} onChange={e => setNewUser({ ...newUser, apellido: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Email</Label>
              <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Rol</Label>
              <Select value={newUser.rol} onValueChange={v => setNewUser({ ...newUser, rol: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Médico">Médico</SelectItem>
                  <SelectItem value="Enfermera">Enfermera</SelectItem>
                  <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ModalFormButtons
            onSave={handleSave}
            onSaveAndAnother={() => { handleSave(); setShowModal(true); }}
            onCancel={() => setShowModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation */}
      <ConfirmDialog
        open={confirmDisable !== null}
        onOpenChange={(o) => !o && setConfirmDisable(null)}
        onConfirm={() => setConfirmDisable(null)}
        title="¿Inhabilitar usuario?"
        description="El usuario no podrá acceder al sistema hasta que sea habilitado nuevamente."
      />
    </div>
  );
}
