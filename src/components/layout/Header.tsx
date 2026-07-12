import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '@/services/useAuth';
import { clearAuthToken } from '@/services/apiClient';
import { useNotificaciones, useMarkNotificacionAsRead, useMarkAllAsRead, useDeleteNotificacion, useDeleteAllNotificaciones } from '@/services/useNotificaciones';
import { User, Sun, Moon, Bell, MessageSquare, Calendar, AlertTriangle, Shield, Trash2, CheckCheck } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ECGTransition } from '@/components/theme/ECGTransition';

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'message' | 'event' | 'update' | 'security';
  read: boolean;
};

const typeConfig: Record<NotificationItem['type'], { icon: typeof Bell; color: string }> = {
  message: { icon: MessageSquare, color: 'text-blue-500' },
  event: { icon: Calendar, color: 'text-emerald-500' },
  update: { icon: AlertTriangle, color: 'text-amber-500' },
  security: { icon: Shield, color: 'text-violet-500' },
};

export function Header() {
  const { mode, toggleMode, transitionTick } = useTheme();
  const navigate = useNavigate();
  const logout = useLogout();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { data: apiNotifications = [], isLoading } = useNotificaciones();
  const markAsRead = useMarkNotificacionAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNot = useDeleteNotificacion();
  const deleteAll = useDeleteAllNotificaciones();

  const notifications: NotificationItem[] = (apiNotifications || []).map((n: any) => ({
    id: Number(n.id ?? n.pk_num_notificacion ?? n.pk_num_mensaje ?? 0),
    title: n.titulo || n.title || n.asunto || n.message || String(n.id),
    description: n.descripcion || n.description || n.body || n.mensaje || '',
    time: n.tiempo || n.time || (n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'),
    type: (n.tipo || n.type || 'update') as NotificationItem['type'],
    read: Boolean(n.leida || n.leido || n.read || n.visto),
  }));

  const unreadCount = notifications.filter(item => !item.read).length;

  const handleSelectNotification = (n: NotificationItem) => {
    if (!n.read) markAsRead.mutate(n.id);
  };

  const isDark = mode === 'dark';

  return (
    <>
      <ECGTransition trigger={transitionTick} />
      <header className="h-14 bg-card/90 backdrop-blur-sm border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h2 className="text-[15px] font-semibold text-foreground">Sistema de Gestión Médica</h2>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors duration-200">
                <Bell className="w-[18px] h-[18px] text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center leading-none shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 bg-popover border border-border z-50 p-0 shadow-lg">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-popover-foreground">Notificaciones</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead.mutate()}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                    title="Marcar todo como leído"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar todo
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">Cargando...</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const cfg = typeConfig[n.type] || typeConfig.update;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleSelectNotification(n)}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-0',
                          n.read
                            ? 'hover:bg-secondary/30'
                            : 'bg-primary/5 hover:bg-primary/10'
                        )}
                      >
                        <div className={cn('mt-0.5 p-1.5 rounded-md', n.read ? 'bg-secondary/60' : 'bg-primary/10')}>
                          <Icon className={cn('w-3.5 h-3.5', n.read ? 'text-muted-foreground' : cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn('text-sm leading-snug', n.read ? 'text-muted-foreground' : 'font-medium text-foreground')}>
                              {n.title}
                            </p>
                            <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                          </div>
                          {n.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                          )}
                        </div>
                        {!n.read && (
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); deleteNot.mutate(n.id); }}
                          className="mt-0.5 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator className="my-0" />
                  <div className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => deleteAll.mutate()}
                      className="w-full rounded-md px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      Borrar todo
                    </button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme mode toggle */}
          <button
            onClick={toggleMode}
            aria-label="Cambiar modo claro/oscuro"
            title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className={cn(
              'relative w-14 h-7 rounded-full p-1 transition-all duration-300 ease-out',
              'border border-border shadow-sm',
              isDark ? 'bg-slate-800' : 'bg-sky-100'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm',
                isDark ? 'translate-x-7 bg-slate-900 text-yellow-200' : 'translate-x-0 bg-white text-amber-500'
              )}
            >
              {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors duration-200">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border border-border z-50">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={() => {
                    logout.mutate(undefined, {
                      onSuccess: () => {
                        try { clearAuthToken(); } catch (e) {}
                        navigate('/login');
                      },
                      onError: () => {
                        try { clearAuthToken(); } catch (e) {}
                        navigate('/login');
                      }
                    });
                  }}
                >Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
