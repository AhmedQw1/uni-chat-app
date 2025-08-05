import { useState } from 'react';

export default function DebugEnv() {
  const [showEnv, setShowEnv] = useState(false);
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <button 
        onClick={() => setShowEnv(!showEnv)}
        className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
      >
        {showEnv ? 'Hide' : 'Check'} Environment Variables
      </button>
      
      {showEnv && (
        <div className="bg-white p-4 rounded border">
          <p>Region: {import.meta.env.VITE_AWS_REGION ? '✅ Loaded' : '❌ Missing'}</p>
          <p>Access Key: {import.meta.env.VITE_AWS_ACCESS_KEY ? '✅ Loaded' : '❌ Missing'}</p>
          <p>Secret Key: {import.meta.env.VITE_AWS_SECRET_KEY ? '✅ Loaded' : '❌ Missing'}</p>
          <p>Bucket: {import.meta.env.VITE_S3_BUCKET ? '✅ Loaded' : '❌ Missing'}</p>
        </div>
      )}
    </div>
  );
}