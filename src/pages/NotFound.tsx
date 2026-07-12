import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg mb-6">
          <Activity className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-foreground tracking-tight mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-2">Página no encontrada</p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          La ruta <span className="font-mono text-foreground/60">{location.pathname}</span> no existe en el sistema.
        </p>
        <Button asChild variant="outline" className="gap-2">
          <a href="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
