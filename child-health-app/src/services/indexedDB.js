import { openDB } from 'idb';

const DB_NAME = 'ChildHealthDB';
const DB_VERSION = 1;
const STORES = {
  CHILD_RECORDS: 'childRecords',
  REPRESENTATIVES: 'representatives',
  SYNC_QUEUE: 'syncQueue'
};

class ChildHealthDB {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Child Records Store
          if (!db.objectStoreNames.contains(STORES.CHILD_RECORDS)) {
            const childStore = db.createObjectStore(STORES.CHILD_RECORDS, {
              keyPath: 'id',
              autoIncrement: true
            });
            childStore.createIndex('healthId', 'healthId', { unique: true });
            childStore.createIndex('childName', 'childName');
            childStore.createIndex('timestamp', 'timestamp');
            childStore.createIndex('uploaded', 'uploaded');
            childStore.createIndex('representativeId', 'representativeId');
          }

          // Representatives Store
          if (!db.objectStoreNames.contains(STORES.REPRESENTATIVES)) {
            const repStore = db.createObjectStore(STORES.REPRESENTATIVES, {
              keyPath: 'nationalId'
            });
            repStore.createIndex('name', 'name');
            repStore.createIndex('lastLogin', 'lastLogin');
          }

          // Sync Queue Store
          if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
            const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
              keyPath: 'id',
              autoIncrement: true
            });
            syncStore.createIndex('status', 'status');
            syncStore.createIndex('timestamp', 'timestamp');
            syncStore.createIndex('recordId', 'recordId');
          }
        }
      });
      console.log('📂 IndexedDB initialized successfully');
      return this.db;
    } catch (error) {
      console.error('❌ Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  // Child Records Operations
  async saveChildRecord(record) {
    const db = await this.ensureDB();
    try {
      const recordWithDefaults = {
        ...record,
        id: record.id || Date.now(),
        timestamp: record.timestamp || new Date().toISOString(),
        uploaded: false,
        syncStatus: 'pending'
      };

      const result = await db.put(STORES.CHILD_RECORDS, recordWithDefaults);
      console.log('💾 Child record saved to IndexedDB:', result);
      
      // Add to sync queue
      await this.addToSyncQueue(recordWithDefaults.id, 'create');
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save child record:', error);
      throw error;
    }
  }

  async getAllChildRecords() {
    const db = await this.ensureDB();
    try {
      const records = await db.getAll(STORES.CHILD_RECORDS);
      return records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('❌ Failed to get child records:', error);
      return [];
    }
  }

  async getChildRecord(id) {
    const db = await this.ensureDB();
    try {
      return await db.get(STORES.CHILD_RECORDS, id);
    } catch (error) {
      console.error('❌ Failed to get child record:', error);
      return null;
    }
  }

  async getChildRecordByHealthId(healthId) {
    const db = await this.ensureDB();
    try {
      return await db.getFromIndex(STORES.CHILD_RECORDS, 'healthId', healthId);
    } catch (error) {
      console.error('❌ Failed to get child record by health ID:', error);
      return null;
    }
  }

  async updateChildRecord(id, updates) {
    const db = await this.ensureDB();
    try {
      const existing = await db.get(STORES.CHILD_RECORDS, id);
      if (!existing) {
        throw new Error('Record not found');
      }

      const updated = {
        ...existing,
        ...updates,
        lastModified: new Date().toISOString()
      };

      await db.put(STORES.CHILD_RECORDS, updated);
      
      // Add to sync queue if not already uploaded
      if (!updated.uploaded) {
        await this.addToSyncQueue(id, 'update');
      }
      
      return updated;
    } catch (error) {
      console.error('❌ Failed to update child record:', error);
      throw error;
    }
  }

  async deleteChildRecord(id) {
    const db = await this.ensureDB();
    try {
      await db.delete(STORES.CHILD_RECORDS, id);
      await this.addToSyncQueue(id, 'delete');
      console.log('🗑️ Child record deleted from IndexedDB');
    } catch (error) {
      console.error('❌ Failed to delete child record:', error);
      throw error;
    }
  }

  async markRecordAsUploaded(id, serverData = {}) {
    const db = await this.ensureDB();
    try {
      const record = await db.get(STORES.CHILD_RECORDS, id);
      if (record) {
        const updated = {
          ...record,
          uploaded: true,
          uploadedAt: new Date().toISOString(),
          syncStatus: 'synced',
          serverData
        };
        await db.put(STORES.CHILD_RECORDS, updated);
        await this.removePendingSync(id);
      }
    } catch (error) {
      console.error('❌ Failed to mark record as uploaded:', error);
      throw error;
    }
  }

  // Sync Queue Operations
  async addToSyncQueue(recordId, action) {
    const db = await this.ensureDB();
    try {
      const syncItem = {
        recordId,
        action, // 'create', 'update', 'delete'
        timestamp: new Date().toISOString(),
        status: 'pending',
        attempts: 0
      };
      await db.add(STORES.SYNC_QUEUE, syncItem);
    } catch (error) {
      console.error('❌ Failed to add to sync queue:', error);
    }
  }

  async getPendingSyncItems() {
    const db = await this.ensureDB();
    try {
      const items = await db.getAllFromIndex(STORES.SYNC_QUEUE, 'status', 'pending');
      return items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } catch (error) {
      console.error('❌ Failed to get pending sync items:', error);
      return [];
    }
  }

  async removePendingSync(recordId) {
    const db = await this.ensureDB();
    try {
      const items = await db.getAllFromIndex(STORES.SYNC_QUEUE, 'recordId', recordId);
      for (const item of items) {
        await db.delete(STORES.SYNC_QUEUE, item.id);
      }
    } catch (error) {
      console.error('❌ Failed to remove pending sync:', error);
    }
  }

  // Representative Operations
  async saveRepresentative(representative) {
    const db = await this.ensureDB();
    try {
      const repWithDefaults = {
        ...representative,
        lastLogin: new Date().toISOString()
      };
      await db.put(STORES.REPRESENTATIVES, repWithDefaults);
      console.log('👤 Representative saved to IndexedDB');
    } catch (error) {
      console.error('❌ Failed to save representative:', error);
      throw error;
    }
  }

  async getRepresentative(nationalId) {
    const db = await this.ensureDB();
    try {
      return await db.get(STORES.REPRESENTATIVES, nationalId);
    } catch (error) {
      console.error('❌ Failed to get representative:', error);
      return null;
    }
  }

  // Statistics
  async getStats() {
    const db = await this.ensureDB();
    try {
      const allRecords = await db.getAll(STORES.CHILD_RECORDS);
      const uploaded = allRecords.filter(r => r.uploaded);
      const pending = allRecords.filter(r => !r.uploaded);
      const pendingSync = await db.getAllFromIndex(STORES.SYNC_QUEUE, 'status', 'pending');

      return {
        totalRecords: allRecords.length,
        uploadedRecords: uploaded.length,
        pendingUploads: pending.length,
        pendingSyncItems: pendingSync.length,
        lastRecord: allRecords.length > 0 ? allRecords[0].timestamp : null
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return {
        totalRecords: 0,
        uploadedRecords: 0,
        pendingUploads: 0,
        pendingSyncItems: 0,
        lastRecord: null
      };
    }
  }

  // Clear all data (for testing/reset)
  async clearAllData() {
    const db = await this.ensureDB();
    try {
      await db.clear(STORES.CHILD_RECORDS);
      await db.clear(STORES.REPRESENTATIVES);
      await db.clear(STORES.SYNC_QUEUE);
      console.log('🧹 All IndexedDB data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const childHealthDB = new ChildHealthDB();

export default childHealthDB;