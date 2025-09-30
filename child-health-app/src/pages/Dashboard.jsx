import React, { useEffect, useState } from 'react';
import { Users, FileText, Wifi, WifiOff, Server, HardDrive } from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import api from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ totalRecords: 0, pendingUploads: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (user) {
      loadStats();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, isAdmin]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      if (isAdmin) {
        // ADMINS ONLY see data from the server.
        const response = await api.get('/children/stats');
        setStats({ totalRecords: response.data.totalRecords, pendingUploads: 0 });
      } else {
        // FIELD REPS ONLY see data from their local device.
        const dbStats = await childHealthDB.getStats(user.id);
        setStats({ totalRecords: dbStats.totalRecords, pendingUploads: dbStats.pendingUploads });
      }
    } catch (error) {
      notificationService.error('Could not load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // The rest of the component remains the same, as its logic was correct.
  // ...
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? 'Admin Dashboard' : 'Field Representative Dashboard'}</h1>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white rounded-lg shadow p-6 animate-pulse h-28"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isAdmin ? (
             <div className="bg-white rounded-lg shadow p-6">
             <div className="flex items-center">
               <div className="p-2 rounded-md bg-indigo-100">
                 <Server className="h-6 w-6 text-indigo-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-500">Total Server Records</p>
                 <p className="text-2xl font-semibold text-gray-900">{stats.totalRecords}</p>
                 <p className="text-xs text-gray-400">All data from the central database (MongoDB)</p>
               </div>
             </div>
           </div>
          ) : (
            <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-blue-100">
                  <HardDrive className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Local Records</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalRecords}</p>
                  <p className="text-xs text-gray-400">All records saved on this device</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-md ${stats.pendingUploads > 0 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <FileText className={`h-6 w-6 ${stats.pendingUploads > 0 ? 'text-yellow-600' : 'text-green-600'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Upload</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingUploads}</p>
                  <p className="text-xs text-gray-400">Records waiting to be synced</p>
                </div>
              </div>
            </div>
          </>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {!isAdmin && (
            <button onClick={() => window.location.href = '/add-child'} className="quick-action-btn border-primary-300 hover:bg-primary-50">
              <FileText className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-primary-600">Add New Record</p>
            </button>
          )}
          <button onClick={() => window.location.href = '/records'} className={`quick-action-btn border-blue-300 hover:bg-blue-50 ${isAdmin ? 'col-span-3' : ''}`}>
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-600">View All Records</p>
          </button>
          {!isAdmin && (
            <button onClick={() => window.location.href = '/sync'} className="quick-action-btn border-green-300 hover:bg-green-50">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-600">Sync Data</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;