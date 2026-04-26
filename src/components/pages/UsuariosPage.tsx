import { useState } from 'react';
import { Plus, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useToggleUsuarioStatus, useDeleteUsuario } from '@/hooks/useUsuarios';
import { Usuario, CreateUsuarioDto } from '@/types';
import { UserTable } from './usuarios/UserTable';
import { UserModals } from './usuarios/UserModals';

/**
 * UsuariosPage
 * Componente principal para la gestión de usuarios.
 * Utiliza hooks personalizados para la lógica de API y subcomponentes para la UI.
 */
export function UsuariosPage() {
  // ─── Estads Locales para UI ───
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [registroUser, setRegistroUser] = useState<Usuario | null>(null);
  const [confirmDisableId, setConfirmDisableId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // ─── Hooks de Datos (API) ───
  const { data: users = [], isLoading, isError, error, refetch } = useUsuarios();
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const toggleStatusMutation = useToggleUsuarioStatus();
  const deleteMutation = useDeleteUsuario();

  // ─── Filtrado ───
  const filteredUsers = users.filter((u) =>
    (u.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Handlers de Acciones ───
  const handleCreate = (data: CreateUsuarioDto) => {
    createMutation.mutate(data, {
      onSuccess: () => setShowCreateModal(false),
    });
  };

  const handleCreateAndAnother = (data: CreateUsuarioDto) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (id: number, data: Partial<CreateUsuarioDto>) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => setEditUser(null),
    });
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id, {
      onSuccess: () => setConfirmDisableId(null),
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  // ─── Estados de Carga y Error ───
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Cargando usuarios...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <p className="text-foreground text-lg font-semibold">Error al cargar usuarios</p>
        <p className="text-muted-foreground text-sm max-w-md text-center">
          {error instanceof Error ? error.message : 'Error desconocido al conectar con el servidor.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestión interna de accesos y roles
            <span className="ml-2 text-xs bg-secondary/50 px-2 py-0.5 rounded-full border border-border">
              {users.length} registros totales
            </span>
          </p>
        </div>
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" 
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre o email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-card border-border hover:border-primary/50 transition-colors" 
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => refetch()} 
          title="Refrescar datos"
          className="hover:text-primary transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <UserTable 
        users={filteredUsers} 
        onEdit={setEditUser} 
        onViewRegistry={setRegistroUser}
        onToggleStatus={setConfirmDisableId}
        onDelete={setConfirmDeleteId}
      />

      {/* Modales Embebidos */}
      <UserModals 
        showCreate={showCreateModal}
        setShowCreate={setShowCreateModal}
        onCreate={handleCreate}
        onCreateAndAnother={handleCreateAndAnother}
        isCreating={createMutation.isPending}

        editUser={editUser}
        setEditUser={setEditUser}
        onUpdate={handleUpdate}
        isUpdating={updateMutation.isPending}

        registroUser={registroUser}
        setRegistroUser={setRegistroUser}

        confirmDisableId={confirmDisableId}
        setConfirmDisableId={setConfirmDisableId}
        onConfirmDisable={handleToggleStatus}
        isDisabling={toggleStatusMutation.isPending}

        confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId}
        onConfirmDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
