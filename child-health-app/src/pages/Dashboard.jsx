import React from 'react';
import { Heart, Users, FileText, Upload, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import syncService from '../services/syncService';

const Dashboard = () => {
  const [stats, setStats] = React.useState({
    totalRecords: 0,
    pendingUploads: 0,
    uploadedRecords: 0,
    pendingSyncItems: 0,
    lastRecord: null
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [syncStatus, setSyncStatus] = React.useState({
    isOnline: navigator.onLine,
    syncInProgress: false,
    isAuthenticated: false
  });

  React.useEffect(() => {
    loadStats();
    
    // Update sync status periodically
    const syncInterval = setInterval(() => {
      setSyncStatus(syncService.getSyncStatus());
    }, 1000);

    // Listen for online/offline events
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      await childHealthDB.ensureDB();
      const dbStats = await childHealthDB.getStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Records',
      value: stats.totalRecords,
      icon: FileText,
      color: 'blue',
      description: 'Child health records collected'
    },
    {
      title: 'Pending Uploads',
      value: stats.pendingUploads,
      icon: Upload,
      color: stats.pendingUploads > 0 ? 'yellow' : 'green',
      description: 'Records waiting for sync'
    },
    {
      title: 'Uploaded Records',
      value: stats.uploadedRecords,
      icon: Users,
      color: 'green',
      description: 'Successfully synced to server'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* Sync Status */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            syncStatus.isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {syncStatus.isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{syncStatus.isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          {/* Date */}
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-gray-200 w-10 h-10"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map(({ title, value, icon: Icon, color, description }) => (
              <div key={title} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className={`p-2 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-400">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sync Alert */}
          {stats.pendingUploads > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    {stats.pendingUploads} record(s) pending upload
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {syncStatus.isOnline 
                      ? 'Records will sync automatically when authenticated.' 
                      : 'Records will sync when internet connection is restored.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Information Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome to Child Health Record</h2>
            <p className="text-gray-600 mb-4">
              This application helps field representatives collect child health data in remote areas, 
              even when offline. Data is stored securely on your device and can be uploaded when internet connectivity is available.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">📱 Offline Collection</h3>
                <p className="text-sm text-gray-600">
                  Collect child health data without internet connection. All data is stored securely using IndexedDB.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">🔐 Secure Upload</h3>
                <p className="text-sm text-gray-600">
                  Upload data securely using eSignet authentication when internet becomes available.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">📊 Real-time Sync</h3>
                <p className="text-sm text-gray-600">
                  Automatic synchronization when online with batch upload and retry mechanisms.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">📄 Health Records</h3>
                <p className="text-sm text-gray-600">
                  Generate PDF health booklets with unique Health IDs for each child.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => window.location.href = '/add-child'}
                className="flex items-center justify-center p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <div className="text-center">
                  <FileText className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary-600">Add New Record</p>
                </div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/records'}
                className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-600">View Records</p>
                </div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/sync'}
                className="flex items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-600">Sync Data</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;