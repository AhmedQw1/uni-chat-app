import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
  startAfter,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import { FaChevronDown, FaSpinner } from 'react-icons/fa';

export default function ChatRoom({ containerRef }) {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { currentUser, markGroupAsRead } = useAuth();
  const bottomRef = useRef();
  const [canWrite, setCanWrite] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const observer = useRef(null);
  const MESSAGES_PER_PAGE = 25;

  // Determine if user can write in this group
  useEffect(() => {
    if (!groupId || !currentUser) return;
    
    // Helper function to normalize ID creation
    const normalizeId = (text) => text.toLowerCase().replace(/\s+/g, '-');
    
    // Get normalized versions of both IDs for comparison
    const userMajorId = normalizeId(currentUser.major || '');
    
    // User can write if it's their major group or a general/shared group
    const isMajorGroup = userMajorId === groupId;
    const isGeneralGroup = true; // We're assuming all groups are writable for simplicity
    const userCanWrite = isMajorGroup || isGeneralGroup;
    setCanWrite(userCanWrite);
  }, [groupId, currentUser]);

  // Handle scroll to detect if user is at bottom
  useEffect(() => {
    if (!containerRef?.current) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrolledToBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
      setIsAtBottom(scrolledToBottom);
      
      if (scrolledToBottom && unreadCount > 0) {
        setUnreadCount(0);
      }
    };
    
    const currentContainer = containerRef.current;
    currentContainer.addEventListener('scroll', handleScroll);
    return () => currentContainer.removeEventListener('scroll', handleScroll);
  }, [containerRef, unreadCount]);

  // Load messages
  useEffect(() => {
    if (!groupId) return;
    
    setMessages([]);
    setLoading(true);
    setHasMore(true);

    // Create a reference to the messages collection
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(MESSAGES_PER_PAGE));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : data.createdAt || new Date();
          
        return {
          id: doc.id,
          ...data,
          createdAt
        };
      });
      
      // Reverse to get ascending order
      const sortedMessages = newMessages.reverse();
      
      // Check if we were at the bottom before receiving new messages
      const wasAtBottom = isAtBottom;
      
      // Update messages state
      setMessages(sortedMessages);
      setLoading(false);
      
      // If user was at bottom, scroll to bottom
      if (wasAtBottom) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else if (snapshot.docChanges().some(change => change.type === 'added')) {
        // If new messages came in and user is not at bottom, increment unread count
        setUnreadCount(prev => prev + 1);
      }
      
      // Mark messages as read when entering a chat room
      if (currentUser && sortedMessages.length > 0) {
        markGroupAsRead(groupId);
      }
    }, (error) => {
      console.error(`Error in message listener: ${error.message}`);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [groupId, currentUser, isAtBottom, markGroupAsRead]);

  // Load more messages function
  const loadMoreMessages = async () => {
    if (!groupId || !messages.length || loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      // Get the oldest message timestamp
      const oldestMessage = messages[0];
      
      // Query for older messages
      const messagesRef = collection(db, 'groups', groupId, 'messages');
      const q = query(
        messagesRef, 
        orderBy('createdAt', 'desc'), 
        startAfter(oldestMessage.createdAt), 
        limit(MESSAGES_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }
      
      // Process new messages
      const olderMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : data.createdAt || new Date();
          
        return {
          id: doc.id,
          ...data,
          createdAt
        };
      }).reverse();
      
      // Add older messages to the beginning
      setMessages(prev => [...olderMessages, ...prev]);
      
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUnreadCount(0);
    
    // Mark group as read
    if (currentUser && groupId) {
      markGroupAsRead(groupId);
    }
  };

  // Delete message function
  const deleteMessage = async (messageId) => {
    if (!groupId || !currentUser) return;
    
    try {
      // Get a reference to the message document
      const messageRef = doc(db, 'groups', groupId, 'messages', messageId);
      
      // Delete the message
      await deleteDoc(messageRef);
      
      console.log(`Message ${messageId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Please try again.");
    }
  };

  // Send message function
  const sendMessage = async (text, fileData = null) => {
    if ((!text || !text.trim()) && !fileData) return;
    if (!currentUser) return;

    try {
      // Create a temporary ID for the message
      const tempId = `temp-${Date.now()}`;
      
      // Create the message object
      const newMessage = {
        id: tempId,
        text: text || '',
        createdAt: new Date(),
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL || null,
        major: currentUser.major || 'Unspecified',
        pending: true
      };
      
      // Add file data if provided
      if (fileData) {
        newMessage.file = fileData;
      }
      
      // Add to local messages for immediate display
      setLocalMessages(prev => [...prev, newMessage]);
      
      // Create message object for Firestore
      const messageData = {
        text: text || '',
        createdAt: serverTimestamp(),
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL || null,
        major: currentUser.major || 'Unspecified'
      };
      
      // Add file data if provided
      if (fileData) {
        messageData.file = fileData;
      }
      
      // Send to Firestore
      const messagesRef = collection(db, 'groups', groupId, 'messages');
      await addDoc(messagesRef, messageData);
      
      // Remove temporary message
      setLocalMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Combine server messages with temporary local messages
  const allMessages = [...messages, ...localMessages].sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return dateA - dateB;
  });

  return (
    <>
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <FaSpinner className="animate-spin text-primary text-xl" />
            <span className="ml-2 text-gray-600">Loading messages...</span>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center py-2">
                <button 
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load earlier messages'
                  )}
                </button>
              </div>
            )}
            
            {!canWrite && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-700 mb-4 rounded">
                <p className="font-medium">Read-only mode</p>
                <p>You can view this group's messages but cannot send messages here.</p>
                {currentUser?.major && 
                  <p>You can send messages in your major group ({currentUser.major}) and in general groups.</p>}
              </div>
            )}
            
            {allMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p className="text-center">
                  No messages yet. {canWrite ? 'Be the first to send a message!' : ''}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allMessages.map((msg, index) => (
                  <ChatMessage 
                    key={msg.id} 
                    message={msg}
                    showAvatar={
                      index === 0 || 
                      allMessages[index-1].uid !== msg.uid ||
                      (new Date(msg.createdAt) - new Date(allMessages[index-1].createdAt)) > 5*60*1000
                    }
                    onDeleteMessage={deleteMessage}
                  />
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* New messages alert */}
      {!isAtBottom && unreadCount > 0 && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center"
        >
          <FaChevronDown className="mr-2" />
          {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
        </button>
      )}
      
      {/* Message input */}
      {canWrite ? (
        <MessageInput onSendMessage={sendMessage} groupId={groupId} />
      ) : (
        <div className="p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-200">
          You cannot send messages in this group
        </div>
      )}
    </>
  );
}