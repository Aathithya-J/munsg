// Theme utility to handle dark mode across the entire app
export const THEME_KEY = 'theme';

// Check if we're on the client side
const isBrowser = typeof window !== 'undefined';

// Initialize theme based on local storage or system preference
export const initializeTheme = (): boolean => {
  if (!isBrowser) return false;
  
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    setDarkMode(true);
    return true;
  }
  
  setDarkMode(false);
  return false;
};

// Set dark mode on or off
export const setDarkMode = (isDark: boolean): void => {
  if (!isBrowser) return;
  
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    localStorage.setItem(THEME_KEY, 'dark');
  } else {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    localStorage.setItem(THEME_KEY, 'light');
  }
};

// Toggle dark mode
export const toggleDarkMode = (currentState: boolean): boolean => {
  const newState = !currentState;
  setDarkMode(newState);
  return newState;
};

// Get the current theme preference
export const getDarkMode = (): boolean => {
  if (!isBrowser) return false;
  return document.documentElement.classList.contains('dark-mode');
}; 