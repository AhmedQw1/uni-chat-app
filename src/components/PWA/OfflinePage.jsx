import { FaWifi, FaRefresh } from 'react-icons/fa';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FaWifi className="text-6xl text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            You're Offline
          </h1>
          <p className="text-gray-600">
            It looks like you've lost your internet connection. 
            You can still view previously loaded messages, but you won't 
            receive new messages until you're back online.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <FaRefresh className="mr-2" />
            Try Again
          </button>

          <div className="text-sm text-gray-500">
            <p className="mb-2">While offline, you can:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>Read previously loaded messages</li>
              <li>Browse group information</li>
              <li>View your profile</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}