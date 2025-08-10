import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { initNotifications, getNotificationService } from '../services/NotificationService';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps your app and makes auth available
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);

  // Registration function
  async function register(email, password, displayName, major) {
    // Create the authentication user
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(result.user, { displayName });
    
    // Store additional user data in Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      displayName,
      major,
      email,
      createdAt: new Date()
    });

    // Send email verification
    await sendEmailVerification(result.user);

    return result.user;
  }

  // Login function
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Logout function
  async function logout() {
    // Clean up notification service
    const notificationService = getNotificationService();
    if (notificationService) {
      notificationService.cleanup();
    }
    
    return signOut(auth);
  }

  // Function to refresh user data from Firestore
  const refreshUserData = async () => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setCurrentUser({
            ...auth.currentUser,
            displayName: auth.currentUser.displayName || userData.displayName,
            major: userData.major,
            photoURL: auth.currentUser.photoURL || userData.photoURL,
            emailVerified: auth.currentUser.emailVerified
          });
        } else {
          setCurrentUser(auth.currentUser);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  };

  // Password reset function
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Email verification function (for resending if needed)
  async function sendVerificationEmail() {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
    throw new Error("No current user");
  }

  // Set up auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log("User is signed in:", user.uid);
          
          // Get additional user data from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            console.log("Found user document in Firestore");
            // Combine auth user with Firestore data
            const userData = userDocSnap.data();
            const enhancedUser = {
              ...user,
              displayName: user.displayName || userData.displayName,
              major: userData.major,
              photoURL: user.photoURL || userData.photoURL,
              emailVerified: user.emailVerified
            };
            
            setCurrentUser(enhancedUser);
            
            // Initialize notification service for this user
            const notificationService = initNotifications(user.uid);
            
            // Listen for unread count changes
            if (notificationService) {
              notificationService.onUnreadCountsChanged((counts, total) => {
                setUnreadCounts(counts);
                setTotalUnread(total);
              });
              
              // Request notification permission
              notificationService.requestNotificationPermission();
            }
          } else {
            console.log("No user document found in Firestore");
            // Just use the auth user data
            setCurrentUser(user);
          }
          
          setLoading(false);
        } else {
          console.log("No user is signed in");
          setCurrentUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        // Fall back to just the auth user or null
        setCurrentUser(user);
        setLoading(false);
      }
    });

    // Clean up the observer when the component unmounts
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    register,
    login,
    logout,
    refreshUserData,
    resetPassword,
    sendVerificationEmail,
    unreadCounts,
    totalUnread,
    markGroupAsRead: (groupId) => {
      const notificationService = getNotificationService();
      if (notificationService) {
        notificationService.markGroupAsRead(groupId);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}