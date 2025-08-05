import { useState, useEffect } from 'react';
import { FaClock, FaUser } from 'react-icons/fa';

export default function StatusBar({ user }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format date and time in YYYY-MM-DD HH:MM:SS format
  const formatDateTime = () => {
    const now = currentTime;
    
    // Format as YYYY-MM-DD HH:MM:SS
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 mb-4 text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between sm:items-center">
      <div className="flex items-center mb-2 sm:mb-0">
        <FaClock className="text-gray-400 mr-1.5" />
        <span>Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {formatDateTime()}</span>
      </div>
      <div className="flex items-center">
        <FaUser className="text-gray-400 mr-1.5" />
        <span>Current User's Login: {user ? user.displayName || user.email : 'Not Logged In'}</span>
      </div>
    </div>
  );
}