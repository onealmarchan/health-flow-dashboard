import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeType =
  | 'light-blue' | 'light-green' | 'light-violet' | 'light-brown'
  | 'light-teal' | 'light-coral' | 'light-indigo'
  | 'dark-purple' | 'dark-scarlet' | 'dark-black-green' | 'dark-white-gray'
  | 'dark-navy' | 'dark-emerald' | 'dark-slate';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  lightPreference: ThemeType;
  darkPreference: ThemeType;
  setLightPreference: (theme: ThemeType) => void;
  setDarkPreference: (theme: ThemeType) => void;
  isDark: boolean;
  transitionTick: number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeClasses: Record<ThemeType, string> = {
  'light-blue': '',
  'light-green': 'theme-light-green',
  'light-violet': 'theme-light-violet',
  'light-brown': 'theme-light-brown',
  'light-teal': 'theme-light-teal',
  'light-coral': 'theme-light-coral',
  'light-indigo': 'theme-light-indigo',
  'dark-purple': 'theme-dark-purple',
  'dark-scarlet': 'theme-dark-scarlet',
  'dark-black-green': 'theme-dark-black-green',
  'dark-white-gray': 'theme-dark-white-gray',
  'dark-navy': 'theme-dark-navy',
  'dark-emerald': 'theme-dark-emerald',
  'dark-slate': 'theme-dark-slate',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [lightPreference, setLightPreference] = useState<ThemeType>('light-blue');
  const [darkPreference, setDarkPreference] = useState<ThemeType>('dark-purple');
  const [mode, setMode] = useState<ThemeMode>('light');
  const [transitionTick, setTransitionTick] = useState(0);

  const theme = mode === 'light' ? lightPreference : darkPreference;

  const setTheme = useCallback((t: ThemeType) => {
    if (t.startsWith('light')) {
      setLightPreference(t);
      setMode('light');
    } else {
      setDarkPreference(t);
      setMode('dark');
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(m => (m === 'light' ? 'dark' : 'light'));
    setTransitionTick(t => t + 1);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.values(themeClasses).forEach(cls => cls && root.classList.remove(cls));
    const cls = themeClasses[theme];
    if (cls) root.classList.add(cls);
  }, [theme]);

  const isDark = mode === 'dark';

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, mode, setMode, toggleMode,
      lightPreference, darkPreference, setLightPreference, setDarkPreference,
      isDark, transitionTick,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
