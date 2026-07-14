import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, Clock, UserCog, Users, FileSearch, Stethoscope,
  ChevronLeft, ChevronRight, Activity, Settings, HelpCircle, LifeBuoy,
  LayoutDashboard, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/services/useCurrentUser';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'citas', label: 'Citas', icon: CalendarDays },
  { id: 'jornadas', label: 'Planificación de Jornadas', icon: Clock },
  { id: 'especialistas', label: 'Especialistas Médicos', icon: UserCog },
  { id: 'diagnosticos', label: 'Control de Diagnósticos', icon: Stethoscope },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'auditorias', label: 'Historial de Cambios', icon: FileSearch },
];

const auxiliarMenuItems = [
  { id: 'panel', label: 'Panel de Control', icon: LayoutDashboard },
  { id: 'citas', label: 'Citas', icon: CalendarDays },
  { id: 'jornadas', label: 'Planificación de Jornadas', icon: Clock },
  { id: 'especialistas', label: 'Especialistas Médicos', icon: UserCog },
  { id: 'diagnosticos', label: 'Control de Diagnósticos', icon: Stethoscope },
];

const secondaryMenuItems = [
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'helpdesk', label: 'Help Desk', icon: LifeBuoy },
];

export function Sidebar({ currentPage, onPageChange, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const user = useCurrentUser();
  const isAdmin = user?.rol === 'ADMIN';
  const mainMenuItems = isAdmin ? adminMenuItems : auxiliarMenuItems;

  const closeMobile = useCallback(() => {
    onMobileClose?.();
  }, [onMobileClose]);

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = mobileOpen ? 'hidden' : '';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen, isMobile]);

  const handlePageChange = useCallback((page: string) => {
    onPageChange(page);
    if (isMobile) closeMobile();
  }, [onPageChange, isMobile, closeMobile]);

  const sidebarContent = (
    <aside className={cn(
      "h-full bg-sidebar glass-sidebar flex flex-col transition-all duration-300",
      isMobile ? "w-72" : collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shrink-0">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="font-bold text-sidebar-foreground text-[15px] leading-tight">MediCitas</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {isAdmin ? 'Sistema de Gestión' : 'Panel de Control'}
              </p>
            </div>
          )}
        </div>
        {isMobile && (
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {mainMenuItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={cn(
                "sidebar-item w-full animate-fade-in",
                isActive && "sidebar-item-active"
              )}
              style={{ animationDelay: `${i * 0.04}s` }}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary-foreground")} />
              {(!collapsed || isMobile) && (
                <span className="animate-fade-in truncate text-[13px]">{item.label}</span>
              )}
            </button>
          );
        })}

        <div className="!my-2 mx-3 border-t border-sidebar-border/60" />

        {secondaryMenuItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={cn(
                "sidebar-item w-full animate-fade-in",
                isActive && "sidebar-item-active"
              )}
              style={{ animationDelay: `${(mainMenuItems.length + i) * 0.04}s` }}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary-foreground")} />
              {(!collapsed || isMobile) && (
                <span className="animate-fade-in truncate text-[13px]">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!isMobile && (
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-item w-full justify-center text-muted-foreground hover:text-sidebar-foreground cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[13px]">Colapsar</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );

  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-overlay-in"
            onClick={closeMobile}
          />
        )}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          )}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <div className="sticky top-0 h-screen flex-shrink-0">
      {sidebarContent}
    </div>
  );
}
