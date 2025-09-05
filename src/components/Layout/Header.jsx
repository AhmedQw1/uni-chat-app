import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBars, FaBell, FaGraduationCap, FaUsers, FaBook } from 'react-icons/fa';
import useGroups from '../../hooks/useGroups';

export default function Header({ toggleSidebar }) {
  const { currentUser, logout, totalUnread, unreadCounts } = useAuth();
  const { allGroups } = useGroups(currentUser?.major);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Get groups with unread messages
  const getGroupsWithUnread = () => {
    const allGroupsArray = [
      ...allGroups.majorSpecific,
      ...allGroups.general, 
      ...allGroups.courses
    ];
    
    return allGroupsArray
      .filter(group => unreadCounts[group.id] > 0)
      .map(group => ({
        ...group,
        unreadCount: unreadCounts[group.id]
      }))
      .sort((a, b) => b.unreadCount - a.unreadCount);
  };

  // Navigate to group and close notification dropdown
  const handleGroupClick = (groupId) => {
    setNotificationOpen(false);
    navigate(`/groups/${groupId}`);
  };

  // Get icon for group type
  const getGroupIcon = (type) => {
    switch (type) {
      case 'major':
        return <FaGraduationCap size={14} className="text-primary" />;
      case 'general':
        return <FaUsers size={14} className="text-primary" />;
      case 'course':
      default:
        return <FaBook size={14} className="text-primary" />;
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
            className="cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h1 className="text-xl font-bold">UniChat</h1>
            <p className="text-xs text-blue-100 hidden sm:block">University Communication Platform</p>
          </div>
        </div>
        
        {currentUser && (
          <div className="flex items-center space-x-4">
            {/* Notification bell with dropdown */}
            <div className="relative">
              <button 
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full relative"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <FaBell size={18} />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-gray-800 font-semibold">Notifications</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {getGroupsWithUnread().length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <FaBell className="mx-auto mb-2 text-gray-400" size={24} />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {getGroupsWithUnread().map((group) => (
                          <button
                            key={group.id}
                            onClick={() => handleGroupClick(group.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getGroupIcon(group.type)}
                                <div>
                                  <p className="text-gray-800 font-medium text-sm truncate max-w-48">
                                    {group.name}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {group.unreadCount} new message{group.unreadCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {group.unreadCount}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {getGroupsWithUnread().length > 0 && (
                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="w-full text-center text-primary text-sm font-medium"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
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
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
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
      
      {/* Click outside to close dropdowns */}
      {(menuOpen || notificationOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setMenuOpen(false);
            setNotificationOpen(false);
          }}
        />
      )}
    </header>
  );
}
