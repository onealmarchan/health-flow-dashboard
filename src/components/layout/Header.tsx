import { useState } from 'react';
import { User, Palette, Sun, Moon, Check, Bell, LogOut } from 'lucide-react';
import { useTheme, ThemeType } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { UserRole, Notificacion } from '@/types';
import { useNotifications } from '@/contexts/SocketContext';
import { notificacionService } from '@/services/notificacion.service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const lightThemes: { id: ThemeType; name: string; color: string }[] = [
  { id: 'light-blue', name: 'Azul Celeste', color: 'bg-sky-300' },
  { id: 'light-green', name: 'Verde Esmeralda', color: 'bg-emerald-400' },
  { id: 'light-violet', name: 'Violeta Claro', color: 'bg-violet-300' },
  { id: 'light-brown', name: 'Marrón Claro', color: 'bg-amber-600' },
];

const darkThemes: { id: ThemeType; name: string; color: string }[] = [
  { id: 'dark-purple', name: 'Morado/Rosa', color: 'bg-purple-600' },
  { id: 'dark-scarlet', name: 'Escarlata', color: 'bg-red-700' },
  { id: 'dark-black-green', name: 'Negro/Verde', color: 'bg-emerald-900' },
  { id: 'dark-white-gray', name: 'Blanco/Gris', color: 'bg-gray-400' },
];


const getRolLabel = (rol: UserRole): string => {
  switch (rol) {
    case UserRole.ADMIN:
      return 'Administrador';
    case UserRole.ADMIN_AUXILIAR:
      return 'Auxiliar Admin';
    default:
      return rol;
  }
};

const getUserInitials = (nombre: string): string => {
  if (!nombre) return 'U';
  const parts = nombre.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { notificaciones, unreadCount, deleteNotificacion } = useNotifications();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSelectNotification = async (notification: Notificacion) => {
    if (!notification.leida) {
      try {
        await notificacionService.markAsRead(notification.pk_num_notificacion);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    // Opcional: Redirigir según el tipo de notificación
  };

  const markAllAsRead = async () => {
    try {
      await notificacionService.markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await notificacionService.delete(id);
      deleteNotificacion(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Sistema de Gestión Médica
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover border border-border z-50 p-0">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-semibold text-popover-foreground">Notificaciones</p>
              <p className="text-xs text-muted-foreground">Alertas, avisos y eventos recientes</p>
            </div>

            <div className="max-h-80 overflow-y-auto p-1">
              {notificaciones.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No hay notificaciones.
                </div>
              ) : (
                notificaciones.map((notification) => (
                  <DropdownMenuItem
                    key={notification.pk_num_notificacion}
                    onClick={() => handleSelectNotification(notification)}
                    className={cn(
                      'flex flex-col items-start gap-1 cursor-pointer rounded-md px-3 py-2 group',
                      notification.leida ? 'text-muted-foreground opacity-70' : 'bg-accent/40 text-accent-foreground',
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <span className={cn('text-sm leading-tight', !notification.leida && 'font-semibold')}>
                        {notification.titulo}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                        </span>
                        <button 
                          onClick={(e) => handleDeleteNotification(e, notification.pk_num_notificacion)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                        >
                          <LogOut className="w-3 h-3 rotate-180" />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs line-clamp-2 text-muted-foreground">{notification.mensaje}</span>
                  </DropdownMenuItem>
                ))
              )}
            </div>

            <DropdownMenuSeparator className="my-0" />
            <div className="grid gap-1 p-2">
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-md px-2 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                disabled={unreadCount === 0}
              >
                Marcar todo como leído
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <Palette className="w-5 h-5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border border-border z-50">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Temas Claros
            </DropdownMenuLabel>
            {lightThemes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className={cn("w-5 h-5 rounded-full", t.color)} />
                <span>{t.name}</span>
                {theme === t.id && <Check className="w-4 h-4 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Temas Oscuros
            </DropdownMenuLabel>
            {darkThemes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className={cn("w-5 h-5 rounded-full", t.color)} />
                <span>{t.name}</span>
                {theme === t.id && <Check className="w-4 h-4 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-1 pr-3 py-1.5 rounded-full hover:bg-secondary/80 transition-all duration-200 group">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shadow-sm border border-border/20 group-hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-primary-foreground">
                  {user ? getUserInitials(user.nombre || user.email.split('@')[0]) : <User className="w-4 h-4 text-primary-foreground" />}
                </span>
              </div>
              {user && (
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-foreground capitalize tracking-tight">
                    {user.nombre || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 mt-2 bg-popover border border-border z-50 p-1.5 shadow-xl glass-effect">
            <DropdownMenuLabel className="px-3 py-3 mb-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-foreground capitalize">
                  {user?.nombre || user?.email.split('@')[0] || 'Usuario'}
                </span>
                {user && (
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                    {getRolLabel(user.rol)}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer rounded-md py-2">
              <User className="w-4 h-4 mr-2 opacity-70" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-md py-2">
              <Palette className="w-4 h-4 mr-2 opacity-70" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md py-2" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}