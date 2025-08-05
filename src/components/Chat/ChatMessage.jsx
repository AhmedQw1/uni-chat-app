import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { FaEllipsisH, FaReply, FaCopy, FaDownload, FaPlay, FaPause, FaTrash } from 'react-icons/fa';
import { getFirebaseFileUrl } from '../../services/FirebaseStorageService';

export default function ChatMessage({ message, showAvatar = true, onDeleteMessage }) {
  const { currentUser } = useAuth();
  const { id, text, uid, displayName, photoURL, createdAt, major, pending, file } = message;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Determine if the message is from the current user
  const isCurrentUser = currentUser?.uid === uid;
  
  // Format timestamp - simple 12-hour format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp.seconds * 1000);
    
    // Get today's date for comparison
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    // Format time in 12-hour format (e.g., "8:49 AM")
    const timeOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    };
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
    if (isToday) {
      return formattedTime; // Just show time if today
    } else {
      // Show date and time if not today (e.g., "Aug 4, 8:49 AM")
      const dateOptions = { month: 'short', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', dateOptions);
      return `${formattedDate}, ${formattedTime}`;
    }
  };
  
  const timestamp = formatTimestamp(createdAt);
  
  // Get initial for avatar
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';
  
  // Copy message to clipboard
  const copyMessage = () => {
    navigator.clipboard.writeText(text);
    setMenuOpen(false);
  };
  
  // Delete message
  const deleteMessage = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDeleteMessage(id);
    }
    setMenuOpen(false);
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Handle file download with fresh URL
  const handleDownload = async (e, fileKey) => {
    try {
      // Get a fresh URL for the file
      if (fileKey) {
        const freshUrl = await getFirebaseFileUrl(fileKey);
        // Update the download link
        e.target.href = freshUrl;
      }
    } catch (error) {
      console.error("Error getting fresh download URL:", error);
      e.preventDefault();
      alert("Could not generate download link. Please try again.");
    }
  };
  
  // Render different file types
  const renderFile = () => {
    if (!file) return null;
    
    switch (file.fileType) {
      case 'image':
        return (
          <div className="mt-2 rounded overflow-hidden max-w-xs">
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <img 
                src={file.url} 
                alt={file.name} 
                className="max-w-full h-auto rounded"
                onLoad={(e) => {
                  // Limit preview height
                  if (e.target.naturalHeight > 300) {
                    e.target.style.maxHeight = '300px';
                    e.target.style.objectFit = 'cover';
                  }
                }}
              />
            </a>
          </div>
        );
      
      case 'audio':
        return (
          <div className="mt-2 bg-gray-100 rounded p-2">
            <div className="flex items-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-white rounded-full mr-2 shadow"
              >
                {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
              </button>
              <div className="flex-1 truncate text-sm">{file.name}</div>
              <a 
                href={file.url}
                download={file.name}
                className="ml-2 p-1.5 bg-white rounded-full shadow"
                onClick={(e) => handleDownload(e, file.key)}
              >
                <FaDownload size={12} />
              </a>
            </div>
            <audio 
              src={file.url} 
              controls 
              className="w-full mt-2 h-8"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="mt-2 rounded overflow-hidden">
            <video 
              src={file.url} 
              controls 
              className="max-w-full rounded"
              style={{ maxHeight: '300px' }}
            />
          </div>
        );
      
      default:
        // Document, compressed, or other file types
        return (
          <div className="mt-2 bg-gray-100 rounded p-3 flex items-center">
            <div className="flex-1">
              <div className="font-medium truncate">{file.name}</div>
              <div className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </div>
            </div>
            <a 
              href={file.url}
              download={file.name}
              className="ml-2 p-2 bg-white rounded-full shadow"
              onClick={(e) => handleDownload(e, file.key)}
            >
              <FaDownload size={14} />
            </a>
          </div>
        );
    }
  };
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - only show for non-current user and when needed */}
        {!isCurrentUser && showAvatar && (
          <div className="flex-shrink-0 mt-1">
            <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="bg-primary text-white h-full w-full flex items-center justify-center font-medium">
                  {initial}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Message content */}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {/* Sender info - only show for non-current user and when needed */}
          {!isCurrentUser && showAvatar && (
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <span className="font-medium text-gray-800">{displayName || 'Unknown User'}</span>
              {major && <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{major}</span>}
            </div>
          )}
          
          {/* Message bubble */}
          <div className="group relative">
            <div 
              className={`px-3 py-2 rounded-lg ${
                isCurrentUser 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 rounded-tl-none'
              } ${pending ? 'opacity-70' : ''}`}
            >
              {/* Text content, if any */}
              {text && <p className="whitespace-pre-wrap">{text}</p>}
              
              {/* File content, if any */}
              {renderFile()}
              
              {/* Timestamp */}
              <div className={`text-xs mt-1 text-right ${
                isCurrentUser ? 'text-primary-100' : 'text-gray-400'
              }`}>
                <span>{pending ? 'Sending...' : timestamp}</span>
              </div>
            </div>
            
            {/* Message actions menu */}
            <div className={`absolute ${isCurrentUser ? 'left-0' : 'right-0'} -top-2 transform ${isCurrentUser ? '-translate-x-full' : 'translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-full bg-white shadow-md text-gray-500 hover:text-gray-700"
              >
                <FaEllipsisH size={14} />
              </button>
              
              {menuOpen && (
                <div className={`absolute top-0 ${isCurrentUser ? 'right-6' : 'left-6'} bg-white rounded-md shadow-lg py-1 z-10 w-32`}>
                  <button 
                    className="flex items-center w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={copyMessage}
                  >
                    <FaCopy className="mr-2" size={12} />
                    Copy
                  </button>
                  <button 
                    className="flex items-center w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FaReply className="mr-2" size={12} />
                    Reply
                  </button>
                  
                  {/* Delete button - only show for the message owner */}
                  {isCurrentUser && !pending && (
                    <button 
                      className="flex items-center w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      onClick={deleteMessage}
                    >
                      <FaTrash className="mr-2" size={12} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}