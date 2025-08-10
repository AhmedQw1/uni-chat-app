import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadProfilePicture } from '../services/FireBaseStorageService';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FaClock, FaUser } from 'react-icons/fa';

export default function Profile() {
  const { currentUser, refreshUserData } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [previewUrl, setPreviewUrl] = useState(currentUser?.photoURL || null);
  
  // Image cropping states
  const [selectedFile, setSelectedFile] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSource, setImageSource] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Refs
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Format date and time
  const formatDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if file is an image and under 2MB
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Selected file must be an image', isError: true });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'Image must be less than 2MB', isError: true });
        return;
      }
      
      setSelectedFile(file);
      
      // Create a URL for the image to use in the cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSource(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Called when the image is loaded in the cropper
  const onImageLoad = useCallback((img) => {
    imgRef.current = img;
    
    // Set a default crop that is centered
    const width = Math.min(80, (img.width / img.height) * 100);
    setCrop({ unit: '%', width: width, aspect: 1, x: (100 - width) / 2, y: 10 });
    
    return false;
  }, []);

  // Generate a cropped image
  const generateCroppedImage = useCallback(() => {
    if (!imgRef.current || !completedCrop || !previewCanvasRef.current) return;

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      
      // Create file from blob
      const croppedFile = new File([blob], 'cropped-image.png', { 
        type: 'image/png'
      });
      
      // Create preview URL
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setSelectedFile(croppedFile);
      setShowCropper(false);
    }, 'image/png', 1);
  }, [completedCrop]);

  // Apply crop button handler
  const handleApplyCrop = () => {
    generateCroppedImage();
  };

  // Cancel crop button handler
  const handleCancelCrop = () => {
    setShowCropper(false);
    setSelectedFile(null);
    setImageSource(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setMessage({ text: 'Display name cannot be empty', isError: true });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ text: 'Saving changes...', isError: false });
      
      let photoURL = currentUser?.photoURL || null;
      
      // Upload profile picture if one was selected
      if (selectedFile) {
        try {
          console.log("Starting profile picture upload to Firebase Storage...");
          setUploadProgress(0);
          
          // Upload to Firebase Storage
          photoURL = await uploadProfilePicture(
            selectedFile, 
            currentUser.uid,
            (progress) => setUploadProgress(progress)
          );
          
          console.log("Profile picture uploaded successfully:", photoURL);
        } catch (error) {
          console.error('Error uploading image:', error);
          throw new Error(`Error uploading profile picture: ${error.message}`);
        }
      }
      
      // Update auth profile
      try {
        console.log("Updating auth profile...");
        await updateProfile(auth.currentUser, {
          displayName: displayName,
          photoURL: photoURL
        });
        console.log("Auth profile updated successfully");
      } catch (error) {
        console.error("Error updating auth profile:", error);
        throw new Error(`Error updating auth profile: ${error.message}`);
      }
      
      // Update Firestore user document
      try {
        console.log("Updating Firestore document...");
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          displayName: displayName,
          photoURL: photoURL
        });
        console.log("Firestore document updated successfully");
      } catch (error) {
        console.error("Error updating Firestore document:", error);
        throw new Error(`Error updating Firestore document: ${error.message}`);
      }
      
      setMessage({ text: 'Profile updated successfully!', isError: false });
      setSelectedFile(null);
      
      // Refresh user data and navigate to home page
      await refreshUserData();
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: `Failed to update profile: ${error.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      {/* Status bar */}
      <div className="bg-white shadow-sm rounded-lg p-3 mb-4 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center">
          <FaClock className="text-gray-400 mr-1.5" />
          <span>Current Time: {formatDateTime()}</span>
        </div>
        <div className="flex items-center">
          <FaUser className="text-gray-400 mr-1.5" />
          <span>Current User's Login: {currentUser?.displayName || currentUser?.email}</span>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.isError ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-green-50 text-green-700 border-l-4 border-green-500'}`}>
          {message.text}
        </div>
      )}
      
      {showCropper ? (
        <div className="image-cropper-container">
          <h3 className="text-lg font-medium mb-3">Crop Your Profile Picture</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <ReactCrop 
              crop={crop} 
              onChange={c => setCrop(c)}
              onComplete={c => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img 
                src={imageSource} 
                onLoad={e => onImageLoad(e.currentTarget)} 
                alt="Crop preview" 
                className="max-w-full max-h-[400px] mx-auto"
              />
            </ReactCrop>
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <button 
              onClick={handleCancelCrop}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              type="button"
            >
              Cancel
            </button>
            <button 
              onClick={handleApplyCrop}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
              type="button"
            >
              Apply Crop
            </button>
          </div>
          
          {/* Hidden canvas for cropping */}
          <canvas
            ref={previewCanvasRef}
            style={{
              display: "none",
              width: completedCrop?.width ?? 0,
              height: completedCrop?.height ?? 0
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary mb-4 cursor-pointer relative"
            onClick={() => fileInputRef.current.click()}
          >
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                {currentUser?.displayName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">Change Picture</span>
            </div>
          </div>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {selectedFile && (
            <div className="text-sm text-gray-500 mb-2">
              Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </div>
          )}
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full max-w-xs mb-2">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                Uploading: {uploadProgress.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={currentUser?.email || ''}
            disabled
            className="w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
        </div>
        
        <div>
          <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">Major</label>
          <input
            type="text"
            id="major"
            value={currentUser?.major || ''}
            disabled
            className="w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">Major cannot be changed after registration</p>
        </div>
        
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}