import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // Your existing Firebase config
import { v4 as uuidv4 } from 'uuid';

// File type mappings
const typeToPrefix = {
  image: 'images/',
  document: 'documents/',
  video: 'videos/',
  audio: 'audio/',
  compressed: 'archives/',
  other: 'misc/'
};

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} fileType - Type of file (image, document, etc.)
 * @param {string} groupId - The group ID for organizing files
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} - File metadata including URL
 */
export const uploadToFirebaseStorage = async (file, fileType, groupId, onProgress = null) => {
  try {
    // Generate a unique file name
    const extension = file.name.split('.').pop().toLowerCase();
    const fileName = `${uuidv4()}.${extension}`;
    
    // Create storage reference
    const prefix = typeToPrefix[fileType] || typeToPrefix.other;
    const storageRef = ref(storage, `${prefix}${groupId}/${fileName}`);
    
    console.log(`Uploading to Firebase Storage: ${file.name} (${file.size} bytes) to path: ${prefix}${groupId}/${fileName}`);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Return a promise
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        // Progress callback
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(1)}%`);
          if (onProgress) onProgress(progress);
        },
        // Error callback
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        // Success callback
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Upload successful, download URL:", downloadURL);
            
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              url: downloadURL,
              key: storageRef.fullPath,
              fileType: fileType
            });
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in Firebase Storage upload:', error);
    throw error;
  }
};

/**
 * Get a fresh URL for a file in Firebase Storage
 * @param {string} filePath - The file path in storage
 * @returns {Promise<string>} - The download URL
 */
export const getFirebaseFileUrl = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting Firebase Storage URL:', error);
    throw error;
  }
};

/**
 * Upload a profile picture to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} userId - User ID for the profile picture
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} - The download URL
 */
export const uploadProfilePicture = async (file, userId, onProgress = null) => {
  try {
    // Generate a unique filename
    const extension = file.name.split('.').pop().toLowerCase();
    const fileName = `profile-${userId}-${Date.now()}.${extension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `profiles/${fileName}`);
    
    console.log(`Uploading profile picture for user ${userId}: ${file.size} bytes`);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Return a promise
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        // Progress callback
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Profile picture upload progress: ${progress.toFixed(1)}%`);
          if (onProgress) onProgress(progress);
        },
        // Error callback
        (error) => {
          console.error("Profile picture upload failed:", error);
          reject(error);
        },
        // Success callback
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Profile picture upload successful:", downloadURL);
            
            // Add a cache-busting parameter
            const cacheBustedURL = `${downloadURL}?t=${Date.now()}`;
            resolve(cacheBustedURL);
          } catch (error) {
            console.error("Error getting profile picture URL:", error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in profile picture upload:', error);
    throw error;
  }
};