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
  const usuarios = useUsuarios();
  const toggleEstado = useDemoStore(s => s.toggleUsuarioEstado);
  const addUsuario = useDemoStore(s => s.addUsuario);
  const updateUsuario = useDemoStore(s => s.updateUsuario);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [confirmToggle, setConfirmToggle] = useState<Usuario | null>(null);
  const [registroUser, setRegistroUser] = useState<Usuario | null>(null);
  const [newUser, setNewUser] = useState({ nombreCompleto: '', email: '', rol: '' });

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return usuarios.filter(u => {
      if (filterRol !== 'todos' && u.rol !== filterRol) return false;
      if (filterEstado !== 'todos' && u.estado !== filterEstado) return false;
      if (!q) return true;
      return u.nombreCompleto.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [usuarios, search, filterRol, filterEstado]);

  const handleSave = () => {
    if (editingUser) {
      updateUsuario(editingUser.num, {
        nombreCompleto: newUser.nombreCompleto || editingUser.nombreCompleto,
        email: newUser.email || editingUser.email,
        rol: (newUser.rol as Usuario['rol']) || editingUser.rol,
      });
      toast.success('Usuario actualizado');
    } else if (newUser.nombreCompleto && newUser.email && newUser.rol) {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      addUsuario({
        email: newUser.email,
        nombreCompleto: newUser.nombreCompleto,
        rol: newUser.rol as Usuario['rol'],
        miembroDesde: nowStr,
        ultimaActualizacion: nowStr,
        estado: 'Activo',
      });
      toast.success('Usuario creado');
    }
    setShowModal(false);
    setEditingUser(null);
    setNewUser({ nombreCompleto: '', email: '', rol: '' });
  };

  const openEdit = (u: Usuario) => {
    setEditingUser(u);
    setNewUser({ nombreCompleto: u.nombreCompleto, email: u.email, rol: u.rol });
    setShowModal(true);
  };

  const doToggle = () => {
    if (!confirmToggle) return;
    toggleEstado(confirmToggle.num);
    toast.success(
      confirmToggle.estado === 'Activo' ? 'Usuario inhabilitado' : 'Usuario habilitado',
    );
    setConfirmToggle(null);
  };

  const resetPassword = (u: Usuario) => {
    toast.success(`Enlace de recuperación enviado a ${u.email}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => { setEditingUser(null); setNewUser({ nombreCompleto: '', email: '', rol: '' }); setShowModal(true); }}>
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
                {['Nº', 'Correo electrónico', 'Nombre completo', 'Rol', 'Historial', 'Estado', 'Acciones'].map(h => (
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
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="icon" title="Ver historial" onClick={() => setRegistroUser(u)}>
                      <Clock className="w-4 h-4" />
                    </Button>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[u.estado]}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <RowActions actions={[
                      { icon: Pencil, label: 'Editar datos', onClick: () => openEdit(u) },
                      { icon: KeyRound, label: 'Restablecer contraseña', onClick: () => resetPassword(u) },
                      {
                        icon: u.estado === 'Activo' ? Lock : Unlock,
                        label: u.estado === 'Activo' ? 'Inhabilitar' : 'Habilitar',
                        onClick: () => setConfirmToggle(u),
                        variant: u.estado === 'Activo' ? 'destructive' : 'success',
                        animateOnClick: true,
                      },
                    ]} />
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={(o) => { if (!o) { setShowModal(false); setEditingUser(null); } }}>
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingUser ? `Nº ${editingUser.num}` : `Nº: ${usuarios.length + 1} — los campos de auditoría se llenan automáticamente`}
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
            onCancel={() => { setShowModal(false); setEditingUser(null); }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmToggle !== null}
        onOpenChange={(o) => !o && setConfirmToggle(null)}
        onConfirm={doToggle}
        title={confirmToggle?.estado === 'Activo' ? '¿Inhabilitar usuario?' : '¿Habilitar usuario?'}
        description={confirmToggle?.estado === 'Activo'
          ? 'El usuario no podrá acceder al sistema hasta que sea habilitado nuevamente.'
          : 'El usuario recuperará acceso al sistema.'}
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
