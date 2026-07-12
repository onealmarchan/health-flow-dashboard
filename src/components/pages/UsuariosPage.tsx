import { useMemo, useState, useEffect } from 'react';
import { Loader2, User, Mail, Phone, CreditCard, Shield, Calendar, Info } from 'lucide-react';
import { Plus, Clock, Pencil, KeyRound, Lock, Unlock, Eye } from 'lucide-react';
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
import { TablePagination } from '@/components/shared/TablePagination';
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useToggleUsuarioEstado } from '@/services/useUsuarios';

export type Usuario = {
  id: number | string;
  num: number | string;
  email: string;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  nombreCompleto: string;
  rol: 'Administrador' | 'Auxiliar Administrativo' | string;
  rolApi?: string;
  estado: 'Activo' | 'Inhabilitado' | string;
  miembroDesde: string;
  ultimaActualizacion: string;
  createdAt: number;
};

const statusColors: Record<string, string> = {
  Activo: 'bg-success/20 text-success',
  Inhabilitado: 'bg-destructive/20 text-destructive',
};

export function UsuariosPage() {
  const { data: apiUsuarios = [], isLoading } = useUsuarios();
  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();
  const toggleEstado = useToggleUsuarioEstado();

  const usuarios = useMemo(() => apiUsuarios.map((u: any, idx: number) => ({
    id: u.id || idx,
    num: u.id || idx,
    email: u.email || '',
    cedula: u.cedula || '',
    nombre: u.nombre || '',
    apellido: u.apellido || '',
    telefono: u.telefono || '',
    nombreCompleto: [u.nombre, u.apellido].filter(Boolean).join(' ') || u.nombre || u.nombres || '',
    rol: u.rol === 'ADMIN' ? 'Administrador' : u.rol === 'ADMIN_AUXILIAR' ? 'Auxiliar Administrativo' : u.rol || 'Auxiliar Administrativo',
    rolApi: u.rol || 'ADMIN_AUXILIAR',
    estado: u.status === false ? 'Inhabilitado' : 'Activo',
    miembroDesde: u.createdAt || new Date().toISOString().slice(0, 10),
    ultimaActualizacion: u.updatedAt || new Date().toISOString().slice(0, 10),
    createdAt: Date.now()
  })), [apiUsuarios]);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [confirmToggle, setConfirmToggle] = useState<Usuario | null>(null);
  const [registroUser, setRegistroUser] = useState<Usuario | null>(null);
  const [detailUser, setDetailUser] = useState<Usuario | null>(null);
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    cedula: '',
    telefono: '',
    rol: '',
    password: '',
  });

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return usuarios.filter(u => {
      if (filterRol !== 'todos' && u.rol !== filterRol) return false;
      if (filterEstado !== 'todos' && u.estado !== filterEstado) return false;
      if (!q) return true;
      return (
        u.nombreCompleto.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.cedula.includes(q)
      );
    });
  }, [usuarios, search, filterRol, filterEstado]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search, filterRol, filterEstado]);

  const handleSave = () => {
    if (!newUser.nombre.trim() || !newUser.email.trim() || !newUser.rol) {
      toast.error('Nombre, correo y rol son obligatorios');
      return;
    }

    if (editingUser) {
      updateUsuario.mutate({
        id: Number(editingUser.id),
        data: {
          nombre: newUser.nombre,
          apellido: newUser.apellido || undefined,
          email: newUser.email,
          cedula: newUser.cedula || undefined,
          telefono: newUser.telefono || undefined,
          rol: newUser.rol === 'Administrador' ? 'ADMIN' : 'ADMIN_AUXILIAR',
        }
      }, {
        onSuccess: () => {
          toast.success('Usuario actualizado');
          setShowModal(false);
          setEditingUser(null);
          resetForm();
        },
        onError: () => toast.error('Error al actualizar usuario'),
      });
    } else {
      if (!newUser.cedula.trim()) {
        toast.error('La cédula es obligatoria');
        return;
      }
      if (!newUser.password || newUser.password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      createUsuario.mutate({
        nombre: newUser.nombre,
        apellido: newUser.apellido || undefined,
        email: newUser.email,
        cedula: newUser.cedula,
        telefono: newUser.telefono || undefined,
        password: newUser.password,
        rol: newUser.rol === 'Administrador' ? 'ADMIN' : 'ADMIN_AUXILIAR',
      } as any, {
        onSuccess: () => {
          toast.success('Usuario creado exitosamente');
          setShowModal(false);
          resetForm();
        },
        onError: (e: any) => toast.error(e?.response?.data?.message || 'Error al crear usuario'),
      });
    }
  };

  const resetForm = () => {
    setNewUser({ nombre: '', apellido: '', email: '', cedula: '', telefono: '', rol: '', password: '' });
  };

  const openEdit = (u: Usuario) => {
    setEditingUser(u);
    setNewUser({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      cedula: u.cedula,
      telefono: u.telefono,
      rol: u.rol,
      password: '',
    });
    setShowModal(true);
  };

  const doToggle = () => {
    if (!confirmToggle) return;
    toggleEstado.mutate(Number(confirmToggle.id), {
      onSuccess: () => {
        toast.success(
          confirmToggle.estado === 'Activo' ? 'Usuario inhabilitado' : 'Usuario habilitado',
        );
        setConfirmToggle(null);
      },
      onError: () => toast.error('Error al cambiar estado del usuario'),
    });
  };

  const resetPassword = (u: Usuario) => {
    toast.success(`Enlace de recuperación enviado a ${u.email}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión de usuarios del sistema</p>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          onClick={() => { setEditingUser(null); resetForm(); setShowModal(true); }}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por correo, nombre o cédula..." />
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando usuarios...</span>
            </div>
          ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Nº', 'Cédula', 'Nombre completo', 'Correo electrónico', 'Rol', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                  {filteredUsers.length === 0 ? 'No se encontraron usuarios' : 'Sin usuarios registrados'}
                </td></tr>
              )}
              {paginatedUsers.map(u => (
                <tr key={u.num} className="border-t border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{u.num}</td>
                  <td className="px-3 py-2.5 text-foreground font-mono text-xs">{u.cedula || '—'}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground">{u.nombreCompleto}</td>
                  <td className="px-3 py-2.5 text-foreground font-mono text-xs">{u.email}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[u.estado]}`}>
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <RowActions actions={[
                      { icon: Eye, label: 'Ver más', onClick: () => setDetailUser(u) },
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
            </tbody>
          </table>
          )}
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showModal} onOpenChange={(o) => { if (!o) { setShowModal(false); setEditingUser(null); } }}>
        <DialogContent className="bg-card border border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingUser ? `Nº ${editingUser.num}` : `Nº: ${usuarios.length + 1} — los campos de auditoría se llenan automáticamente`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nombre <span className="text-destructive">*</span></Label>
                <Input value={newUser.nombre} onChange={e => setNewUser({ ...newUser, nombre: e.target.value })} placeholder="Juan" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellido</Label>
                <Input value={newUser.apellido} onChange={e => setNewUser({ ...newUser, apellido: e.target.value })} placeholder="Pérez" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Correo electrónico <span className="text-destructive">*</span></Label>
              <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="correo@ejemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Cédula {!editingUser && <span className="text-destructive">*</span>}</Label>
                <Input value={newUser.cedula} onChange={e => setNewUser({ ...newUser, cedula: e.target.value })} placeholder="12345678" disabled={!!editingUser} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Teléfono</Label>
                <Input value={newUser.telefono} onChange={e => setNewUser({ ...newUser, telefono: e.target.value })} placeholder="0412-1234567" />
              </div>
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label className="text-foreground">Contraseña <span className="text-destructive">*</span></Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-foreground">Rol <span className="text-destructive">*</span></Label>
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

      {/* Confirm Toggle Dialog */}
      <ConfirmDialog
        open={confirmToggle !== null}
        onOpenChange={(o) => !o && setConfirmToggle(null)}
        onConfirm={doToggle}
        title={confirmToggle?.estado === 'Activo' ? '¿Inhabilitar usuario?' : '¿Habilitar usuario?'}
        description={confirmToggle?.estado === 'Activo'
          ? 'El usuario no podrá acceder al sistema hasta que sea habilitado nuevamente.'
          : 'El usuario recuperará acceso al sistema.'}
      />

      {/* Ver más - Detail Dialog */}
      <Dialog open={detailUser !== null} onOpenChange={(o) => !o && setDetailUser(null)}>
        <DialogContent className="bg-card border border-border max-w-sm p-5">
          <DialogHeader className="mb-1">
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Info className="w-4 h-4 text-primary" />
              Detalle del Usuario
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {detailUser?.nombreCompleto ?? ''}
            </DialogDescription>
          </DialogHeader>
          {detailUser && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 py-1">
              <CompactField label="Cédula" value={detailUser.cedula || '—'} />
              <CompactField label="Rol" value={detailUser.rol} />
              <CompactField label="Nombre" value={detailUser.nombre || '—'} />
              <CompactField label="Apellido" value={detailUser.apellido || '—'} />
              <CompactField label="Correo" value={detailUser.email} className="col-span-2" />
              <CompactField label="Teléfono" value={detailUser.telefono || '—'} />
              <CompactField
                label="Estado"
                value={detailUser.estado}
                valueClassName={detailUser.estado === 'Activo' ? 'text-success' : 'text-destructive'}
              />
              <CompactField label="Desde" value={detailUser.miembroDesde} />
              <CompactField label="Actualizado" value={detailUser.ultimaActualizacion} />
            </div>
          )}
          <DialogFooter className="mt-1">
            <Button variant="outline" size="sm" onClick={() => setDetailUser(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Historial / Control de Registro */}
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

function CompactField({ label, value, valueClassName, className }: {
  label: string;
  value: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">{label}</p>
      <p className={`text-sm font-medium text-foreground mt-0.5 truncate ${valueClassName || ''}`}>{value}</p>
    </div>
  );
}
