import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ChatRoom from '../components/Chat/ChatRoom';
import { FaArrowLeft, FaUsers, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function GroupChat() {
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Format the group name for display
    const formattedName = groupId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    setGroupName(formattedName);
  }, [groupId]);

  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden bg-white shadow">
      {/* Chat header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaArrowLeft size={16} />
          </button>
          
          <div className="flex items-center">
            <div className="bg-primary bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center mr-2">
              <FaUsers className="text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-gray-800">{groupName}</h2>
              <p className="text-xs text-gray-500">Group Chat</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2 rounded-full ${showInfo ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <FaInfoCircle size={18} />
        </button>
      </div>
      
      {/* Chat container with optional info sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main chat area */}
        <div 
          ref={chatContainerRef}
          className={`flex-1 flex flex-col transition-all duration-300 ${showInfo ? 'md:mr-64' : ''}`}
        >
          <ChatRoom containerRef={chatContainerRef} />
        </div>
        
        {/* Info sidebar - conditionally shown */}
        {showInfo && (
          <div className="w-64 border-l border-gray-200 bg-gray-50 p-4 absolute right-0 top-0 bottom-0 md:relative shadow-lg md:shadow-none z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Group Info</h3>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-gray-700 md:hidden"
              >
                <FaArrowLeft size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Group Name</h4>
                <p className="text-gray-800">{groupName}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="text-gray-800 text-sm">
                  This is a group chat for {groupName} where you can discuss topics, 
                  share resources, and connect with others.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Members</h4>
                <p className="text-gray-800">Active members will appear here</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <h4 className="text-sm font-medium text-blue-700">Guidelines</h4>
                <ul className="text-xs text-blue-600 mt-1 list-disc list-inside">
                  <li>Be respectful to all members</li>
                  <li>Stay on topic and relevant to the group</li>
                  <li>Do not share personal information</li>
                  <li>Follow university code of conduct</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}