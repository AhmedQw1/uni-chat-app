import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "PLACEHOLDER_API_KEY",
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

// Set persistence to LOCAL (survives browser refresh)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Helper function to initialize a group document
export const initializeGroup = async (groupId, groupName, groupType) => {
  try {
    console.log(`Initializing group: ${groupId} (${groupType})`);
    
    // Create or update the group document
    const groupRef = doc(db, "groups", groupId);
    await setDoc(groupRef, {
      name: groupName,
      type: groupType,
      createdAt: new Date()
    }, { merge: true });
    
    console.log(`Group ${groupId} initialized successfully`);
    return true;
  } catch (error) {
    console.error(`Error initializing group ${groupId}:`, error);
    return false;
  }
};