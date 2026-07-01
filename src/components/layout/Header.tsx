import { useState } from 'react';
import { User, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ECGTransition } from '@/components/theme/ECGTransition';

type NotificationItem = {
  id: number; title: string; description: string; time: string;
  type: 'message' | 'event' | 'update' | 'security'; read: boolean;
};

const initialNotifications: NotificationItem[] = [
  { id: 1, title: 'Nuevo mensaje recibido', description: 'Tienes un mensaje pendiente de revisión.', time: 'Hace 5 min', type: 'message', read: false },
  { id: 2, title: 'Evento próximo', description: 'Jornada médica programada para mañana.', time: 'Hace 20 min', type: 'event', read: false },
  { id: 3, title: 'Actualización del sistema', description: 'Se actualizaron los módulos de diagnóstico.', time: 'Hace 1 h', type: 'update', read: false },
  { id: 4, title: 'Alerta de seguridad', description: 'Inicio de sesión detectado desde nuevo dispositivo.', time: 'Hace 2 h', type: 'security', read: true },
];

export function Header() {
  const { mode, toggleMode, transitionTick } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter(item => !item.read).length;

  const handleSelectNotification = (n: NotificationItem) => {
    setNotifications(cur => cur.map(i => (i.id === n.id ? { ...i, read: true } : i)));
  };
  const markAllAsRead = () => setNotifications(cur => cur.map(i => ({ ...i, read: true })));
  const clearAllNotifications = () => setNotifications([]);

  const isDark = mode === 'dark';

  return (
    <>
      <ECGTransition trigger={transitionTick} />
      <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">Sistema de Gestión Médica</h2>
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
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">No hay notificaciones.</div>
                ) : (
                  notifications.map(n => (
                    <DropdownMenuItem key={n.id} onClick={() => handleSelectNotification(n)}
                      className={cn('flex flex-col items-start gap-1 cursor-pointer rounded-md px-3 py-2',
                        n.read ? 'text-muted-foreground' : 'bg-accent/40 text-accent-foreground')}>
                      <div className="flex w-full items-start justify-between gap-3">
                        <span className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{n.description}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <DropdownMenuSeparator className="my-0" />
              <div className="grid gap-1 p-2">
                <button type="button" onClick={markAllAsRead}
                  className="rounded-md px-2 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  Marcar todo como leído
                </button>
                <button type="button" onClick={clearAllNotifications}
                  className="rounded-md px-2 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  Borrar todo
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme mode toggle */}
          <button
            onClick={toggleMode}
            aria-label="Cambiar modo claro/oscuro"
            title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className={cn(
              'relative w-14 h-8 rounded-full p-1 transition-colors overflow-hidden',
              'border border-border shadow-sm',
              isDark ? 'bg-slate-800' : 'bg-sky-100'
            )}
          >
            <span
              className={cn(
                'absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 shadow-md',
                isDark ? 'translate-x-6 bg-slate-900 text-yellow-200' : 'translate-x-0 bg-white text-amber-500'
              )}
            >
              {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border border-border z-50">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
