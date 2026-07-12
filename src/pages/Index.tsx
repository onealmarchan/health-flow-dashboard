import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { CitasPage } from '@/components/pages/CitasPage';
import { JornadasPage } from '@/components/pages/JornadasPage';
import { EspecialistasPage } from '@/components/pages/EspecialistasPage';
import { UsuariosPage } from '@/components/pages/UsuariosPage';
import { AuditoriasPage } from '@/components/pages/AuditoriasPage';
import { DiagnosticosPage } from '@/components/pages/DiagnosticosPage';
import { AjustesPage } from '@/components/pages/AjustesPage';
import { FAQPage } from '@/components/pages/FAQPage';
import { HelpDeskPage } from '@/components/pages/HelpDeskPage';
import { PanelControlPage } from '@/components/pages/PanelControlPage';
import { useCurrentUser } from '@/services/useCurrentUser';

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

const ADMIN_ONLY_PAGES = new Set(['usuarios', 'auditorias', 'dashboard', 'jornadas']);

const Index = () => {
  const user = useCurrentUser();
  const isAdmin = user?.rol === 'ADMIN';
  const defaultPage = isAdmin ? 'dashboard' : 'panel';
  const [currentPage, setCurrentPage] = useState(defaultPage);

  const effectivePage = !isAdmin && ADMIN_ONLY_PAGES.has(currentPage) ? defaultPage : currentPage;
  const PageComponent = pageComponents[effectivePage] || DashboardContent;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar currentPage={effectivePage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <PageComponent onPageChange={setCurrentPage} />
        </main>
      </div>
    </div>
  );
};

export default Index;
