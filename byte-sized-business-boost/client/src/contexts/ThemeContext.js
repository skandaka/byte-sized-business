/**
 * Theme Context
 * Manages dark mode state and persists preference to localStorage
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

/**
 * Custom hook to use theme context
 * @returns {Object} Theme context value
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Theme Provider Component
 * Manages dark/light mode toggle
 */
export function ThemeProvider({ children }) {
  // Initialize from localStorage or default to light mode
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);

  // Apply theme class to body element
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  /**
   * Toggle between dark and light mode
   */
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  /**
   * Set specific theme mode
   * @param {boolean} isDark - True for dark mode, false for light mode
   */
  const setTheme = (isDark) => {
    setDarkMode(isDark);
  };

  const value = {
    darkMode,
    toggleDarkMode,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeContext;
