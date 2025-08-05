import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSmile, FaFile, FaTimes, FaImage, FaFilePdf, FaFileAudio, FaFileVideo, FaFileArchive } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { uploadToFirebaseStorage } from '../../services/FirebaseStorageService';

export default function MessageInput({ onSendMessage, groupId }) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Define allowed file types
  const allowedFileTypes = {
    image: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    document: ['.pdf', '.docx', '.pptx', '.xlsx', '.txt'],
    compressed: ['.zip', '.rar'],
    audio: ['.mp3', '.m4a', '.ogg', '.wav'],
    video: ['.mp4', '.webm', '.mov']
  };
  
  // Get all allowed extensions as a string for the file input
  const getAllowedFileExtensions = () => {
    return Object.values(allowedFileTypes).flat().join(',');
  };

  // Resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't send if no message and no file
    if (!message.trim() && !selectedFile) return;
    
    try {
      let fileData = null;
      
      // If there's a file, upload it first
      if (selectedFile) {
        fileData = await uploadToFirebase(selectedFile);
      }
      
      // Send message with or without file
      onSendMessage(message, fileData);
      
      // Reset state
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);
      setUploadProgress(0);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Focus back on textarea
      textareaRef.current.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Handle key press - submit on Enter (without shift)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Handle emoji selection
  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("File is too large. Maximum file size is 50MB.");
      return;
    }
    
    setSelectedFile(file);
    
    // Determine file type
    const extension = `.${file.name.split('.').pop().toLowerCase()}`;
    
    if (allowedFileTypes.image.includes(extension)) {
      setFileType('image');
      // Create preview for images
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else if (allowedFileTypes.document.includes(extension)) {
      setFileType('document');
      setFilePreview(null);
    } else if (allowedFileTypes.compressed.includes(extension)) {
      setFileType('compressed');
      setFilePreview(null);
    } else if (allowedFileTypes.audio.includes(extension)) {
      setFileType('audio');
      setFilePreview(null);
    } else if (allowedFileTypes.video.includes(extension)) {
      setFileType('video');
      setFilePreview(null);
    } else {
      setFileType('other');
      setFilePreview(null);
    }
  };
  
  // Upload file to Firebase Storage
  const uploadToFirebase = async (file) => {
    try {
      setIsUploading(true);
      
      // Track progress
      const onProgress = (progress) => {
        console.log(`Upload progress: ${progress.toFixed(1)}%`);
        setUploadProgress(progress);
      };
      
      // Upload to Firebase Storage
      console.log(`Starting upload to Firebase: ${file.name} (${fileType})`);
      const fileData = await uploadToFirebaseStorage(file, fileType, groupId, onProgress);
      
      setIsUploading(false);
      console.log("Firebase upload successful:", fileData);
      
      return fileData;
    } catch (error) {
      console.error('Error in Firebase upload:', error);
      alert(`Failed to upload file: ${error.message || 'Unknown error'}`);
      setIsUploading(false);
      throw error;
    }
  };
  
  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    setUploadProgress(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Get file icon based on type
  const getFileIcon = () => {
    switch (fileType) {
      case 'document':
        return <FaFilePdf size={20} />;
      case 'audio':
        return <FaFileAudio size={20} />;
      case 'video':
        return <FaFileVideo size={20} />;
      case 'compressed':
        return <FaFileArchive size={20} />;
      default:
        return <FaFile size={20} />;
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* File preview (if any) */}
        {selectedFile && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
            >
              <FaTimes size={16} />
            </button>
            
            <div className="flex items-center gap-3">
              {fileType === 'image' && filePreview ? (
                <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden">
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  {getFileIcon()}
                </div>
              )}
              
              <div className="flex-1">
                <div className="font-medium text-gray-700 truncate">{selectedFile.name}</div>
                <div className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB · {fileType}
                </div>
                
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {uploadProgress.toFixed(0)}% uploaded
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      
        {/* Input area with buttons */}
        <div className="flex items-end gap-2">
          <div className={`flex-1 relative border rounded-lg transition-all ${
            isFocused ? 'border-primary ring-1 ring-primary ring-opacity-50' : 'border-gray-300'
          }`}>
            {/* Button row above textarea (only shown when focused) */}
            {isFocused && (
              <div className="absolute -top-10 left-0 right-0 bg-white border border-gray-200 rounded-t-lg shadow-sm p-2 flex items-center gap-2">
                <button 
                  type="button" 
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  title="Add file"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaFile size={16} />
                </button>
                <button 
                  type="button" 
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  title="Add image"
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaImage size={16} />
                </button>
                <button 
                  type="button" 
                  className={`p-2 rounded-full ${
                    showEmojiPicker 
                      ? 'bg-gray-100 text-primary' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Add emoji"
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                >
                  <FaSmile size={16} />
                </button>
                <div className="flex-1"></div>
                <button 
                  type="button" 
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  title="Close formatting"
                  onClick={() => setIsFocused(false)}
                >
                  <FaTimes size={16} />
                </button>
              </div>
            )}
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={getAllowedFileExtensions()}
              className="hidden"
            />
            
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-full mb-2 left-0 z-10"
              >
                <EmojiPicker 
                  onEmojiClick={onEmojiClick}
                  width={300}
                  height={400}
                />
              </div>
            )}
            
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              placeholder="Type a message..."
              className="w-full p-3 pr-12 rounded-lg resize-none max-h-[150px] focus:outline-none"
              rows={1}
              disabled={isUploading}
            />
            
            {/* Character count */}
            {message.length > 0 && (
              <div className="absolute bottom-2 right-12 text-xs text-gray-400">
                {message.length}
              </div>
            )}
          </div>
          
          {/* Send button */}
          <button 
            type="submit" 
            disabled={(!message.trim() && !selectedFile) || isUploading}
            className={`p-3 rounded-full ${
              (message.trim() || selectedFile) && !isUploading
                ? 'bg-primary text-white hover:bg-primary-hover' 
                : 'bg-gray-100 text-gray-400'
            } flex-shrink-0 transition-colors`}
          >
            <FaPaperPlane size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}