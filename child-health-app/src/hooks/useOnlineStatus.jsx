import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const handleOnline = () => {
      // Additional check by trying to fetch a small resource
      const checkConnection = async () => {
        try {
          // Try to fetch a small image with cache-busting
          await fetch('/icons/logo_without_bg.png?t=' + Date.now(), {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          });
          setIsOnline(true);
        } catch {
          setIsOnline(false);
        }
      };

      // Initial immediate update
      setIsOnline(true);
      
      // Then verify with actual connection test
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    updateOnlineStatus();

    // Periodic check every 30 seconds when online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        handleOnline();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;