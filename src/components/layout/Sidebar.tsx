import { useState } from 'react';
import {
  CalendarDays, Clock, UserCog, Users, FileSearch, Stethoscope,
  ChevronLeft, ChevronRight, Activity, Settings, HelpCircle, LifeBuoy,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/services/useCurrentUser';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
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
  { id: 'especialistas', label: 'Especialistas Médicos', icon: UserCog },
  { id: 'diagnosticos', label: 'Control de Diagnósticos', icon: Stethoscope },
];

const secondaryMenuItems = [
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'helpdesk', label: 'Help Desk', icon: LifeBuoy },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const user = useCurrentUser();
  const isAdmin = user?.rol === 'ADMIN';
  const mainMenuItems = isAdmin ? adminMenuItems : auxiliarMenuItems;

  return (
    <aside className={cn(
      "h-screen bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="font-bold text-sidebar-foreground text-[15px] leading-tight">MediCitas</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {isAdmin ? 'Sistema de Gestión' : 'Panel de Control'}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {mainMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => onPageChange(item.id)}
              className={cn("sidebar-item w-full", isActive && "sidebar-item-active")}
              title={collapsed ? item.label : undefined}>
              <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary-foreground")} />
              {!collapsed && <span className="animate-fade-in truncate text-[13px]">{item.label}</span>}
            </button>
          );
        })}

        <div className="!my-2 mx-3 border-t border-sidebar-border/60" />

        {secondaryMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => onPageChange(item.id)}
              className={cn("sidebar-item w-full", isActive && "sidebar-item-active")}
              title={collapsed ? item.label : undefined}>
              <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-primary-foreground")} />
              {!collapsed && <span className="animate-fade-in truncate text-[13px]">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button onClick={() => setCollapsed(!collapsed)} className="sidebar-item w-full justify-center text-muted-foreground hover:text-sidebar-foreground">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-[13px]">Colapsar</span></>}
        </button>
      </div>
    </aside>
  );
}
