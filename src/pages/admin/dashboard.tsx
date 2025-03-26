import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
// Removed AuthGuard import
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import { Calendar, Globe, Users, Award, TrendingUp, PieChart, Clock } from 'lucide-react';

interface StatsType {
  totalConferences: number;
  activeConferences: number;
  totalDelegates: number;
  recentActivityCount: number;
}

interface Conference {
  id: string;
  name: string;
  dates: string;
  location: string;
  status: string;
  delegates: number;
  createdAt?: any;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if adminToken exists in localStorage
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login'); // Redirect to login page if not authenticated
      } else {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const [stats, setStats] = useState<StatsType>({
    totalConferences: 0,
    activeConferences: 0,
    totalDelegates: 0,
    recentActivityCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentConferences, setRecentConferences] = useState<Conference[]>([]);
  const [upcomingConferences, setUpcomingConferences] = useState<Conference[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get conferences
      const conferencesRef = collection(db, 'conferences');
      const conferencesSnapshot = await getDocs(query(conferencesRef, orderBy('name')));
      
      const conferenceData = conferencesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conference[];
      
      // Display all conferences instead of recent ones
      setRecentConferences(conferenceData);

      // Filter upcoming conferences (e.g., based on date logic)
      const upcomingConferences = conferenceData.filter(conf => {
        const today = new Date();
        if (!conf.dates || typeof conf.dates !== 'string') {
          return false; // Skip if dates are missing or not a string
        }

        try {
          const conferenceDate = new Date(conf.dates.split(',')[0].trim()); // Ensure proper trimming
          return conferenceDate >= today; // Include only future or current dates
        } catch (error) {
          console.error(`Error parsing date for conference ${conf.id}:`, error);
          return false; // Skip invalid dates
        }
      });

      setUpcomingConferences(upcomingConferences); // New state for upcoming conferences

      // Calculate stats
      const activeConferences = conferenceData.filter(
        (conf) => conf.status === 'Registration Open'
      ).length;
      
      // Sum all delegates from all conferences
      const totalDelegatesCount = conferenceData.reduce(
        (sum, conf) => sum + (parseInt(String(conf.delegates)) || 0), 
        0
      );
      
      setStats({
        totalConferences: conferenceData.length,
        activeConferences,
        totalDelegates: totalDelegatesCount,
        recentActivityCount: 0 // Removed placeholder for recent activity
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Ensure content is only rendered after authentication */}
      {isAuthenticated && (
        <>
          <Head>
            <title>Admin Dashboard | Singapore MUN</title>
          </Head>
          <AdminLayout>
            <div className="admin-header">
              <div>
                <h1 className="admin-title">Dashboard</h1>
                <p className="text-gray-500">Welcome back, {user?.name || 'Admin'}!</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loader">
                  <div className="spinner"></div>
                  <p className="mt-4 text-gray-500">Loading dashboard data...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="dashboard-stats">
                  {/* Total Conferences */}
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="stat-title">Total Conferences</h3>
                      <p className="stat-value">{stats.totalConferences}</p>
                      <div className="stat-change positive">
                      <p className="text-gray-500 text-sm">Recorded On Our Site</p>
                      </div>
                    </div>
                  </div>

                  {/* Active Conferences */}
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="stat-title">Active Conferences</h3>
                      <p className="stat-value">{stats.activeConferences}</p>
                      <p className="text-gray-500 text-sm">Registration open</p>
                    </div>
                  </div>

                  {/* Total Delegates */}
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="stat-title">Total Delegates</h3>
                      <p className="stat-value">{stats.totalDelegates.toLocaleString()}</p>
                      <p className="text-gray-500 text-sm">Across all conferences</p>
                    </div>
                  </div>

                  {/* Upcoming Conferences */}
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="stat-title">Upcoming Conferences</h3>
                      <p className="stat-value">{upcomingConferences.length}</p>
                      <p className="text-gray-500 text-sm">Scheduled to start soon</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Conferences */}
                  <div className="dashboard-section lg:col-span-2">
                    <div className="dashboard-section-header">
                      <h2 className="section-title">Recent Conferences</h2>
                      <a href="/admin/conferences" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</a>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Conference Name</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Delegates</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentConferences.length > 0 ? (
                            recentConferences.map((conference) => (
                              <tr key={conference.id}>
                                <td className="font-medium">{conference.name}</td>
                                <td>{conference.dates}</td>
                                <td>
                                  <span className={`status-pill ${conference.status === 'Registration Open' ? 'active' : conference.status === 'Coming Soon' ? 'pending' : 'inactive'}`}>
                                    {conference.status}
                                  </span>
                                </td>
                                <td>{conference.delegates?.toLocaleString() || '0'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center py-4 text-gray-500">
                                No conferences found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="dashboard-section">
                    <div className="dashboard-section-header">
                      <h2 className="section-title">Quick Actions</h2>
                    </div>
                    <div className="space-y-3">
                      <a 
                        href="/admin/conferences/new" 
                        className="action-button primary w-full justify-center"
                      >
                        <Calendar size={18} />
                        <span>Add New Conference</span>
                      </a>
                      <a 
                        href="/admin/conferences" 
                        className="action-button secondary w-full justify-center"
                      >
                        <PieChart size={18} />
                        <span>Manage Conferences</span>
                      </a>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">System Status</h3>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Firebase Connection</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Last Sync</span>
                          <span className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </AdminLayout>
        </>
      )}
    </>
  );
};

export default AdminDashboard;