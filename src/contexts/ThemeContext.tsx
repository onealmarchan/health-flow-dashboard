import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 
  | 'light-blue' 
  | 'light-green' 
  | 'light-violet' 
  | 'light-brown'
  | 'dark-purple' 
  | 'dark-scarlet' 
  | 'dark-black-green'
  | 'dark-white-gray';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeClasses: Record<ThemeType, string> = {
  'light-blue': '',
  'light-green': 'theme-light-green',
  'light-violet': 'theme-light-violet',
  'light-brown': 'theme-light-brown',
  'dark-purple': 'theme-dark-purple',
  'dark-scarlet': 'theme-dark-scarlet',
  'dark-black-green': 'theme-dark-black-green',
  'dark-white-gray': 'theme-dark-white-gray',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light-blue');

  useEffect(() => {
    const root = document.documentElement;
    Object.values(themeClasses).forEach(cls => {
      if (cls) root.classList.remove(cls);
    });
    const themeClass = themeClasses[theme];
    if (themeClass) {
      root.classList.add(themeClass);
    }
  }, [theme]);

  const isDark = theme.startsWith('dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
