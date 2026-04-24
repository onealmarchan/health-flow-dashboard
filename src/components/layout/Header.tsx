import { useState } from 'react';
import { User, Palette, Sun, Moon, Check, Bell } from 'lucide-react';
import { useTheme, ThemeType } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'message' | 'event' | 'update' | 'security';
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Nuevo mensaje recibido',
    description: 'Tienes un mensaje pendiente de revisión.',
    time: 'Hace 5 min',
    type: 'message',
    read: false,
  },
  {
    id: 2,
    title: 'Evento próximo',
    description: 'Jornada médica programada para mañana.',
    time: 'Hace 20 min',
    type: 'event',
    read: false,
  },
  {
    id: 3,
    title: 'Actualización del sistema',
    description: 'Se actualizaron los módulos de diagnóstico.',
    time: 'Hace 1 h',
    type: 'update',
    read: false,
  },
  {
    id: 4,
    title: 'Alerta de seguridad',
    description: 'Inicio de sesión detectado desde nuevo dispositivo.',
    time: 'Hace 2 h',
    type: 'security',
    read: true,
  },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleSelectNotification = (notification: NotificationItem) => {
    alert(`Notificación seleccionada: ${notification.title}`);
    setNotifications((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No hay notificaciones.
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleSelectNotification(notification)}
                    className={cn(
                      'flex flex-col items-start gap-1 cursor-pointer rounded-md px-3 py-2',
                      notification.read ? 'text-muted-foreground' : 'bg-accent/40 text-accent-foreground',
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <span className={cn('text-sm', !notification.read && 'font-semibold')}>
                        {notification.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{notification.description}</span>
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
              >
                Marcar todo como leído
              </button>
              <button
                type="button"
                onClick={clearAllNotifications}
                className="rounded-md px-2 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Borrar todo
              </button>
              <button
                type="button"
                onClick={() => alert('Personalización de alertas – próximamente')}
                className="rounded-md px-2 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Configuración de alertas
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
            <DropdownMenuItem className="cursor-pointer text-destructive">
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
