import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence 
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validate environment variables
const requiredConfig = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

const missingVars = requiredConfig.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing Firebase config variables: ${missingVars.join(', ')}`);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence immediately (LOCAL) and fallback to SESSION if needed
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase persistence set to LOCAL");
  })
  .catch(async (error) => {
    console.error("Error setting LOCAL persistence, trying SESSION:", error);
    try {
      await setPersistence(auth, browserSessionPersistence);
      console.log("Firebase persistence set to SESSION");
    } catch (fallbackError) {
      console.error("Error setting SESSION persistence:", fallbackError);
    }
  });

// Helper function to initialize a group document
export const initializeGroup = async (groupId, groupName, groupType) => {
  try {
    const groupRef = doc(db, "groups", groupId);
    await setDoc(groupRef, {
      name: groupName,
      type: groupType,
      createdAt: new Date()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error initializing group ${groupId}:`, error);
    return false;
  }
};