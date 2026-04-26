import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalFormButtons } from '@/components/shared/ModalFormButtons';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Usuario, CreateUsuarioDto, UserRole } from '@/types';

interface UserModalsProps {
  // New User
  showCreate: boolean;
  setShowCreate: (show: boolean) => void;
  onCreate: (data: CreateUsuarioDto) => void;
  onCreateAndAnother: (data: CreateUsuarioDto) => void;
  isCreating: boolean;

  // Edit User
  editUser: Usuario | null;
  setEditUser: (user: Usuario | null) => void;
  onUpdate: (id: number, data: Partial<CreateUsuarioDto>) => void;
  isUpdating: boolean;

  // Registry
  registroUser: Usuario | null;
  setRegistroUser: (user: Usuario | null) => void;

  // Disable
  confirmDisableId: number | null;
  setConfirmDisableId: (id: number | null) => void;
  onConfirmDisable: (id: number) => void;
  isDisabling: boolean;

  // Delete
  confirmDeleteId: number | null;
  setConfirmDeleteId: (id: number | null) => void;
  onConfirmDelete: (id: number) => void;
  isDeleting: boolean;
}

export function UserModals({
  showCreate,
  setShowCreate,
  onCreate,
  onCreateAndAnother,
  isCreating,
  editUser,
  setEditUser,
  onUpdate,
  isUpdating,
  registroUser,
  setRegistroUser,
  confirmDisableId,
  setConfirmDisableId,
  onConfirmDisable,
  isDisabling,
  confirmDeleteId,
  setConfirmDeleteId,
  onConfirmDelete,
  isDeleting,
}: UserModalsProps) {
  // Local states for forms
  const [newUser, setNewUser] = useState<CreateUsuarioDto>({ nombre: '', email: '', password: '', rol: UserRole.MEDICO });
  const [editForm, setEditForm] = useState<Partial<CreateUsuarioDto>>({ nombre: '', email: '', rol: UserRole.MEDICO });

  useEffect(() => {
    if (editUser) {
      setEditForm({ nombre: editUser.nombre || '', email: editUser.email, rol: editUser.rol });
    }
  }, [editUser]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('es-VE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      {/* ─── New User Modal ─── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Nuevo Usuario</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Los campos de auditoría se llenan automáticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nombre</Label>
              <Input
                value={newUser.nombre}
                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Email *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="correo@hospital.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Contraseña *</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Rol *</Label>
              <Select value={newUser.rol} onValueChange={(v: UserRole) => setNewUser({ ...newUser, rol: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={UserRole.MEDICO}>Médico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ModalFormButtons
            onSave={() => onCreate(newUser)}
            onSaveAndAnother={() => onCreateAndAnother(newUser)}
            onCancel={() => {
              setShowCreate(false);
              setNewUser({ nombre: '', email: '', password: '', rol: UserRole.MEDICO });
            }}
            saving={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* ─── Edit User Modal ─── */}
      <Dialog open={editUser !== null} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Usuario</DialogTitle>
            <DialogDescription className="text-muted-foreground">ID: #{editUser?.id}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nombre</Label>
              <Input
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Rol</Label>
              <Select value={editForm.rol} onValueChange={(v: UserRole) => setEditForm({ ...editForm, rol: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                  <SelectItem value={UserRole.MEDICO}>Médico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancelar
            </Button>
            <Button onClick={() => editUser && onUpdate(editUser.id, editForm)} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Disable Confirmation ─── */}
      <ConfirmDialog
        open={confirmDisableId !== null}
        onOpenChange={(o) => !o && setConfirmDisableId(null)}
        onConfirm={() => confirmDisableId && onConfirmDisable(confirmDisableId)}
        title="¿Inhabilitar usuario?"
        description="El usuario no podrá acceder al sistema hasta que sea habilitado nuevamente."
        isLoading={isDisabling}
      />

      {/* ─── Delete Confirmation ─── */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(o) => !o && setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && onConfirmDelete(confirmDeleteId)}
        title="¿Eliminar usuario permanentemente?"
        description="Esta acción no se puede deshacer y borrará al usuario de la base de datos."
        isLoading={isDeleting}
      />

      {/* ─── Control de Registro Modal ─── */}
      <Dialog open={registroUser !== null} onOpenChange={(o) => !o && setRegistroUser(null)}>
        <DialogContent className="bg-card border border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Control de Registro</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {registroUser ? `${registroUser.nombre || ''} — ${registroUser.email}` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Creado en</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {registroUser?.createdAt ? formatDate(registroUser.createdAt) : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Actualizado en</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {registroUser?.updatedAt ? formatDate(registroUser.updatedAt) : '—'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegistroUser(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
