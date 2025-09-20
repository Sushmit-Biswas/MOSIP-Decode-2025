import childHealthDB from './indexedDB';
import apiService from './apiService';

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.authToken = null;
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  handleOnline() {
    console.log('🌐 Connection restored - triggering sync');
    this.isOnline = true;
    // Auto-sync when connection is restored
    setTimeout(() => this.autoSync(), 2000);
  }

  handleOffline() {
    console.log('📴 Connection lost - entering offline mode');
    this.isOnline = false;
  }

  setAuthToken(token) {
    this.authToken = token;
    apiService.setAuthToken(token);
  }

  async autoSync() {
    if (!this.isOnline || this.syncInProgress || !this.authToken) {
      return;
    }

    try {
      await this.syncPendingRecords();
    } catch (error) {
      console.error('❌ Auto-sync failed:', error);
    }
  }

  async syncPendingRecords() {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    if (!this.authToken) {
      console.log('🔐 No auth token - cannot sync');
      return { success: false, message: 'Authentication required' };
    }

    this.syncInProgress = true;

    try {
      const PENDING_ITEMS = await childHealthDB.getPendingSyncItems();
      console.log(`Found ${PENDING_ITEMS.length} pending sync items`);
      
      const pendingRecords = await childHealthDB.getAllChildRecords()
        .then(records => records.filter(r => !r.uploaded));

      if (pendingRecords.length === 0) {
        this.syncInProgress = false;
        return { success: true, message: 'No records to sync', count: 0 };
      }

      console.log(`🔄 Starting sync for ${pendingRecords.length} records`);

      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      // Upload records in batches
      const batchSize = 5;
      for (let i = 0; i < pendingRecords.length; i += batchSize) {
        const batch = pendingRecords.slice(i, i + batchSize);
        
        try {
          const response = await this.uploadBatch(batch);
          
          if (response.success) {
            // Mark records as uploaded
            for (const record of batch) {
              await childHealthDB.markRecordAsUploaded(record.id, {
                serverId: response.data?.serverId,
                uploadedAt: new Date().toISOString()
              });
              results.successful++;
            }
          } else {
            results.failed += batch.length;
            results.errors.push(response.error || 'Upload failed');
          }
        } catch (error) {
          console.error(`❌ Batch upload failed:`, error);
          results.failed += batch.length;
          results.errors.push(error.message);
        }
      }

      this.syncInProgress = false;

      return {
        success: results.successful > 0,
        message: `Sync completed: ${results.successful} successful, ${results.failed} failed`,
        results
      };

    } catch (error) {
      this.syncInProgress = false;
      console.error('❌ Sync failed:', error);
      return { success: false, message: error.message };
    }
  }

  async uploadBatch(records) {
    try {
      const result = await apiService.uploadRecords(records, this.authToken);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (error) {
      console.error('❌ Upload batch failed:', error);
      throw error;
    }
  }

  async fetchFromServer(endpoint) {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    try {
      return await apiService.request(endpoint);
    } catch (error) {
      console.error(`❌ Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  async authenticateWithESignet(nationalId, otp) {
    try {
      const result = await apiService.authenticateWithESignet(nationalId, otp);
      
      if (result.success) {
        this.setAuthToken(result.data.token);
        
        // Save representative info
        await childHealthDB.saveRepresentative({
          nationalId,
          name: result.data.user.name,
          role: result.data.user.role,
          lastLogin: new Date().toISOString()
        });

        // Auto-sync after authentication
        setTimeout(() => this.autoSync(), 1000);
      }

      return result;
    } catch (error) {
      console.error('❌ eSignet authentication failed:', error);
      throw error;
    }
  }

  async sendOTP(nationalId) {
    try {
      return await apiService.sendOTP(nationalId);
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      throw error;
    }
  }

  // Check server connectivity
  async checkServerConnection() {
    try {
      return await apiService.checkHealth();
    } catch {
      return false;
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      isAuthenticated: !!this.authToken
    };
  }

  // Manual sync trigger
  async forcSync() {
    if (!this.isOnline) {
      throw new Error('No internet connection available');
    }

    if (!this.authToken) {
      throw new Error('Authentication required for sync');
    }

    return await this.syncPendingRecords();
  }
}

// Create singleton instance
const syncService = new SyncService();

export default syncService;