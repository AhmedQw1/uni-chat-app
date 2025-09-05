import { useState, useEffect, useRef, useCallback } from 'react';
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
import { majors } from '../../data/majors';
import { generateGroupId } from '../../utils/groupId';

export default function ChatRoom({ containerRef }) {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { currentUser, markGroupAsRead } = useAuth();
  const [canWrite, setCanWrite] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const MESSAGES_PER_PAGE = 25;
  const [replyTo, setReplyTo] = useState(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUnreadCount(0);
    if (currentUser && groupId) markGroupAsRead(groupId);
  }, [currentUser, groupId, markGroupAsRead]);

  // Create a stable ref for scrollToBottom to avoid dependency issues
  const scrollToBottomRef = useRef(scrollToBottom);
  scrollToBottomRef.current = scrollToBottom;

  useEffect(() => {
    if (!groupId || !currentUser) return;

    const majorGroupIds = majors.map(major => generateGroupId(major));
    const isMajorGroup = majorGroupIds.includes(groupId);

    if (isMajorGroup) {
      const userMajorId = generateGroupId(currentUser.major || '');
      setCanWrite(groupId === userMajorId);
    } else {
      setCanWrite(true); // Allow writing in general and course groups
    }
  }, [groupId, currentUser]);

  // Separate effect to mark messages as read when user is active
  useEffect(() => {
    if (currentUser && groupId && messages.length > 0 && isAtBottom) {
      markGroupAsRead(groupId);
    }
  }, [currentUser, groupId, messages.length, isAtBottom, markGroupAsRead]);

  // Auto-scroll effect for new messages
  useEffect(() => {
    if (messages.length > 0 && isAtBottom) {
      setTimeout(() => scrollToBottomRef.current(), 100);
    }
  }, [messages.length, isAtBottom]);

  useEffect(() => {
    if (!containerRef?.current) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrolledToBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
      setIsAtBottom(scrolledToBottom);
      if (scrolledToBottom && unreadCount > 0) setUnreadCount(0);
    };
    const currentContainer = containerRef.current;
    currentContainer.addEventListener('scroll', handleScroll);
    return () => currentContainer.removeEventListener('scroll', handleScroll);
  }, [containerRef, unreadCount]);

  useEffect(() => {
    if (!groupId) return;
    setMessages([]);
    setLoading(true);
    setHasMore(true);
    
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
      
      const sortedMessages = newMessages.reverse();
      setMessages(sortedMessages);
      setLoading(false);
      
    }, (error) => {
      console.error(`Error in message listener: ${error.message}`);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [groupId, currentUser?.uid]); // Removed scrollToBottom dependency

  const loadMoreMessages = async () => {
    if (!groupId || messages.length === 0 || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const oldestMessage = messages[0];
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
      setMessages(prev => [...olderMessages, ...prev]);
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!groupId || !currentUser) return;
    try {
      const messageRef = doc(db, 'groups', groupId, 'messages', messageId);
      await deleteDoc(messageRef);
      console.log(`Message ${messageId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Please try again.");
    }
  };

  // Simplified send message without optimistic UI
  const sendMessage = async (text, fileData = null) => {
    if ((!text || !text.trim()) && !fileData) return;
    if (!currentUser) return;
    
    try {
      // Prepare message data for Firebase
      const messageData = {
        text: text || '',
        createdAt: serverTimestamp(),
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL || null,
        major: currentUser.major || 'Unspecified',
        replyToId: replyTo ? replyTo.id : null,
      };
      
      if (fileData) messageData.file = fileData;
      
      // Send to Firebase directly
      const messagesRef = collection(db, 'groups', groupId, 'messages');
      await addDoc(messagesRef, messageData);
      
      setReplyTo(null);
      
      // Auto-scroll after sending
      setTimeout(() => scrollToBottomRef.current(), 200);
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Lookup for replied message (for display in ChatMessage)
  const lookupMessage = (id) => {
    return messages.find(msg => msg.id === id);
  };

  // Simplified message handling - no optimistic UI to eliminate flickering
  const allMessages = messages;

  return (
    <>
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
                {allMessages.map((msg, index) => {
                  const prevMsg = allMessages[index - 1];
                  const showAvatar = !prevMsg ||
                    prevMsg.uid !== msg.uid ||
                    (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) > 5 * 60 * 1000;
                  return (
                    <ChatMessage 
                      key={msg.id} 
                      message={msg}
                      showAvatar={showAvatar}
                      onDeleteMessage={deleteMessage}
                      onReplyMessage={setReplyTo}
                      repliedMessage={msg.replyToId ? lookupMessage(msg.replyToId) : null}
                    />
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      {canWrite ? (
        <MessageInput 
          onSendMessage={sendMessage} 
          groupId={groupId}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      ) : (
        <div className="p-4 text-center text-gray-500 bg-gray-100 border-t border-gray-200">
          You can only read messages in this group
        </div>
      )}
    </>
  );
}