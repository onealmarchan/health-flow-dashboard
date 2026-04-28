import { MoreVertical, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Usuario } from '@/types';

interface UserTableProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onViewRegistry: (user: Usuario) => void;
  onToggleStatus: (id: number) => void;
}

const statusColors: Record<string, string> = {
  ADMIN: 'bg-primary/20 text-primary',
  ADMIN_AUXILIAR: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
};

const rolLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  ADMIN_AUXILIAR: 'Auxiliar Admin',
};

export function UserTable({ users, onEdit, onViewRegistry, onToggleStatus }: UserTableProps) {
  return (
    <div className="chart-container">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['ID', 'Nombre', 'Email', 'Rol', 'Control de Registro', 'Acciones'].map((h) => (
                <th key={h} className="text-left p-3 text-sm font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <td className="p-3 text-sm font-mono text-foreground">{user.id}</td>
                  <td className="p-3 text-sm font-medium text-foreground">{user.nombre || '—'}</td>
                  <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                          statusColors[user.rol] || 'bg-secondary text-foreground'
                        }`}
                      >
                        {rolLabels[user.rol] || user.rol}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ml-1 ${user.status ? 'text-emerald-500' : 'text-destructive'}`}>
                        {user.status ? '● Activo' : '● Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Ver control de registro"
                      onClick={() => onViewRegistry(user)}
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover border border-border z-50">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(user)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={`cursor-pointer ${user.status ? 'text-warning' : 'text-emerald-500 font-medium'}`}
                          onClick={() => onToggleStatus(user.id)}
                        >
                          {user.status ? 'Inhabilitar' : 'Habilitar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
