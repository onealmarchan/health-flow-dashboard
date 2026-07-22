import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { lazy, Suspense } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import SharedOpen from '@/components/auth/SharedOpen';
import { useEffect } from 'react';
import { clearAuthToken } from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AccesoDenegado = lazy(() => import("./pages/AccesoDenegado"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppBroadcasts />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/dashboard" element={<RequireAuth><Index /></RequireAuth>} />
                <Route path="/shared/:id" element={<SharedOpen />} />
                <Route path="/login" element={<Login />} />
                <Route path="/acceso-denegado" element={<AccesoDenegado />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

function forceLogout() {
  try { localStorage.removeItem('token'); } catch {}
  try { clearAuthToken(); } catch {}
  try { localStorage.removeItem('activeSharedId'); } catch {}
  queryClient.clear();
}

function AppBroadcasts() {
  const navigate = useNavigate();

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('shared-session');
      bc.onmessage = (ev) => {
        const data = ev.data as any;
        if (data?.type === 'open') {
          forceLogout();
          navigate('/login');
        }
      };
    } catch {
      const handler = (ev: StorageEvent) => {
        if (ev.key === 'shared_open' && ev.newValue) {
          forceLogout();
          navigate('/login');
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }

    return () => { if (bc) bc.close(); };
  }, [navigate]);
  return null;
}
