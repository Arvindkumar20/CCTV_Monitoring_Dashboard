// client/src/services/storage/StorageManager.js
// ✅ YEH SABHI STORAGE TYPES KO MANAGE KARTA HAI

import { LocalStorageService } from './LocalStorageService';
import { ServerStorageService } from './ServerStorageService';

export class StorageManager {
  constructor() {
    this.localStorage = new LocalStorageService();
    this.serverStorage = new ServerStorageService();
    
    this.storageTypes = {
      local: this.localStorage,
      server: this.serverStorage,
    };
  }

  // Save recording to selected storage
  async saveRecording(blob, metadata, storageType = 'server') {
    const storage = this.storageTypes[storageType];
    if (!storage) {
      throw new Error(`Storage type '${storageType}' not found`);
    }
    return await storage.save(blob, metadata);
  }

  // Get all recordings from all storages
  async getAllRecordings() {
    try {
      // Server se fetch karo
      const serverRecordings = await this.serverStorage.getAll();
      
      // Local se fetch karo
      const localRecordings = this.localStorage.getRecordings();
      
      // Combine and sort
      const all = [...serverRecordings, ...localRecordings];
      return all.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to get recordings:', error);
      return [];
    }
  }

  // Delete from specific storage
  async deleteRecording(id, storageType) {
    const storage = this.storageTypes[storageType];
    if (!storage) {
      throw new Error(`Storage type '${storageType}' not found`);
    }
    return await storage.delete(id);
  }

  // Get storage info
  async getStorageInfo() {
    try {
      const serverInfo = await this.serverStorage.getStorageInfo();
      // Local storage info (from browser)
      const localInfo = {
        type: 'local',
        total: 1024 * 1024 * 1024, // 1GB
        used: this.localStorage.getRecordings().reduce((sum, r) => sum + r.size, 0),
        files: this.localStorage.getRecordings().length,
      };
      localInfo.available = localInfo.total - localInfo.used;
      localInfo.percentUsed = (localInfo.used / localInfo.total) * 100;

      return {
        storages: {
          server: serverInfo,
          local: localInfo,
        }
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }
}