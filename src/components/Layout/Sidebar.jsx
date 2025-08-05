import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useGroups from '../../hooks/useGroups';
import { FaClock, FaUser } from 'react-icons/fa';
import { 
  FaHome, 
  FaUsers, 
  FaBook, 
  FaGraduationCap, 
  FaChevronDown, 
  FaChevronRight,
  FaSearch
} from 'react-icons/fa';

export default function Sidebar({ open }) {
  const { currentUser } = useAuth();
  const { allGroups, loading } = useGroups(currentUser?.major);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [expanded, setExpanded] = useState({
    major: true,
    general: false,
    compulsory: false,
    society: false,
    managerial: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reset search when sidebar closes on mobile
  useEffect(() => {
    if (!open) setSearchTerm('');
  }, [open]);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Helper to check if a route is active
  const isActive = (path) => location.pathname === path;
  
  // Filter groups based on search term
  const filterGroups = (groups) => {
    if (!searchTerm.trim()) return groups;
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpanded({...expanded, [section]: !expanded[section]});
  };
  
  // Format date and time in simple format
  const formatDateTime = () => {
    const now = currentTime;
    return now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Compulsory course groups
  const compulsoryCourses = [
    "computer-skills",
    "science-and-life",
    "english-i-&-ii",
    "arabic-language",
    "islamic-culture",
    "uae-studies",
    "innovation-and-entrepreneurship",
    "scientific-research-methodology"
  ];
  
  // Society & Civilization course groups
  const societyCivilizationCourses = [
    "arabs-&-muslims-contributions",
    "physical-education-&-health",
    "introduction-to-psychology",
    "arab-society",
    "environmental-awareness",
    "ethical-awareness"
  ];
  
  // Managerial Skills course groups
  const managerialSkillsCourses = [
    "law-and-society",
    "thinking-skills",
    "self-assessment",
    "time-management",
    "leadership-and-teamwork"
  ];

  return (
    <aside 
      className={`bg-white border-r border-gray-200 w-64 fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30 md:translate-x-0 pt-16 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        {/* Status bar in sidebar - only visible on mobile when sidebar is open */}
        <div className="md:hidden px-4 py-3 border-b border-gray-200 text-xs text-gray-500">
          <div className="flex items-center mb-2">
            <FaClock className="text-gray-400 mr-1.5" />
            <span>Current Time: {formatDateTime()}</span>
          </div>
          <div className="flex items-center">
            <FaUser className="text-gray-400 mr-1.5" />
            <span>Current User's Login: {currentUser?.displayName || currentUser?.email}</span>
          </div>
        </div>
        
        {/* Scrollable sidebar content */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {/* Home navigation */}
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              isActive('/') 
                ? 'bg-primary text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaHome size={16} />
            <span>Home</span>
          </button>
          
          {loading ? (
            <div className="py-4 text-center text-gray-500">Loading groups...</div>
          ) : (
            <>
              {/* Your Major Section */}
              <div className="mt-4">
                <button 
                  onClick={() => toggleSection('major')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <FaGraduationCap size={16} />
                    <span>Your Major</span>
                  </div>
                  {expanded.major ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                </button>
                
                {expanded.major && (
                  <div className="pl-4 mt-1 space-y-1">
                    {filterGroups(allGroups.majorSpecific
                      .filter(group => group.name === currentUser?.major))
                      .map(group => (
                        <button
                          key={group.id}
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-left ${
                            isActive(`/groups/${group.id}`)
                              ? 'bg-primary bg-opacity-10 text-primary font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate text-left">{group.name}</span>
                          <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 ml-2">
                            Can Write
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              
              {/* General Section */}
              <div className="mt-2">
                <button 
                  onClick={() => toggleSection('general')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <FaUsers size={16} />
                    <span>General</span>
                  </div>
                  {expanded.general ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                </button>
                
                {expanded.general && (
                  <div className="pl-4 mt-1 space-y-1">
                    {filterGroups(allGroups.general).map(group => (
                      <button
                        key={group.id}
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-left ${
                          isActive(`/groups/${group.id}`)
                            ? 'bg-primary bg-opacity-10 text-primary font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate text-left">{group.name}</span>
                        <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 ml-2">
                          Can Write
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Shared Courses Section */}
              <div className="mt-6 mb-2 px-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Shared Courses
                </h3>
              </div>
              
              {/* Compulsory Courses */}
              <div>
                <button 
                  onClick={() => toggleSection('compulsory')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <FaBook size={16} />
                    <span>Compulsory GUE Courses</span>
                  </div>
                  {expanded.compulsory ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                </button>
                
                {expanded.compulsory && (
                  <div className="pl-4 mt-1 space-y-1">
                    {filterGroups(allGroups.courses
                      .filter(group => compulsoryCourses.includes(group.id)))
                      .map(group => (
                        <button
                          key={group.id}
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-left ${
                            isActive(`/groups/${group.id}`)
                              ? 'bg-primary bg-opacity-10 text-primary font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate text-left">{group.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              
              {/* Society & Civilization Electives */}
              <div className="mt-1">
                <button 
                  onClick={() => toggleSection('society')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <FaBook size={16} />
                    <span>Society & Civilization</span>
                  </div>
                  {expanded.society ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                </button>
                
                {expanded.society && (
                  <div className="pl-4 mt-1 space-y-1">
                    {filterGroups(allGroups.courses
                      .filter(group => societyCivilizationCourses.includes(group.id)))
                      .map(group => (
                        <button
                          key={group.id}
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-left ${
                            isActive(`/groups/${group.id}`)
                              ? 'bg-primary bg-opacity-10 text-primary font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate text-left">{group.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              
              {/* Managerial Skills Electives */}
              <div className="mt-1">
                <button 
                  onClick={() => toggleSection('managerial')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <FaBook size={16} />
                    <span>Managerial Skills</span>
                  </div>
                  {expanded.managerial ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                </button>
                
                {expanded.managerial && (
                  <div className="pl-4 mt-1 space-y-1">
                    {filterGroups(allGroups.courses
                      .filter(group => managerialSkillsCourses.includes(group.id)))
                      .map(group => (
                        <button
                          key={group.id}
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className={`flex items-center w-full px-3 py-2 text-sm rounded-md text-left ${
                            isActive(`/groups/${group.id}`)
                              ? 'bg-primary bg-opacity-10 text-primary font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate text-left">{group.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}