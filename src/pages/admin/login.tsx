import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Lock, Moon, Sun } from 'lucide-react';
import { initializeTheme, toggleDarkMode } from '../../lib/theme';
import { checkPassword } from '../../lib/auth';

const ADMIN = process.env.NEXT_PUBLIC_ADMIN;

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize theme from local storage
    const isDark = initializeTheme();
    setDarkMode(isDark);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Compare input value with environment variable
    if (!checkPassword(formData.email)) {
      setError('Invalid admin value');
      setLoading(false);
      return;
    }

    // Generate a simple token for authentication
    const token = btoa(formData.email);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify({ email: formData.email }));
    router.push('/admin/dashboard');

    setLoading(false);
  };

  const handleToggleDarkMode = () => {
    const newDarkModeState = toggleDarkMode(darkMode);
    setDarkMode(newDarkModeState);
  };

  return (
    <>
      <Head>
        <title>Admin Login | Singapore MUN</title>
        <meta name="description" content="Admin portal for Singapore Model United Nations" />
      </Head>
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="text-center mb-8">
            <div className="login-icon-container">
              <div className="login-icon">
                <Lock size={24} />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-gray-500 mt-2">Enter your credentials to access the dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Value
              </label>
              <input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="value"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-8 flex justify-between items-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Back to Homepage
            </Link>

            <button
              onClick={handleToggleDarkMode}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center gap-1.5"
            >
              {darkMode ? (
                <>
                  <Sun size={16} /> Light
                </>
              ) : (
                <>
                  <Moon size={16} /> Dark
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}