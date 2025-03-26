import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState, FormEvent } from "react";
import Head from "next/head";
import { Moon, Sun, Globe, Users, Building2, Award, Filter, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { initializeTheme, toggleDarkMode } from '../lib/theme';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Conference {
  id: string;
  name: string;
  location: string;
  dates: string;
  delegates: number;
  status: string;
  website?: string;
  description?: string;
  imageUrl?: string;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [filteredConferences, setFilteredConferences] = useState<Conference[]>([]);
  const [stats, setStats] = useState({
    totalConferences: 0,
    openRegistrations: 0,
    totalDelegates: 0,
    venues: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize theme from local storage or system preference
    const isDark = initializeTheme();
    setDarkMode(isDark);

    // Fetch conferences
    fetchConferences();
  }, []);

  useEffect(() => {
    // Filter conferences when statusFilter changes
    if (statusFilter === 'all') {
      setFilteredConferences(conferences);
    } else {
      setFilteredConferences(conferences.filter(conf => conf.status === statusFilter));
    }
  }, [statusFilter, conferences]);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      const conferencesRef = collection(db, 'conferences');
      const conferencesSnapshot = await getDocs(query(conferencesRef, orderBy('name')));
      
      const conferencesData = conferencesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dates: doc.data().date || 'TBA', // Default to "TBA" if dates field is empty
      })) as Conference[];
      
      setConferences(conferencesData);
      setFilteredConferences(conferencesData);
      
      // Calculate stats
      const openRegs = conferencesData.filter(conf => conf.status === 'Registration Open').length;
      const totalDelegates = conferencesData.reduce((sum, conf) => sum + (parseInt(String(conf.delegates)) || 0), 0);
      const uniqueVenues = new Set(conferencesData.map(conf => conf.location)).size;
      
      setStats({
        totalConferences: conferencesData.length,
        openRegistrations: openRegs,
        totalDelegates,
        venues: uniqueVenues
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conferences:', error);
      setLoading(false);
    }
  };

  const handleToggleDarkMode = () => {
    const newDarkModeState = toggleDarkMode(darkMode);
    setDarkMode(newDarkModeState);
  };

  const toggleContributeForm = () => {
    setShowContributeForm(!showContributeForm);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormSuccess("Thank you for your submission!");
        e.currentTarget.reset();
        setTimeout(() => {
          setFormSuccess("");
        }, 5000);
      } else {
        setFormError("Something went wrong. Please try again.");
        setTimeout(() => {
          setFormError("");
        }, 5000);
      }
    } catch (error) {
      setFormError("Something went wrong. Please try again.");
      setTimeout(() => {
        setFormError("");
      }, 5000);
    }
  };
  
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <Head>
        <title>Singapore MUN Conferences</title>
        <meta name="description" content="Discover Model United Nations conferences across Singapore" />
      </Head>
      
      {/* External CSS */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        crossOrigin="anonymous"
      />
      
      {/* Scripts */}
      <Script 
        id="va-script"
        dangerouslySetInnerHTML={{
          __html: `
            window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
          `
        }}
      />
      <Script id="vercel-insights" src="/_vercel/insights/script.js" />
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div>
              <h1>Singapore MUN Conferences</h1>
              <p>Discover Model United Nations conferences across Singapore</p>
            </div>
            <div className="header-buttons">
              <button 
                onClick={handleToggleDarkMode}
                className="icon-button"
              >
                {darkMode ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
              </button>
              <button 
                onClick={toggleContributeForm}
                className="icon-button"
              >
                <i className="fas fa-plus"></i>
                <span>Contribute</span>
              </button>
              <Link 
                href="/admin/login" 
                className="icon-button"
              >
                <i className="fas fa-user-shield"></i>
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Globe size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-title">Total Conferences</p>
              <p className="stat-value">{stats.totalConferences}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-title">Total Delegates</p>
              <p className="stat-value">{stats.totalDelegates.toLocaleString()}+</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-title">Venues</p>
              <p className="stat-value">{stats.venues} Locations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-title">Open Registrations</p>
              <p className="stat-value">{stats.openRegistrations}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-container">
            <div className="filter-label">
              <Filter size={18} />
              <span>Filter by:</span>
            </div>
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Registration Open">Registration Open</option>
              <option value="Coming Soon">Coming Soon</option>
              <option value="Registration Closed">Registration Closed</option>
            </select>
          </div>
        </div>

        {/* Contribution Form */}
        {showContributeForm && (
          <div className="contribute-form">
            <h2>Contribute Conference Information</h2>
            
            {formError && (
              <div className={`message error ${!formError ? 'hidden' : ''}`}>
                {formError}
              </div>
            )}
            
            {formSuccess && (
              <div className={`message success ${!formSuccess ? 'hidden' : ''}`}>
                {formSuccess}
              </div>
            )}
            
            <form id="conferenceForm" onSubmit={handleSubmit} method="POST">
              <input type="hidden" name="access_key" value="8f6c3f84-cac9-414a-aef7-26c8a2508d91" />
              <div className="form-grid">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Conference Name" 
                  required 
                />
                <input 
                  type="text" 
                  name="location" 
                  placeholder="Location" 
                  required 
                />
                <input 
                  type="text" 
                  name="date" 
                  placeholder="Date (e.g., June 5-8, 2024)" 
                  required 
                />
                <input 
                  type="text" 
                  name="delegates" 
                  placeholder="Expected Delegates (e.g., 1,000+)" 
                  required 
                />
                <input 
                  type="url" 
                  name="website" 
                  placeholder="Conference Website URL" 
                  required 
                />
                <select 
                  name="status" 
                  required
                >
                  <option value="Registration Open">Registration Open</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Registration Closed">Registration Closed</option>
                </select>
                <textarea 
                  name="description" 
                  placeholder="Description" 
                  required 
                  className="span-2"
                  rows={4}
                ></textarea>
                <button 
                  type="submit" 
                  className="submit-button span-2"
                >
                  Submit Conference
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center my-12">
            <div className="loader">
              <div className="spinner"></div>
              <p className="mt-4 text-gray-500">Loading conferences...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredConferences.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No conferences found</h3>
            <p className="text-gray-500">
              {statusFilter === 'all' 
                ? 'There are no conferences available at the moment.' 
                : `There are no conferences with status "${statusFilter}" at the moment.`}
            </p>
            {statusFilter !== 'all' && (
              <button 
                onClick={() => setStatusFilter('all')}
                className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
              >
                Show all conferences
              </button>
            )}
          </div>
        )}

        {/* Conferences Grid */}
        <div className="conferences-grid">
          {!loading && filteredConferences.map((conference) => (
            <div className="conference-card" key={conference.id}>
              <div className="conference-image">
                <Image 
                  src={conference.imageUrl || "https://via.placeholder.com/300"} // Use inputted imageUrl or fallback
                  alt={conference.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="conference-content">
                <div className="conference-header">
                  <div>
                    <h2>{conference.name}</h2>
                    <p>{conference.description || 'A Model United Nations conference in Singapore.'}</p>
                  </div>
                  <span className={`status-badge ${
                    conference.status === 'Registration Open' 
                      ? 'registration-open' 
                      : conference.status === 'Coming Soon' 
                        ? 'coming-soon' 
                        : 'registration-closed'
                  }`}>
                    {conference.status}
                  </span>
                </div>
                <div className="conference-details">
                  <div className="detail">
                    <Calendar size={16} />
                    <span>{conference.dates}</span> {/* Pull dates from Firebase, default to "TBA" if empty */}
                  </div>
                  <div className="detail">
                    <MapPin size={16} />
                    <span>{conference.location}</span>
                  </div>
                  <div className="detail">
                    <Users size={16} />
                    <span>{conference.delegates?.toLocaleString() || '0'} Delegates</span>
                  </div>
                </div>
                {conference.website && (
                  <a 
                    href={conference.website} 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="conference-link"
                  >
                    Visit Conference Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
