import api from './apiService';
import childHealthDB from './indexedDB';
import notificationService from './notificationService';

const syncService = {
  syncInProgress: false,

  getSyncStatus() {
    return {
      isOnline: navigator.onLine,
      syncInProgress: this.syncInProgress,
    };
  },

  async uploadPendingRecords(representativeId) {
    if (this.syncInProgress) {
      console.log('SYNC: Sync already in progress.');
      return;
    }
    if (!navigator.onLine) {
      notificationService.info('You are offline. Sync will start when you are back online.');
      return;
    }

    this.syncInProgress = true;
    const loadingToast = notificationService.loading('Starting data sync...');
    
    try {
      // 1. Get all local records for this user.
      const allLocalRecords = await childHealthDB.getAllChildRecords(representativeId);
      
      // 2. Filter for only those that have not been uploaded.
      const pendingRecords = allLocalRecords.filter(record => !record.uploaded);

      if (pendingRecords.length === 0) {
        notificationService.success('Your data is already up to date.');
        this.syncInProgress = false;
        notificationService.dismiss(loadingToast);
        return;
      }
      
      notificationService.info(`Uploading ${pendingRecords.length} record(s)...`);
      let successCount = 0;
      let errorCount = 0;

      // 3. Loop through and upload each one.
      for (const record of pendingRecords) {
        try {
          // The backend will get the representativeId from the secure JWT token.
          await api.post('/children', record);

          // 4. If successful, mark it as uploaded in the local database.
          await childHealthDB.updateChildRecord(record.id, { uploaded: true });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`SYNC: Failed to upload record ID ${record.id}:`, error.response?.data?.message || error.message);
        }
      }

      notificationService.dismiss(loadingToast);
      if (successCount > 0) {
        notificationService.success(`Successfully synced ${successCount} record(s).`);
      }
      if (errorCount > 0) {
        notificationService.error(`${errorCount} record(s) failed to sync.`);
      }

    } catch (error) {
      notificationService.dismiss(loadingToast);
      notificationService.error('A critical error occurred during sync.');
    } finally {
      this.syncInProgress = false;
    }
  },
};

export default syncService;
