import GroupList from '../components/Groups/GroupList';
import { useAuth } from '../contexts/AuthContext';
import { initializeGroup } from '../firebase';
import { majors, generalGroups, generalCourses } from '../data/majors';
import { useEffect, useState } from 'react';
import { FaComments, FaUsers } from 'react-icons/fa';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import DebugEnv from '../components/DebugEnv'; // Add this import

export default function Home() {
  const { currentUser } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Get total user count
  useEffect(() => {
    const getTotalUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getCountFromServer(usersRef);
        setTotalUsers(snapshot.data().count);
      } catch (error) {
        console.error('Error getting total user count:', error);
        setTotalUsers(0);
      }
    };
    
    if (currentUser) {
      getTotalUsers();
    }
  }, [currentUser]);
  
  // Initialize groups when the Home page loads
  useEffect(() => {
    const initializeGroups = async () => {
      // ... existing code ...
    };
    
    if (currentUser) {
      initializeGroups();
    }
  }, [currentUser]);

  return (
    <div className="w-full">
      {/* Add the debug component at the top */}
      <DebugEnv />
      
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <FaComments className="text-primary mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Chat Rooms</h2>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-primary">
          <p className="text-gray-700">
            Welcome, <span className="font-medium">{currentUser?.displayName || 'User'}</span>! 
            Join conversations with your classmates across different courses and topics.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
          <FaUsers className="text-gray-400" />
          <span>Registered users: {totalUsers}</span>
        </div>
        
        <GroupList />
      </div>
    </div>
  );
}