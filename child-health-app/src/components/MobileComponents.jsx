import React from 'react';
import { Download, Share2, Smartphone, Wifi, WifiOff } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                            window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installation
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
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

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    } else {
      console.log('PWA installation declined');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember user dismissed for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed in this session or already installed
  if (isStandalone || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Smartphone className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">
            Install Child Health App
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Install our app for faster access and offline functionality.
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              <Download className="h-3 w-3" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [lastOnline, setLastOnline] = React.useState(new Date());

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null; // Don't show when online
  }

  return (
    <div className="fixed top-16 left-0 right-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 z-40">
      <div className="flex items-center justify-center space-x-2 text-yellow-800">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">
          You're offline. Data will sync when connection is restored.
        </span>
      </div>
      <p className="text-xs text-yellow-600 text-center mt-1">
        Last online: {lastOnline.toLocaleTimeString()}
      </p>
    </div>
  );
};

const ShareButton = ({ title, text, url }) => {
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const handleShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title: title || 'Child Health Record',
        text: text || 'Check out this child health record app',
        url: url || window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!canShare) {
    return null;
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
    >
      <Share2 className="h-4 w-4" />
      <span>Share</span>
    </button>
  );
};

const MobileKeyboard = ({ children }) => {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      // Detect virtual keyboard on mobile
      const viewport = window.visualViewport;
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height;
        setKeyboardHeight(keyboardHeight > 0 ? keyboardHeight : 0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <div 
      style={{ 
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0px',
        transition: 'padding-bottom 0.3s ease'
      }}
    >
      {children}
    </div>
  );
};

const TouchFeedback = ({ children, onTouch, ...props }) => {
  const [isTouched, setIsTouched] = React.useState(false);

  const handleTouchStart = (e) => {
    setIsTouched(true);
    if (onTouch) onTouch(e);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsTouched(false), 150);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`transition-transform ${isTouched ? 'scale-95' : 'scale-100'}`}
      {...props}
    >
      {children}
    </div>
  );
};

const MobileNavigation = ({ items, currentPath, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-50">
      <div className="flex justify-around">
        {items.map(({ path, icon: IconComponent, label }) => {
          const isActive = currentPath === path;
          return (
            <TouchFeedback 
              key={path}
              onTouch={() => onNavigate(path)}
              className="flex flex-col items-center py-1"
            >
              <IconComponent 
                className={`h-5 w-5 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`} 
              />
              <span 
                className={`text-xs mt-1 ${
                  isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </TouchFeedback>
          );
        })}
      </div>
    </div>
  );
};

const PullToRefresh = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const maxPullDistance = 100;

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && startY > 0) {
      const currentY = e.touches[0].clientY;
      const pullDistance = Math.max(0, Math.min(maxPullDistance, currentY - startY));
      setPullDistance(pullDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    setStartY(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance * 0.5}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease' : 'none'
      }}
    >
      {pullDistance > 0 && (
        <div className="flex justify-center py-2">
          <div className="text-gray-500 text-sm">
            {pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export {
  PWAInstallPrompt,
  ConnectionStatus,
  ShareButton,
  MobileKeyboard,
  TouchFeedback,
  MobileNavigation,
  PullToRefresh
};