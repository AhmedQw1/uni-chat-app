import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSmile, FaFile, FaTimes, FaImage, FaFilePdf, FaFileAudio, FaFileVideo, FaFileArchive } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { uploadToFirebaseStorage } from '../../services/FirebaseStorageService';

function MessageContent({ message }) {
  if (!message) return null;
  if (message.file) {
    switch (message.file.fileType) {
      case 'image':
        return (
          <img src={message.file.url} alt={message.file.name} className="max-w-xs h-auto rounded border" />
        );
      case 'audio':
        return (
          <audio src={message.file.url} controls className="w-full h-8" />
        );
      case 'video':
        return (
          <video src={message.file.url} controls className="max-w-xs rounded" style={{ maxHeight: '200px' }} />
        );
      default:
        return (
          <a href={message.file.url} download={message.file.name} className="text-blue-800 underline">
            {message.file.name}
          </a>
        );
    }
  }
  if (message.text && /^\p{Emoji}+$/u.test(message.text.trim())) {
    return <span style={{ fontSize: '2rem' }}>{message.text}</span>;
  }
  return <span>{message.text}</span>;
}

export default function MessageInput({ onSendMessage, groupId, replyTo, onCancelReply }) {
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

  const allowedFileTypes = {
    image: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    document: ['.pdf', '.docx', '.pptx', '.xlsx', '.txt'],
    compressed: ['.zip', '.rar'],
    audio: ['.mp3', '.m4a', '.ogg', '.wav'],
    video: ['.mp4', '.webm', '.mov']
  };

  const getAllowedFileExtensions = () => {
    return Object.values(allowedFileTypes).flat().join(',');
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

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

  useEffect(() => {
    if (replyTo === null) setMessage('');
  }, [replyTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;
    try {
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadToFirebase(selectedFile);
      }
      onSendMessage(message, fileData);
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);
      setUploadProgress(0);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("File is too large. Maximum file size is 50MB.");
      return;
    }
    setSelectedFile(file);
    const extension = `.${file.name.split('.').pop().toLowerCase()}`;
    if (allowedFileTypes.image.includes(extension)) {
      setFileType('image');
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

  const uploadToFirebase = async (file) => {
    try {
      setIsUploading(true);
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };
      const fileData = await uploadToFirebaseStorage(file, fileType, groupId, onProgress);
      setIsUploading(false);
      return fileData;
    } catch (error) {
      alert(`Failed to upload file: ${error.message || 'Unknown error'}`);
      setIsUploading(false);
      throw error;
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
        {/* Reply banner */}
        {replyTo && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-2 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden bg-primary text-white text-xs flex items-center justify-center mr-2">
                {replyTo.photoURL ? (
                  <img src={replyTo.photoURL} alt={replyTo.displayName} className="h-full w-full object-cover" />
                ) : (
                  replyTo.displayName?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-blue-800 font-medium text-xs">
                  {replyTo.displayName || "Unknown User"}
                </span>
                <span className="text-blue-700 text-xs">
                  <MessageContent message={replyTo} />
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="ml-4 px-2 py-1 text-xs bg-blue-100 rounded text-blue-700 hover:bg-blue-200"
            >
              <FaTimes className="inline mr-1" /> Cancel
            </button>
          </div>
        )}

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

        <div className="flex items-end gap-2">
          <div className={`flex-1 relative border rounded-lg transition-all ${
            isFocused ? 'border-primary ring-1 ring-primary ring-opacity-50' : 'border-gray-300'
          }`}>
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={getAllowedFileExtensions()}
              className="hidden"
            />
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
            {message.length > 0 && (
              <div className="absolute bottom-2 right-12 text-xs text-gray-400">
                {message.length}
              </div>
            )}
          </div>
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