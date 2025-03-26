import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout, isAuthenticated } from '../lib/auth';
import { 
  Home, 
  Calendar, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { initializeTheme, toggleDarkMode } from '../lib/theme';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize theme from local storage
    const isDark = initializeTheme();
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login'); // Redirect to login if not authenticated
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleDarkMode = () => {
    const newDarkModeState = toggleDarkMode(darkMode);
    setDarkMode(newDarkModeState);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      href: '/admin/dashboard',
    },
    {
      title: 'Conferences',
      icon: <Calendar size={20} />,
      href: '/admin/conferences',
    },
    // Removed the "Settings" menu item
  ];

  return (
    <div className="admin-layout">
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-md text-gray-700 dark:bg-gray-800 dark:text-gray-200"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <h1>Singapore MUN</h1>
        </div>

        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => (
            <Link 
              key={item.title} 
              href={item.href}
              className={`admin-sidebar-item ${router.pathname === item.href || router.pathname.startsWith(`${item.href}/`) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-6 pb-6 space-y-3">
          {/* Removed the light mode button */}
          <button 
            onClick={handleLogout}
            className="w-full py-2 px-4 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-md text-white"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content" onClick={() => setSidebarOpen(false)}>
        {children}
      </main>
    </div>
  );
}