import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { CitasPage } from '@/components/pages/CitasPage';
import { HorariosPage } from '@/components/pages/HorariosPage';
import { EspecialistasPage } from '@/components/pages/EspecialistasPage';
import { EmpleadosPage } from '@/components/pages/EmpleadosPage';
import { AuditoriasPage } from '@/components/pages/AuditoriasPage';

const pageComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardContent,
  citas: CitasPage,
  horarios: HorariosPage,
  especialistas: EspecialistasPage,
  empleados: EmpleadosPage,
  auditorias: AuditoriasPage,
};

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const PageComponent = pageComponents[currentPage] || DashboardContent;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <PageComponent />
        </main>
      </div>
    </div>
  );
};

export default Index;
