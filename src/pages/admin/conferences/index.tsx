import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import AdminLayout from '../../../components/AdminLayout';
import { Edit, Trash2, Plus } from 'lucide-react';

interface Conference {
  id: string;
  name: string;
  location: string;
  date: string;
  status: string;
  delegates: string;
  imageUrl: string;
}

export default function ConferencesManagement() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const conferencesRef = collection(db, 'conferences');
      const snapshot = await getDocs(conferencesRef);
      
      const conferencesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conference[];
      
      setConferences(conferencesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conferences:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this conference?')) {
      try {
        await deleteDoc(doc(db, 'conferences', id));
        setConferences(conferences.filter(conf => conf.id !== id));
      } catch (error) {
        console.error('Error deleting conference:', error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Manage Conferences | Admin</title>
      </Head>
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Conferences</h1>
          <Link 
            href="/admin/conferences/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delegates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conferences.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No conferences found. Add your first conference!
                    </td>
                  </tr>
                ) : (
                  conferences.map((conference) => (
                    <tr key={conference.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{conference.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{conference.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{conference.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          conference.status === 'Registration Open' 
                            ? 'bg-green-100 text-green-800' 
                            : conference.status === 'Closed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {conference.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {conference.delegates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(conference.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5 inline-block" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>
    </>
  );
}