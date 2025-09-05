import { useAuth } from '../../contexts/AuthContext';
import { useState, memo } from 'react';
import { FaEllipsisH, FaReply, FaCopy, FaTrash } from 'react-icons/fa';

// Helper to render file/image/emoji - memoized to prevent re-renders
const MessageContent = memo(function MessageContent({ message }) {
  if (!message) return null;
  if (message.file) {
    switch (message.file.fileType) {
      case 'image':
        return (
          <img src={message.file.url} alt={message.file.name} className="max-w-xs h-auto rounded border" />
        );
      case 'audio':
        return (
          <audio src={message.file.url} controls className="w-full h-8" />
        );
      case 'video':
        return (
          <video src={message.file.url} controls className="max-w-xs rounded" style={{ maxHeight: '200px' }} />
        );
      default:
        return (
          <a href={message.file.url} download={message.file.name} className="text-blue-800 underline">
            {message.file.name}
          </a>
        );
    }
  }
  // If the only thing is an emoji, show it large
  if (message.text && /^\p{Emoji}+$/u.test(message.text.trim())) {
    return <span style={{ fontSize: '2rem' }}>{message.text}</span>;
  }
  return <span>{message.text}</span>;
});

export default function ChatMessage({ message, showAvatar = true, onDeleteMessage, onReplyMessage, repliedMessage }) {
  const { currentUser } = useAuth();
  const { id, text, uid, displayName, photoURL, createdAt, major, pending } = message;
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrentUser = currentUser?.uid === uid;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp.seconds * 1000);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    if (isToday) return formattedTime;
    const dateOptions = { month: 'short', day: 'numeric' };
    return `${date.toLocaleDateString('en-US', dateOptions)}, ${formattedTime}`;
  };
  const timestamp = formatTimestamp(createdAt);
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';
  const copyMessage = () => {
    navigator.clipboard.writeText(text);
    setMenuOpen(false);
  };

  const deleteMessage = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDeleteMessage(id);
    }
    setMenuOpen(false);
  };

  // Display replied-to message
  const renderReplyPreview = () => {
    if (!repliedMessage) return null;
    return (
      <div className="mb-1 px-2 py-1 border-l-4 border-blue-400 bg-blue-50 rounded flex items-center gap-2">
        <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden bg-primary text-white text-xs flex items-center justify-center mr-2">
          {repliedMessage.photoURL ? (
            <img src={repliedMessage.photoURL} alt={repliedMessage.displayName} className="h-full w-full object-cover" />
          ) : (
            repliedMessage.displayName?.charAt(0).toUpperCase() || "?"
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-blue-800 font-medium text-xs">
            {repliedMessage.displayName || "Unknown User"}
          </span>
          <span className="text-blue-700 text-xs">
            <MessageContent message={repliedMessage} />
          </span>
        </div>
      </div>
    );
  };

  // Render main message
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && showAvatar && (
          <div className="flex-shrink-0 mt-1">
            <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="bg-primary text-white h-full w-full flex items-center justify-center font-medium">
                  {initial}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          {!isCurrentUser && showAvatar && (
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <span className="font-medium text-gray-800">{displayName || 'Unknown User'}</span>
              {major && <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-xs">{major}</span>}
            </div>
          )}
          <div className="group relative">
            <div 
              className={`px-3 py-2 rounded-lg ${
                isCurrentUser 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 rounded-tl-none'
              } ${pending ? 'opacity-70' : ''}`}
            >
              {/* Show replied-to message preview above this bubble */}
              {renderReplyPreview()}
              {/* Main message text/file/emoji */}
              <MessageContent message={message} />
              <div className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-primary-100' : 'text-gray-400'}`}>
                <span>{pending ? 'Sending...' : timestamp}</span>
              </div>
            </div>
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
                    onClick={() => {
                      if (onReplyMessage) onReplyMessage(message);
                      setMenuOpen(false);
                    }}
                  >
                    <FaReply className="mr-2" size={12} />
                    Reply
                  </button>
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