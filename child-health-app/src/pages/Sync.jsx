import React from 'react';
import { Upload, Wifi, WifiOff, CheckCircle, AlertCircle, Key } from 'lucide-react';
import childHealthDB from '../services/indexedDB';
import syncService from '../services/syncService';
import activityLogger from '../services/activityLogger';
import useOnlineStatus from '../hooks/useOnlineStatus.jsx';

const Sync = () => {
  const isOnline = useOnlineStatus();
  const [pendingRecords, setPendingRecords] = React.useState([]);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authData, setAuthData] = React.useState({ nationalId: '', otp: '' });
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState(null);

  React.useEffect(() => {
    loadPendingRecords();
  }, []);

  const loadPendingRecords = async () => {
    try {
      await childHealthDB.ensureDB();
      const allRecords = await childHealthDB.getAllChildRecords();
      const pending = allRecords.filter(record => !record.uploaded);
      setPendingRecords(pending);
    } catch (error) {
      console.error('Failed to load pending records:', error);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await syncService.authenticateWithESignet(authData.nationalId, authData.otp);
      
      if (result.success) {
        setIsAuthenticated(true);
        setUploadStatus({ 
          type: 'success', 
          message: `Authentication successful! Welcome, ${result.data.user.name}` 
        });
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: result.error || 'Authentication failed' 
        });
      }
    } catch {
      setUploadStatus({ 
        type: 'error', 
        message: 'Authentication failed. Please try again.' 
      });
    }
  };

  const handleUpload = async () => {
    if (!isAuthenticated) {
      setUploadStatus({ type: 'error', message: 'Please authenticate first' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: 'info', message: 'Uploading records...' });

    // Log sync start
    activityLogger.logActivity(activityLogger.ACTIONS.SYNC_STARTED, {
      recordCount: pendingRecords.length,
      isOnline
    });

    try {
      const result = await syncService.forcSync();
      
      if (result.success) {
        setUploadStatus({ 
          type: 'success', 
          message: result.message 
        });
        
        // Log successful sync
        activityLogger.logActivity(activityLogger.ACTIONS.SYNC_COMPLETED, {
          recordCount: pendingRecords.length,
          syncResult: result
        });
        
        // Reload pending records
        await loadPendingRecords();
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: result.message || 'Upload failed. Please try again.' 
        });
        
        // Log partial sync
        activityLogger.logActivity(activityLogger.ACTIONS.SYNC_PARTIAL, {
          recordCount: pendingRecords.length,
          error: result.message,
          syncResult: result
        });
      }
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Upload failed. Please check your connection and try again.' 
      });
      
      // Log sync failure
      activityLogger.logActivity(activityLogger.ACTIONS.SYNC_FAILED, {
        recordCount: pendingRecords.length,
        error: error.message || 'Unknown error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sendOTP = async () => {
    if (!authData.nationalId) {
      setUploadStatus({ type: 'error', message: 'Please enter National ID first' });
      return;
    }

    try {
      const result = await syncService.sendOTP(authData.nationalId);
      
      if (result.success) {
        setUploadStatus({ 
          type: 'info', 
          message: result.message + (result.otp ? ` Test OTP: ${result.otp}` : '')
        });
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: result.error || 'Failed to send OTP' 
        });
      }
    } catch {
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to send OTP. Please try again.' 
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Data Synchronization</h1>
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div className={`p-4 rounded-md ${
          uploadStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
          uploadStatus.type === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            {uploadStatus.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400 mr-2" />}
            {uploadStatus.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400 mr-2" />}
            {uploadStatus.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />}
            <p className={`text-sm ${
              uploadStatus.type === 'success' ? 'text-green-800' :
              uploadStatus.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {uploadStatus.message}
            </p>
          </div>
        </div>
      )}

      {/* Pending Records Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Summary</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Records pending upload</p>
            <p className="text-2xl font-bold text-gray-900">{pendingRecords.length}</p>
          </div>
          <Upload className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      {/* Authentication Section */}
      {isOnline && pendingRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Key className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">eSignet Authentication</h2>
          </div>

          {!isAuthenticated ? (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="form-label">National ID</label>
                <input
                  type="text"
                  value={authData.nationalId}
                  onChange={(e) => setAuthData(prev => ({ ...prev, nationalId: e.target.value }))}
                  className="form-input"
                  placeholder="Enter your National ID"
                  required
                />
              </div>

              <div>
                <label className="form-label">OTP</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={authData.otp}
                    onChange={(e) => setAuthData(prev => ({ ...prev, otp: e.target.value }))}
                    className="form-input"
                    placeholder="Enter OTP (use 123456)"
                    required
                  />
                  <button
                    type="button"
                    onClick={sendOTP}
                    className="btn-secondary"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Authenticate
              </button>
            </form>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Authenticated successfully</span>
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      {isOnline && pendingRecords.length > 0 && isAuthenticated && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Data</h2>
          <p className="text-gray-600 mb-4">
            Ready to upload {pendingRecords.length} child health records securely to the server.
          </p>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary disabled:opacity-50 flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload All Records'}</span>
          </button>
        </div>
      )}

      {/* Offline Message */}
      {!isOnline && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <WifiOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Internet Connection</h3>
            <p className="text-gray-500">
              Connect to the internet to upload your collected data securely.
              {pendingRecords.length > 0 && ` You have ${pendingRecords.length} records waiting to be uploaded.`}
            </p>
          </div>
        </div>
      )}

      {/* No Pending Records */}
      {pendingRecords.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Records Uploaded</h3>
            <p className="text-gray-500">
              Great! All your child health records have been successfully uploaded to the server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sync;