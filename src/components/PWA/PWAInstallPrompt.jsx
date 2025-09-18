import { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Check if app is already installed (running in standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               window.navigator.standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show prompt if not already dismissed and not in standalone mode
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed && !isInStandaloneMode) {
        setShowInstallPrompt(true);
      }
    };

    // Handle successful installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already in standalone mode
  if (isStandalone) return null;

  // iOS install instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <FaDownload className="mr-2" />
              <span className="font-semibold">Install UniChat</span>
            </div>
            <p className="text-sm text-blue-100 mb-2">
              To install UniChat on your iPhone/iPad:
            </p>
            <ol className="text-xs text-blue-100 list-decimal list-inside space-y-1">
              <li>Tap the Share button (□↗) in Safari</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to install UniChat</li>
            </ol>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-blue-100 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    );
  }

  // Android/Desktop install prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaDownload className="mr-3 text-xl" />
            <div>
              <h3 className="font-semibold">Install UniChat</h3>
              <p className="text-sm text-blue-100">
                Install the app for a better experience!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-primary px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-100 hover:text-white p-2"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}