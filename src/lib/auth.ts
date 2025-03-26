import { useState, useEffect } from 'react';

const isBrowser = typeof window !== 'undefined';

export const logout = () => {
  localStorage.removeItem('adminUser');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('adminToken');
  return !!token;
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
    // Only run on client side
    if (!isBrowser) return;
    
    const checkAuth = () => {
      const auth = isAuthenticated();
      setIsLoggedIn(auth);
      setUser(auth ? getUser() : null);
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for storage events (for multi-tab logout)
    const handleStorage = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { isLoggedIn, user, loading };
};