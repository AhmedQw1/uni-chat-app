import { collection, doc, setDoc, getDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

class NotificationService {
  constructor(userId) {
    this.userId = userId;
    this.listeners = {};
    this.unreadCounts = {};
    this.onUnreadCountsChangedCallbacks = [];
  }

  // Initialize notification tracking for a user
  async initialize() {
    if (!this.userId) return;

    try {
      // Create or update user's notification document
      const userNotifRef = doc(db, 'userNotifications', this.userId);
      const notifDoc = await getDoc(userNotifRef);
      
      if (!notifDoc.exists()) {
        await setDoc(userNotifRef, {
          lastActive: new Date(),
          groups: {}
        });
      }
      
      // Listen for new messages across all groups
      this.startGlobalListener();
      
      console.log("Notification service initialized for user:", this.userId);
    } catch (error) {
      console.error("Error initializing notification service:", error);
    }
  }
  
  // Start listening for new messages in all groups
  startGlobalListener() {
    // Get all groups the user has accessed
    const userNotifRef = doc(db, 'userNotifications', this.userId);
    
    this.globalUnsubscribe = onSnapshot(userNotifRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const groups = data.groups || {};
        
        // Start listeners for each group
        Object.keys(groups).forEach(groupId => {
          this.startGroupListener(groupId, groups[groupId].lastRead);
        });
      }
    });
  }
  
  // Listen for new messages in a specific group
  startGroupListener(groupId, lastRead = null) {
    // Don't create duplicate listeners
    if (this.listeners[groupId]) return;
    
    const messagesRef = collection(db, 'groups', groupId, 'messages');
    let q;
    
    if (lastRead) {
      // Only get messages newer than last read
      q = query(
        messagesRef, 
        where('createdAt', '>', lastRead), 
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get all recent messages
      q = query(
        messagesRef, 
        orderBy('createdAt', 'desc'),
        limit(100)
      );
    }
    
    this.listeners[groupId] = onSnapshot(q, (snapshot) => {
      // Count messages not from current user
      const unreadCount = snapshot.docs.filter(
        doc => doc.data().uid !== this.userId
      ).length;
      
      // Update unread count for this group
      this.unreadCounts = {
        ...this.unreadCounts,
        [groupId]: unreadCount
      };
      
      // Notify all callbacks
      this.notifyUnreadCountsChanged();
    });
  }
  
  // Mark messages in a group as read
  async markGroupAsRead(groupId) {
    if (!this.userId || !groupId) return;
    
    try {
      const userNotifRef = doc(db, 'userNotifications', this.userId);
      
      // Update last read timestamp for this group
      await setDoc(userNotifRef, {
        lastActive: new Date(),
        groups: {
          [groupId]: {
            lastRead: new Date()
          }
        }
      }, { merge: true });
      
      // Update local unread count
      this.unreadCounts = {
        ...this.unreadCounts,
        [groupId]: 0
      };
      
      // Notify all callbacks
      this.notifyUnreadCountsChanged();
    } catch (error) {
      console.error(`Error marking group ${groupId} as read:`, error);
    }
  }
  
  // Get total unread count across all groups
  getTotalUnreadCount() {
    return Object.values(this.unreadCounts).reduce((total, count) => total + count, 0);
  }
  
  // Get unread count for a specific group
  getGroupUnreadCount(groupId) {
    return this.unreadCounts[groupId] || 0;
  }
  
  // Subscribe to unread count changes
  onUnreadCountsChanged(callback) {
    this.onUnreadCountsChangedCallbacks.push(callback);
    // Immediately notify with current counts
    callback(this.unreadCounts, this.getTotalUnreadCount());
    
    // Return unsubscribe function
    return () => {
      this.onUnreadCountsChangedCallbacks = 
        this.onUnreadCountsChangedCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Notify all callbacks of unread count changes
  notifyUnreadCountsChanged() {
    const total = this.getTotalUnreadCount();
    this.onUnreadCountsChangedCallbacks.forEach(callback => {
      callback(this.unreadCounts, total);
    });
  }
  
  // Request browser notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  // Show browser notification
  showNotification(title, options) {
    if (Notification.permission === 'granted') {
      return new Notification(title, options);
    }
  }
  
  // Clean up all listeners
  cleanup() {
    if (this.globalUnsubscribe) {
      this.globalUnsubscribe();
    }
    
    // Clean up all group listeners
    Object.values(this.listeners).forEach(unsubscribe => unsubscribe());
    
    this.listeners = {};
    this.unreadCounts = {};
    this.onUnreadCountsChangedCallbacks = [];
  }
}

// Singleton instance
let instance = null;

export const initNotifications = (userId) => {
  if (instance) {
    instance.cleanup();
  }
  
  if (userId) {
    instance = new NotificationService(userId);
    instance.initialize();
  } else {
    instance = null;
  }
  
  return instance;
};

export const getNotificationService = () => instance;