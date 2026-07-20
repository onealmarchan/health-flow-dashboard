import { useState, useCallback, Suspense, lazy } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { PanelControlPage } from '@/components/pages/PanelControlPage';
import { useCurrentUser } from '@/services/useCurrentUser';

const CitasPage = lazy(() => import('@/components/pages/CitasPage').then(m => ({ default: m.CitasPage })));
const JornadasPage = lazy(() => import('@/components/pages/JornadasPage').then(m => ({ default: m.JornadasPage })));
const EspecialistasPage = lazy(() => import('@/components/pages/EspecialistasPage').then(m => ({ default: m.EspecialistasPage })));
const UsuariosPage = lazy(() => import('@/components/pages/UsuariosPage').then(m => ({ default: m.UsuariosPage })));
const AuditoriasPage = lazy(() => import('@/components/pages/AuditoriasPage').then(m => ({ default: m.AuditoriasPage })));
const DiagnosticosPage = lazy(() => import('@/components/pages/DiagnosticosPage').then(m => ({ default: m.DiagnosticosPage })));
const AjustesPage = lazy(() => import('@/components/pages/AjustesPage').then(m => ({ default: m.AjustesPage })));
const FAQPage = lazy(() => import('@/components/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const HelpDeskPage = lazy(() => import('@/components/pages/HelpDeskPage').then(m => ({ default: m.HelpDeskPage })));

const pageComponents: Record<string, React.ComponentType<{ onPageChange?: (page: string) => void }>> = {
  dashboard: DashboardContent,
  panel: PanelControlPage,
  citas: CitasPage,
  jornadas: JornadasPage,
  especialistas: EspecialistasPage,
  diagnosticos: DiagnosticosPage,
  usuarios: UsuariosPage,
  auditorias: AuditoriasPage,
  ajustes: AjustesPage,
  faq: FAQPage,
  helpdesk: HelpDeskPage,
};

const ADMIN_ONLY_PAGES = new Set(['usuarios', 'auditorias', 'dashboard']);

const Index = () => {
  const user = useCurrentUser();
  const isAdmin = user?.rol === 'ADMIN';
  const defaultPage = isAdmin ? 'dashboard' : 'panel';
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const effectivePage = !isAdmin && ADMIN_ONLY_PAGES.has(currentPage) ? defaultPage : currentPage;
  const PageComponent = pageComponents[effectivePage] || DashboardContent;

  const handlePageChange = useCallback((page: string) => {
    setCurrentPage(page);
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        currentPage={effectivePage}
        onPageChange={handlePageChange}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} onPageChange={handlePageChange} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          <div key={effectivePage} className="animate-page-enter">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }>
              <PageComponent onPageChange={handlePageChange} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
