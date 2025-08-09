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
          {/* AWS S3 environment variables removed since S3 is not used */}
          <p>Bucket: {import.meta.env.VITE_S3_BUCKET ? '✅ Loaded' : '❌ Missing'}</p>
        </div>
      )}
    </div>
  );
}