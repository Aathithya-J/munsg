// Simple authentication helper without Firebase Auth
import { useState, useEffect } from 'react';

// Check if running on the client side
const isBrowser = typeof window !== 'undefined';

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

// Session storage key
const AUTH_TOKEN_KEY = 'adminAuthToken';
const AUTH_USER_KEY = 'adminUser';

export const logout = () => {
  localStorage.removeItem('adminUser');
};

export const isAuthenticated = () => {
  if (!isBrowser) return false;
  
  return !!localStorage.getItem('adminUser');
};

export const getUser = () => {
  if (!isBrowser) return null;
  
  const userStr = localStorage.getItem('adminUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBrowser) return;

    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsLoggedIn(auth);
      setUser(auth ? getUser() : null);
      setLoading(false);
    };

    checkAuth();

    const handleStorage = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { isLoggedIn, user, loading };
};