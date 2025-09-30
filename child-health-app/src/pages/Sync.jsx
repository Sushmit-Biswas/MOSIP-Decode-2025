import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import syncService from '../services/syncService';
import { useAuth } from '../contexts/AuthContext';
import childHealthDB from '../services/indexedDB';

const Sync = () => {
  const { user, isAuthenticated } = useAuth();
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());
  const [pendingRecords, setPendingRecords] = useState(0);
  const [lastSync, setLastSync] = useState(null);

  const updateSyncState = async () => {
    setSyncStatus(syncService.getSyncStatus());
    if (user && !syncStatus.syncInProgress) {
      const stats = await childHealthDB.getStats(user.id);
      setPendingRecords(stats.pendingUploads);
    }
  };

  useEffect(() => {
    if (user) {
      updateSyncState();
    }
    const interval = setInterval(updateSyncState, 2000); // Check for updates periodically
    return () => clearInterval(interval);
  }, [user]);

  const handleSync = async () => {
    if (!isAuthenticated || !user) {
      // This case should ideally be handled by UI disabling the button
      return;
    }
    await syncService.uploadPendingRecords(user.id);
    setLastSync(new Date());
    updateSyncState(); // Refresh stats immediately after sync attempt
  };

  const isButtonDisabled = syncStatus.syncInProgress || !syncStatus.isOnline || pendingRecords === 0 || !isAuthenticated;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-0">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <UploadCloud className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Synchronization</h1>
            <p className="text-gray-500">Upload locally saved records to the central server.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center p-3 rounded-md ${syncStatus.isOnline ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {syncStatus.isOnline ? <Wifi className="h-5 w-5 mr-3" /> : <WifiOff className="h-5 w-5 mr-3" />}
            <span className="font-medium">{syncStatus.isOnline ? 'You are currently online' : 'You are currently offline'}</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-sm font-medium text-gray-600 mb-2">Sync Status</h2>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">{pendingRecords}</span>
              <span className="text-sm text-gray-500">record(s) pending upload</span>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="flex items-center p-3 rounded-md bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-3" />
              <span className="font-medium">Please log in to sync your data.</span>
            </div>
          )}

          {lastSync && (
            <p className="text-xs text-gray-500 text-center">
              Last sync attempt: {lastSync.toLocaleTimeString()}
            </p>
          )}

          <button
            onClick={handleSync}
            disabled={isButtonDisabled}
            className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {syncStatus.syncInProgress ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Syncing...</span>
              </>
            ) : pendingRecords > 0 ? (
              <span>Upload {pendingRecords} Record(s)</span>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5"/>
                <span>Data is Up to Date</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sync;