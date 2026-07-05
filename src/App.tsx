import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AccesoDenegado from "./pages/AccesoDenegado";
import RequireAuth from '@/components/auth/RequireAuth';
import SharedOpen from '@/components/auth/SharedOpen';
import { useEffect } from 'react';
import { clearAuthToken } from '@/services/apiClient';
import { useNavigate } from 'react-router-dom';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppBroadcasts />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/dashboard" element={<RequireAuth><Index /></RequireAuth>} />
              <Route path="/shared/:id" element={<SharedOpen />} />
              <Route path="/login" element={<Login />} />
              <Route path="/acceso-denegado" element={<AccesoDenegado />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

function AppBroadcasts() {
  // global listener for shared-session open events
  const navigate = useNavigate();
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('shared-session');
      bc.onmessage = (ev) => {
        const data = ev.data as any;
        if (data?.type === 'open') {
          try { localStorage.removeItem('token'); } catch (e) {}
          try { clearAuthToken(); } catch (e) {}
          // optionally remove activeSharedId
          try { localStorage.removeItem('activeSharedId'); } catch (e) {}
          navigate('/login');
        }
      };
    } catch (e) {
      // fallback: listen to localStorage changes
      const handler = (ev: StorageEvent) => {
        if (ev.key === 'shared_open' && ev.newValue) {
          try { localStorage.removeItem('token'); } catch (e) {}
          try { clearAuthToken(); } catch (e) {}
          try { localStorage.removeItem('activeSharedId'); } catch (e) {}
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
