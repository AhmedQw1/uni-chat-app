import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaUsers, FaBook, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

export default function GroupItem({ group }) {
  const navigate = useNavigate();
  const { id, name, type, members } = group;
  const { unreadCounts } = useAuth();
  
  // Get unread count for this group
  const unreadCount = unreadCounts[id] || 0;

  // Get the appropriate icon based on group type
  const getIcon = () => {
    switch (type) {
      case 'major':
        return <FaGraduationCap className="text-primary mr-2" size={16} />;
      case 'general':
        return <FaUsers className="text-primary mr-2" size={16} />;
      case 'course':
      default:
        return <FaBook className="text-primary mr-2" size={16} />;
    }
  };

  // Navigate to the group chat
  const handleClick = () => {
    navigate(`/groups/${id}`);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-md overflow-hidden hover:border-primary hover:shadow-sm transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center p-3 border-b border-gray-100">
        {getIcon()}
        <div className="flex-1 truncate font-medium text-gray-700">
          {name}
        </div>
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <div className="mr-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
            {unreadCount}
          </div>
        )}
        
        <FaChevronRight className="text-gray-400" size={14} />
      </div>
      <div className="px-3 py-2 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Type: {type}</span>
          <span>Members: {members}</span>
        </div>
        <div className="mt-1">
          Status: <span className="text-green-600">Active</span>
        </div>
      </div>
    </div>
  );
}