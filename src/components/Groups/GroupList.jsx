import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useGroups from '../../hooks/useGroups';
import { FaUsers, FaGraduationCap, FaBook, FaChevronRight } from 'react-icons/fa';

export default function GroupList() {
  const { currentUser } = useAuth();
  const { allGroups, loading } = useGroups(currentUser?.major);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  
  // Group counters
  const [counters, setCounters] = useState({
    major: 0,
    general: 0,
    courses: 0
  });
  
  // Update counters when groups load
  useEffect(() => {
    if (!loading) {
      setCounters({
        major: allGroups.majorSpecific.length,
        general: allGroups.general.length,
        courses: allGroups.courses.length
      });
    }
  }, [allGroups, loading]);
  
  // Group navigation
  const navigateToGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };
  
  // Filter groups based on active tab
  const filteredGroups = () => {
    switch (activeTab) {
      case 'major':
        return allGroups.majorSpecific;
      case 'general':
        return allGroups.general;
      case 'courses':
        return allGroups.courses;
      default:
        // For 'all' tab, combine and limit groups
        return [
          ...allGroups.majorSpecific,
          ...allGroups.general.slice(0, 3),
          ...allGroups.courses.slice(0, 3)
        ];
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'major' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('major')}
        >
          Major ({counters.major})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'general' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('general')}
        >
          General ({counters.general})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'courses' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('courses')}
        >
          Courses ({counters.courses})
        </button>
      </div>
      
      {/* Group list */}
      {loading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading chat groups...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups().map(group => (
            <div 
              key={group.id}
              className="bg-white border border-gray-200 rounded-md overflow-hidden hover:border-primary hover:shadow-sm transition-colors cursor-pointer"
              onClick={() => navigateToGroup(group.id)}
            >
              <div className="flex items-center p-3 border-b border-gray-100">
                {group.type === 'major' ? (
                  <FaGraduationCap className="text-primary mr-2" size={16} />
                ) : group.type === 'general' ? (
                  <FaUsers className="text-primary mr-2" size={16} />
                ) : (
                  <FaBook className="text-primary mr-2" size={16} />
                )}
                <div className="flex-1 truncate font-medium text-gray-700">
                  {group.name}
                </div>
                <FaChevronRight className="text-gray-400" size={14} />
              </div>
              <div className="px-3 py-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Type: {group.type}</span>
                  <span>Members: {group.members}</span>
                </div>
                <div className="mt-1">
                  Status: <span className="text-green-600">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Show more link if on 'all' tab */}
      {activeTab === 'all' && (
        <div className="text-center mt-6">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
            onClick={() => setActiveTab('courses')}
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
}