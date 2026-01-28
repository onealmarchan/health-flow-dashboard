import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 
  | 'light-white' 
  | 'light-green' 
  | 'light-blue' 
  | 'dark-purple' 
  | 'dark-scarlet' 
  | 'dark-black';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeClasses: Record<ThemeType, string> = {
  'light-white': '',
  'light-green': 'theme-light-green',
  'light-blue': 'theme-light-blue',
  'dark-purple': 'theme-dark-purple',
  'dark-scarlet': 'theme-dark-scarlet',
  'dark-black': 'theme-dark-black',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light-white');

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    Object.values(themeClasses).forEach(cls => {
      if (cls) root.classList.remove(cls);
    });
    
    // Add new theme class
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
