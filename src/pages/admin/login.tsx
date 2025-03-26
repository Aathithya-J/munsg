import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Lock, Moon, Sun } from 'lucide-react';
import { initializeTheme, toggleDarkMode } from '../../lib/theme';
import { signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const GOOGLE_AUTHORIZED_EMAIL = process.env.NEXT_PUBLIC_GOOGLE_AUTHORIZED_EMAIL;

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize theme from local storage
    const isDark = initializeTheme();
    setDarkMode(isDark);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email === GOOGLE_AUTHORIZED_EMAIL) {
        localStorage.setItem('adminUser', JSON.stringify({ email: user.email }));
        router.push('/admin/dashboard');
      } else {
        setError('Unauthorized email address');
      }
    } catch (err) {
      setError('Failed to sign in with Google');
    }

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
            <p className="text-gray-500 mt-2">Sign in with your Google account to access the dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Signing in...' : 'Sign In with Google'}
          </button>

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