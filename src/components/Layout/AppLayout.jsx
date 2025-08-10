import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import StatusBar from './StatusBar';
import { FaBars, FaTimes } from 'react-icons/fa';

// Custom hook for responsive breakpoint detection
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = () => setMatches(media.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export default function AppLayout({ children }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { currentUser } = useAuth();
  const location = useLocation();

  // Handle responsive sidebar open/close
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top header with user info */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} />
        
        {/* Main content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <div className="p-4 md:p-6">
            {/* Status bar */}
            <StatusBar user={currentUser} />
            
            {/* Page content */}
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile sidebar toggle button */}
      {isMobile && (
        <button 
          className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      )}
    </div>
  );
}