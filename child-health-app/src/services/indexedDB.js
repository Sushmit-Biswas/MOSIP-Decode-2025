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
          if (!db.objectStoreNames.contains(STORES.CHILD_RECORDS)) {
            const childStore = db.createObjectStore(STORES.CHILD_RECORDS, { keyPath: 'id', autoIncrement: true });
            childStore.createIndex('healthId', 'healthId', { unique: true });
            childStore.createIndex('representativeId', 'representativeId');
          }
          if (!db.objectStoreNames.contains(STORES.REPRESENTATIVES)) {
            db.createObjectStore(STORES.REPRESENTATIVES, { keyPath: 'nationalId' });
          }
          if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
            db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          }
        }
      });
      return this.db;
    } catch (error) {
      console.error('❌ Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  async ensureDB() {
    if (!this.db) await this.init();
    return this.db;
  }

  async saveChildRecord(record) {
    try {
      const db = await this.ensureDB();
      const result = await db.put(STORES.CHILD_RECORDS, record);
      return result;
    } catch (error) {
      console.error('❌ Failed to save child record:', error);
      throw error;
    }
  }

  /**
   * Retrieves all child records for a specific representative.
   * This function now REQUIRES a representativeId to prevent data leakage.
   * @param {string} representativeId The ID of the logged-in representative.
   * @returns {Promise<Array>} A promise that resolves to an array of records.
   */
  async getAllChildRecords(representativeId) {
    if (!representativeId) {
      console.warn('getAllChildRecords called without representativeId. Returning empty array for security.');
      return [];
    }
    const db = await this.ensureDB();
    try {
      const records = await db.getAllFromIndex(STORES.CHILD_RECORDS, 'representativeId', representativeId);
      return records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error(`❌ Failed to get child records for rep: ${representativeId}`, error);
      return [];
    }
  }

  /**
   * Calculates statistics for a specific representative from local data.
   * This function now REQUIRES a representativeId.
   * @param {string} representativeId The ID of the logged-in representative.
   * @returns {Promise<Object>} A promise that resolves to a stats object.
   */
  async getStats(representativeId) {
    if (!representativeId) {
      console.warn('getStats called without representativeId. Returning zeroed stats.');
      return { totalRecords: 0, uploadedRecords: 0, pendingUploads: 0 };
    }
    try {
      const allRecords = await this.getAllChildRecords(representativeId);
      const uploaded = allRecords.filter(r => r.uploaded).length;
      const pending = allRecords.length - uploaded;
      return {
        totalRecords: allRecords.length,
        uploadedRecords: uploaded,
        pendingUploads: pending,
      };
    } catch (error) {
      console.error(`❌ Failed to get stats for rep: ${representativeId}`, error);
      return { totalRecords: 0, uploadedRecords: 0, pendingUploads: 0 };
    }
  }

  // Wipes all data from all stores in the database.
  async clearAllData() {
    const db = await this.ensureDB();
    try {
      await Promise.all([
        db.clear(STORES.CHILD_RECORDS),
        db.clear(STORES.REPRESENTATIVES),
        db.clear(STORES.SYNC_QUEUE)
      ]);
      console.log('🧹 All IndexedDB data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
      throw error;
    }
  }
}

const childHealthDB = new ChildHealthDB();
export default childHealthDB;