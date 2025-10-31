import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setDarkMode(shouldUseDark);
    applyTheme(shouldUseDark);
    setLoading(false);
  }, []);

  const applyTheme = (isDark) => {
    console.log('ThemeContext: Applying theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    console.log('ThemeContext: Document classes after apply:', document.documentElement.classList.toString());
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    console.log('ThemeContext: Toggling theme from', darkMode, 'to', newDarkMode);
    setDarkMode(newDarkMode);
    applyTheme(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode activated!`);
  };

  const setTheme = (theme) => {
    const isDark = theme === 'dark';
    setDarkMode(isDark);
    applyTheme(isDark);
    localStorage.setItem('theme', theme);
  };

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleTheme,
      setTheme,
      loading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
