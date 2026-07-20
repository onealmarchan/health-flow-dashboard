import { Sun, Moon, Check, Palette, Bell, Type, Zap, Info } from 'lucide-react';
import { useTheme, type ThemeType } from '@/contexts/ThemeContext';
import {
  useSettings, FONT_OPTIONS, FONT_SIZE_OPTIONS, NOTIFICATION_OPTIONS,
} from '@/contexts/useSettings';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const lightThemes: { id: ThemeType; name: string; color: string }[] = [
  { id: 'light-blue', name: 'Azul Celeste', color: 'bg-sky-300' },
  { id: 'light-green', name: 'Verde Esmeralda', color: 'bg-emerald-400' },
  { id: 'light-violet', name: 'Violeta Claro', color: 'bg-violet-300' },
  { id: 'light-brown', name: 'Marrón Claro', color: 'bg-amber-600' },
  { id: 'light-teal', name: 'Teal Médico', color: 'bg-teal-400' },
  { id: 'light-coral', name: 'Coral Terapéutico', color: 'bg-rose-400' },
  { id: 'light-indigo', name: 'Índigo Profesional', color: 'bg-indigo-400' },
];
const darkThemes: { id: ThemeType; name: string; color: string }[] = [
  { id: 'dark-purple', name: 'Morado/Rosa', color: 'bg-purple-600' },
  { id: 'dark-scarlet', name: 'Escarlata', color: 'bg-red-700' },
  { id: 'dark-black-green', name: 'Negro/Verde', color: 'bg-emerald-900' },
  { id: 'dark-white-gray', name: 'Blanco/Gris', color: 'bg-gray-400' },
  { id: 'dark-navy', name: 'Navy Profesional', color: 'bg-blue-800' },
  { id: 'dark-emerald', name: 'Emerald Oscuro', color: 'bg-emerald-800' },
  { id: 'dark-slate', name: 'Slate Moderno', color: 'bg-slate-700' },
];

export function AjustesPage() {
  const { lightPreference, darkPreference, setLightPreference, setDarkPreference, mode, setMode } = useTheme();
  const { settings, update } = useSettings();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Ajustes del Sistema
        </h1>
        <p className="text-sm text-muted-foreground">Personaliza la apariencia, notificaciones y comportamiento del sistema</p>
      </div>

      {/* APARIENCIA */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Apariencia</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Elige el color que se usará al cambiar entre Modo Claro y Modo Oscuro desde el encabezado.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-border p-4 bg-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-foreground">Modo Claro</h3>
              {mode === 'light' && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Actual</span>}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {lightThemes.map(t => (
                <button key={t.id} onClick={() => { setLightPreference(t.id); setMode('light'); }}
                  className={cn('flex items-center gap-2 rounded-md border p-2.5 text-sm hover:bg-accent transition-colors',
                    lightPreference === t.id ? 'border-primary bg-primary/10' : 'border-border')}>
                  <span className={cn('w-5 h-5 rounded-full shrink-0', t.color)} />
                  <span className="text-foreground">{t.name}</span>
                  {lightPreference === t.id && <Check className="w-4 h-4 ml-auto text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 bg-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-foreground">Modo Oscuro</h3>
              {mode === 'dark' && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Actual</span>}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {darkThemes.map(t => (
                <button key={t.id} onClick={() => { setDarkPreference(t.id); setMode('dark'); }}
                  className={cn('flex items-center gap-2 rounded-md border p-2.5 text-sm hover:bg-accent transition-colors',
                    darkPreference === t.id ? 'border-primary bg-primary/10' : 'border-border')}>
                  <span className={cn('w-5 h-5 rounded-full shrink-0', t.color)} />
                  <span className="text-foreground">{t.name}</span>
                  {darkPreference === t.id && <Check className="w-4 h-4 ml-auto text-primary shrink-0" />}
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

      {/* TIPOGRAFÍA */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Tipografía</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Configura la fuente y el tamaño del texto. Afecta a todo el sistema.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Familia tipográfica</label>
            <div className="grid grid-cols-1 gap-1.5">
              {FONT_OPTIONS.map(f => (
                <button key={f.id} onClick={() => update('fontFamily', f.id)}
                  className={cn(
                    'flex items-center justify-between rounded-md border p-2.5 text-sm hover:bg-accent transition-colors text-left',
                    settings.fontFamily === f.id ? 'border-primary bg-primary/10' : 'border-border',
                  )}>
                  <div>
                    <span className="text-foreground font-medium">{f.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{f.sample}</span>
                  </div>
                  {settings.fontFamily === f.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tamaño del texto</label>
            <div className="grid grid-cols-1 gap-1.5">
              {FONT_SIZE_OPTIONS.map(s => (
                <button key={s.id} onClick={() => update('fontSize', s.id)}
                  className={cn(
                    'flex items-center justify-between rounded-md border p-2.5 hover:bg-accent transition-colors text-left',
                    settings.fontSize === s.id ? 'border-primary bg-primary/10' : 'border-border',
                  )}>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">{s.label}</span>
                    <span className="text-xs text-muted-foreground">({s.px})</span>
                  </div>
                  {settings.fontSize === s.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NOTIFICACIONES */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Notificaciones</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Controla la frecuencia y el tipo de notificaciones que recibes.
        </p>

        <div className="space-y-3">
          {NOTIFICATION_OPTIONS.map(n => (
            <button key={n.id} onClick={() => update('notifications', n.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-md border p-3 text-left hover:bg-accent transition-colors',
                settings.notifications === n.id ? 'border-primary bg-primary/10' : 'border-border',
              )}>
              <div className={cn(
                'w-3 h-3 rounded-full border-2 shrink-0',
                settings.notifications === n.id ? 'border-primary bg-primary' : 'border-muted-foreground/40',
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              {settings.notifications === n.id && <Check className="w-4 h-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>

        <Separator className="my-2" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Sonido de notificación</p>
            <p className="text-xs text-muted-foreground">Reproducir sonido al recibir una notificación</p>
          </div>
          <Switch checked={settings.soundEnabled} onCheckedChange={v => update('soundEnabled', v)} />
        </div>
      </section>

      {/* RENDIMIENTO */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Rendimiento</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Opciones de interfaz para optimizar la experiencia de uso.
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Modo compacto</p>
            <p className="text-xs text-muted-foreground">Reduce el espaciado y el tamaño de los elementos para ver más contenido</p>
          </div>
          <Switch checked={settings.compactMode} onCheckedChange={v => update('compactMode', v)} />
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Tus preferencias se guardan automáticamente en este navegador.
        </p>
      </section>
    </div>
  );
}
