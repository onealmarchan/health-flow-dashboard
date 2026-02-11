import { useState } from 'react';
import { User, Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme, ThemeType } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const lightThemes: { id: ThemeType; name: string; color: string }[] = [
  { id: 'light-blue', name: 'Azul Celeste', color: 'bg-sky-300' },
  { id: 'light-green', name: 'Verde Esmeralda', color: 'bg-emerald-400' },
  { id: 'light-violet', name: 'Violeta Claro', color: 'bg-violet-300' },
  { id: 'light-brown', name: 'Marrón Claro', color: 'bg-amber-600' },
];

const darkThemes: { id: ThemeType; name: string; color: string }[] = [
  { id: 'dark-purple', name: 'Morado/Rosa', color: 'bg-purple-600' },
  { id: 'dark-scarlet', name: 'Escarlata', color: 'bg-red-700' },
  { id: 'dark-black-green', name: 'Negro/Verde', color: 'bg-emerald-900' },
  { id: 'dark-white-gray', name: 'Blanco/Gris', color: 'bg-gray-400' },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Sistema de Gestión Médica
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <Palette className="w-5 h-5 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border border-border z-50">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Temas Claros
            </DropdownMenuLabel>
            {lightThemes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className={cn("w-5 h-5 rounded-full", t.color)} />
                <span>{t.name}</span>
                {theme === t.id && <Check className="w-4 h-4 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Temas Oscuros
            </DropdownMenuLabel>
            {darkThemes.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className={cn("w-5 h-5 rounded-full", t.color)} />
                <span>{t.name}</span>
                {theme === t.id && <Check className="w-4 h-4 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border border-border z-50">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
