import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdC1YPbF-1gKZhycQiEzlzpfYupOkrTvA",
  authDomain: "unigroups-chats.firebaseapp.com",
  projectId: "unigroups-chats",
  storageBucket: "unigroups-chats.appspot.com", // Make sure this is correct
  messagingSenderId: "217202360464",
  appId: "1:217202360464:web:f4b3a686d7875646085815",
  measurementId: "G-VX7HZH89E1"
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