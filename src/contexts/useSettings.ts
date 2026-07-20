import { useState, useCallback, useEffect } from 'react';

export type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'lato' | 'system';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type NotificationLevel = 'all' | 'important' | 'critical' | 'none';

export interface Settings {
  fontFamily: FontFamily;
  fontSize: FontSize;
  notifications: NotificationLevel;
  soundEnabled: boolean;
  compactMode: boolean;
}

const STORAGE_KEY = 'healthflow-settings';

const defaults: Settings = {
  fontFamily: 'inter',
  fontSize: 'base',
  notifications: 'all',
  soundEnabled: true,
  compactMode: false,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaults;
}

function persistSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      persistSettings(next);
      return next;
    });
  }, []);

  // Apply font settings to body and :root
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const sizeMap: Record<FontSize, string> = { sm: '13px', base: '14px', lg: '15px', xl: '16px' };
    const familyMap: Record<FontFamily, string> = {
      inter: "'Inter', sans-serif",
      roboto: "'Roboto', sans-serif",
      'open-sans': "'Open Sans', sans-serif",
      lato: "'Lato', sans-serif",
      system: "system-ui, -apple-system, sans-serif",
    };
    const family = familyMap[settings.fontFamily];
    const size = sizeMap[settings.fontSize];
    // Apply directly to body for maximum override
    body.style.fontSize = size;
    body.style.fontFamily = family;
    // Also set CSS variables for components that read them
    root.style.setProperty('--font-size-base', size);
    root.style.setProperty('--font-family-base', family);
    root.classList.toggle('compact-mode', settings.compactMode);
  }, [settings.fontSize, settings.fontFamily, settings.compactMode]);

  return { settings, update };
}

export const FONT_OPTIONS: { id: FontFamily; label: string; sample: string }[] = [
  { id: 'inter', label: 'Inter', sample: 'Clean & modern' },
  { id: 'roboto', label: 'Roboto', sample: 'Material Design' },
  { id: 'open-sans', label: 'Open Sans', sample: 'Highly legible' },
  { id: 'lato', label: 'Lato', sample: 'Warm & friendly' },
  { id: 'system', label: 'Sistema', sample: 'OS default' },
];

export const FONT_SIZE_OPTIONS: { id: FontSize; label: string; px: string }[] = [
  { id: 'sm', label: 'Pequeño', px: '13px' },
  { id: 'base', label: 'Normal', px: '14px' },
  { id: 'lg', label: 'Grande', px: '15px' },
  { id: 'xl', label: 'Extra grande', px: '16px' },
];

export const NOTIFICATION_OPTIONS: { id: NotificationLevel; label: string; desc: string }[] = [
  { id: 'all', label: 'Todas', desc: 'Recibir todas las notificaciones del sistema' },
  { id: 'important', label: 'Importantes', desc: 'Solo alertas de citas y cambios importantes' },
  { id: 'critical', label: 'Solo críticas', desc: 'Emergencias y vencimientos urgentes' },
  { id: 'none', label: 'Ninguna', desc: 'Desactivar todas las notificaciones' },
];
