import { Sun, Moon, Check, Palette } from 'lucide-react';
import { useTheme, type ThemeType } from '@/contexts/ThemeContext';
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

export function AjustesPage() {
  const { lightPreference, darkPreference, setLightPreference, setDarkPreference, mode, setMode } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Ajustes
        </h1>
        <p className="text-sm text-muted-foreground">Personaliza la apariencia y el comportamiento del sistema</p>
      </div>

      <section className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Apariencia</h2>
          <p className="text-xs text-muted-foreground">
            Elige el color que se usará al cambiar entre Modo Claro y Modo Oscuro desde el encabezado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light */}
          <div className="rounded-lg border border-border p-4 bg-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-foreground">Modo Claro</h3>
              {mode === 'light' && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Actual</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {lightThemes.map(t => (
                <button key={t.id} onClick={() => { setLightPreference(t.id); setMode('light'); }}
                  className={cn('flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent transition-colors',
                    lightPreference === t.id ? 'border-primary bg-primary/10' : 'border-border')}>
                  <span className={cn('w-5 h-5 rounded-full', t.color)} />
                  <span className="text-foreground">{t.name}</span>
                  {lightPreference === t.id && <Check className="w-4 h-4 ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Dark */}
          <div className="rounded-lg border border-border p-4 bg-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-foreground">Modo Oscuro</h3>
              {mode === 'dark' && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Actual</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {darkThemes.map(t => (
                <button key={t.id} onClick={() => { setDarkPreference(t.id); setMode('dark'); }}
                  className={cn('flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent transition-colors',
                    darkPreference === t.id ? 'border-primary bg-primary/10' : 'border-border')}>
                  <span className={cn('w-5 h-5 rounded-full', t.color)} />
                  <span className="text-foreground">{t.name}</span>
                  {darkPreference === t.id && <Check className="w-4 h-4 ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          Al pulsar el interruptor del encabezado se alternará entre las combinaciones seleccionadas y se
          reproducirá una animación de electrocardiograma que cruza la pantalla.
        </div>
      </section>
    </div>
  );
}
