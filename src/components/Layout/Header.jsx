import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaBell } from 'react-icons/fa';

export default function Header({ toggleSidebar }) {
  const { currentUser, logout, totalUnread } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  return (
    <header className="bg-primary text-white py-4 px-4 md:px-6 shadow-md fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 text-white"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FaBars size={20} />
          </button>
          
          <div 
            className="cursor-pointer flex items-center"
            onClick={() => navigate('/')}
          >
            <h1 className="text-xl font-bold">Uni Chat</h1>
          </div>
        </div>
        
        {currentUser && (
          <div className="flex items-center space-x-4">
            {/* Notification bell with badge */}
            <div className="relative">
              <button className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full">
                <FaBell size={18} />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </button>
            </div>
            
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center mr-2">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold">
                      {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <span className="text-sm hidden md:block">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}