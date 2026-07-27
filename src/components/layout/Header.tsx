import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '@/services/useAuth';
import { clearAuthToken } from '@/services/apiClient';
import { useNotificaciones, useMarkNotificacionAsRead, useMarkAllAsRead, useDeleteNotificacion, useDeleteAllNotificaciones } from '@/services/useNotificaciones';
import { useCurrentUser } from '@/services/useCurrentUser';
import { User, Sun, Moon, Bell, MessageSquare, Calendar, AlertTriangle, Shield, Trash2, CheckCheck, X, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ECGTransition } from '@/components/theme/ECGTransition';
import { useIsMobile } from '@/hooks/use-mobile';

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'message' | 'event' | 'update' | 'security';
  read: boolean;
};

const typeConfig: Record<NotificationItem['type'], { icon: typeof Bell; color: string; bg: string }> = {
  message: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  event: { icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  update: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  security: { icon: Shield, color: 'text-violet-500', bg: 'bg-violet-500/10' },
};

interface HeaderProps {
  onMenuToggle?: () => void;
  onPageChange?: (page: string) => void;
}

export function Header({ onMenuToggle, onPageChange }: HeaderProps) {
  const { mode, toggleMode, transitionTick } = useTheme();
  const navigate = useNavigate();
  const logout = useLogout();
  const isMobile = useIsMobile();
  const user = useCurrentUser();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newNotifIds, setNewNotifIds] = useState<Set<number>>(new Set());
  const prevNotifCountRef = useRef(0);
  const { data: apiNotifications = [], isLoading } = useNotificaciones();
  const markAsRead = useMarkNotificacionAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNot = useDeleteNotificacion();
  const deleteAll = useDeleteAllNotificaciones();

  const notifications: NotificationItem[] = (() => {
    const seen = new Set<number>();
    return (apiNotifications || [])
      .map((n: any) => ({
        id: Number(n.id ?? n.pk_num_notificacion ?? n.pk_num_mensaje ?? 0),
        title: n.titulo || n.title || n.asunto || n.message || String(n.id),
        description: n.descripcion || n.description || n.body || n.mensaje || '',
        time: n.tiempo || n.time || (n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'),
        type: (n.tipo || n.type || 'update') as NotificationItem['type'],
        read: Boolean(n.leida || n.leido || n.read || n.visto),
      }))
      .filter((n) => {
        if (n.id === 0 || seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      });
  })();

  const unreadCount = notifications.filter(item => !item.read).length;

  // Detect new notifications for animation
  useEffect(() => {
    const currentCount = notifications.length;
    if (prevNotifCountRef.current > 0 && currentCount > prevNotifCountRef.current) {
      const newIds = notifications
        .filter(n => !n.read)
        .slice(0, currentCount - prevNotifCountRef.current)
        .map(n => n.id);
      setNewNotifIds(prev => {
        const next = new Set(prev);
        newIds.forEach(id => next.add(id));
        return next;
      });
      // Clear animation class after it plays
      const timer = setTimeout(() => setNewNotifIds(new Set()), 600);
      return () => clearTimeout(timer);
    }
    prevNotifCountRef.current = currentCount;
  }, [notifications.length]);

  const handleSelectNotification = (n: NotificationItem) => {
    if (!n.read) markAsRead.mutate(n.id);
    setSelectedNotif(n);
    setNotificationsOpen(false);
  };

  const isDark = mode === 'dark';

  return (
    <>
      <ECGTransition trigger={transitionTick} />
      <header className="h-14 bg-card/90 backdrop-blur-sm border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {isMobile && onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors duration-200 cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          <h2 className="text-sm sm:text-[15px] font-semibold text-foreground truncate">
            {isMobile ? 'MediCitas' : 'Sistema de Gestión Médica'}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <span
                role="button"
                className="relative p-2 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors duration-200 cursor-pointer"
                aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
              >
                <Bell className="w-[18px] h-[18px] text-foreground" />
                {unreadCount > 0 && (
                  <span
                    aria-live="polite"
                    className={cn(
                      "absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center leading-none shadow-sm",
                      "animate-badge-pulse"
                    )}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn(
                "bg-popover border border-border z-50 p-0 shadow-lg",
                isMobile ? "w-[calc(100vw-2rem)] max-w-96" : "w-96"
              )}
            >
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
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    title="Marcar todo como leído"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Marcar todo
                  </button>
                )}
              </div>
              <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    Cargando...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                  </div>
                ) : (
                  notifications.map((n, i) => {
                    const cfg = typeConfig[n.type] || typeConfig.update;
                    const Icon = cfg.icon;
                    const isNew = newNotifIds.has(n.id);
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleSelectNotification(n)}
                        className={cn(
                          'w-full text-left flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b border-border/50 last:border-0',
                          n.read
                            ? 'hover:bg-secondary/30'
                            : 'bg-primary/5 hover:bg-primary/10',
                          isNew && 'animate-notification-slide'
                        )}
                        style={{ animationDelay: `${i * 0.03}s` }}
                      >
                        <div className={cn('mt-0.5 p-1.5 rounded-md shrink-0', n.read ? 'bg-secondary/60' : cfg.bg)}>
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
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse-soft" />
                        )}
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); deleteNot.mutate(n.id); }}
                          className="mt-0.5 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0 cursor-pointer"
                          title="Eliminar"
                          aria-label="Eliminar notificación"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </button>
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
                      className="w-full rounded-md px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5 cursor-pointer"
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
              'relative w-14 h-7 rounded-full p-1 transition-all duration-300 ease-out cursor-pointer',
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

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors duration-200 cursor-pointer" role="button" aria-label="Menú de usuario">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                {!isMobile && (
                  <span className="text-sm font-medium text-foreground hidden sm:block">
                    {user?.email ? user.email.split('@')[0] : 'Usuario'}
                  </span>
                )}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border border-border z-50">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setProfileOpen(true)}>Perfil</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => onPageChange?.('ajustes')}>Ajustes</DropdownMenuItem>
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

      {/* Notification Detail Modal */}
      <Dialog open={selectedNotif !== null} onOpenChange={(o) => !o && setSelectedNotif(null)}>
        <DialogContent className="bg-card border border-border max-w-sm sm:max-w-md p-0 overflow-hidden">
          {selectedNotif && (() => {
            const cfg = typeConfig[selectedNotif.type] || typeConfig.update;
            const Icon = cfg.icon;
            return (
              <>
                <div className={cn('px-5 pt-5 pb-4')}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn('p-2.5 rounded-xl shrink-0', cfg.bg)}>
                      <Icon className={cn('w-5 h-5', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-foreground text-base leading-snug pr-6">
                        {selectedNotif.title}
                      </DialogTitle>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{selectedNotif.time}</span>
                        <span className={cn(
                          'ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide',
                          cfg.bg, cfg.color
                        )}>
                          {selectedNotif.type === 'message' ? 'Mensaje' :
                           selectedNotif.type === 'event' ? 'Evento' :
                           selectedNotif.type === 'security' ? 'Seguridad' : 'Actualización'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedNotif.description ? (
                    <div className="bg-secondary/40 rounded-lg p-4 border border-border/50">
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {selectedNotif.description}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-secondary/40 rounded-lg p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground italic">
                        Esta notificación no contiene detalles adicionales.
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-5 pb-4 flex justify-end gap-2">
                  <button
                    onClick={() => { deleteNot.mutate(selectedNotif.id); setSelectedNotif(null); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer font-medium"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="px-4 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="bg-card border border-border max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Mi Perfil</DialogTitle>
            <DialogDescription className="text-muted-foreground">Información de tu cuenta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {user?.email ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Usuario'}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email || 'Sin email'}</p>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4 space-y-3 bg-secondary/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rol</span>
                <span className="text-sm font-medium text-foreground px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {user?.rol || 'Sin rol'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ID de usuario</span>
                <span className="text-sm font-mono text-foreground">{user?.id || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estado</span>
                <span className="text-sm font-medium text-green-600">Activo</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
