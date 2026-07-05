import { useMemo, useState } from 'react';
import { Plus, Clock, Pencil, KeyRound, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalFormButtons } from '@/components/shared/ModalFormButtons';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SearchBar } from '@/components/shared/SearchBar';
import { FiltersButton } from '@/components/shared/FiltersButton';
import { RowActions } from '@/components/shared/RowActions';
import { useUsuarios, type Usuario } from '@/data/usuariosStore';
import { useDemoStore } from '@/store/useDemoStore';


const statusColors: Record<string, string> = {
  Activo: 'bg-success/20 text-success',
  Inhabilitado: 'bg-destructive/20 text-destructive',
};

export function UsuariosPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [confirmDisable, setConfirmDisable] = useState<number | null>(null);
  const [registroUser, setRegistroUser] = useState<Usuario | null>(null);
  const [newUser, setNewUser] = useState({ nombreCompleto: '', email: '', rol: '' });

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return usuariosMock.filter(u => {
      if (filterRol !== 'todos' && u.rol !== filterRol) return false;
      if (filterEstado !== 'todos' && u.estado !== filterEstado) return false;
      if (!q) return true;
      return (
        u.nombreCompleto.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [search, filterRol, filterEstado]);

  const handleSave = () => {
    setShowModal(false);
    setNewUser({ nombreCompleto: '', email: '', rol: '' });
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

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por correo o nombre..." />
        <FiltersButton onClear={() => { setFilterRol('todos'); setFilterEstado('todos'); }}>
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Rol</Label>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-[60]">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Auxiliar Administrativo">Auxiliar Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground text-xs">Estado</Label>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-[60]">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inhabilitado">Inhabilitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FiltersButton>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {['Nº', 'Correo electrónico', 'Nombre completo', 'Rol', 'Miembro desde', 'Última actualización', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.num} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-3 py-2 text-foreground">{u.num}</td>
                  <td className="px-3 py-2 text-foreground">{u.email}</td>
                  <td className="px-3 py-2 font-medium text-foreground">{u.nombreCompleto}</td>
                  <td className="px-3 py-2 text-foreground">{u.rol}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs">{u.miembroDesde}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs">{u.ultimaActualizacion}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[u.estado]}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="Ver historial" onClick={() => setRegistroUser(u)}>
                        <Clock className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-popover border border-border z-50">
                          <DropdownMenuItem className="cursor-pointer">Editar</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setConfirmDisable(u.num)}>
                            Inhabilitar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Usuario</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Nº: {usuariosMock.length + 1} — Los campos de auditoría se llenan automáticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nombre completo</Label>
              <Input value={newUser.nombreCompleto} onChange={e => setNewUser({ ...newUser, nombreCompleto: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Correo electrónico</Label>
              <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Rol</Label>
              <Select value={newUser.rol} onValueChange={v => setNewUser({ ...newUser, rol: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Auxiliar Administrativo">Auxiliar Administrativo</SelectItem>
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

      <ConfirmDialog
        open={confirmDisable !== null}
        onOpenChange={(o) => !o && setConfirmDisable(null)}
        onConfirm={() => setConfirmDisable(null)}
        title="¿Inhabilitar usuario?"
        description="El usuario no podrá acceder al sistema hasta que sea habilitado nuevamente."
      />

      <Dialog open={registroUser !== null} onOpenChange={(o) => !o && setRegistroUser(null)}>
        <DialogContent className="bg-card border border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Control de Registro</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {registroUser?.nombreCompleto ?? ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Miembro desde</p>
              <p className="text-sm font-medium text-foreground mt-1">{registroUser?.miembroDesde ?? '—'}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Última actualización</p>
              <p className="text-sm font-medium text-foreground mt-1">{registroUser?.ultimaActualizacion ?? '—'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegistroUser(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
