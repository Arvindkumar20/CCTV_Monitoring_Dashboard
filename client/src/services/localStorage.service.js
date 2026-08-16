// services/localStorage.service.js
export class LocalStorageService {
  constructor() {
    this.storageKey = 'camera_recordings';
    this.maxStorageSize = 1024 * 1024 * 1024; // 1GB limit
  }

  // Save recording to local storage
  async saveRecording(blob, metadata) {
    try {
      // Check available space
      const availableSpace = await this.getAvailableSpace();
      if (availableSpace < blob.size) {
        throw new Error(`Insufficient storage space. Available: ${this.formatBytes(availableSpace)}`);
      }

      // Generate unique ID
      const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Read blob as base64
      const base64Data = await this.blobToBase64(blob);
      
      // Create recording object
      const recording = {
        id,
        blob: base64Data,
        mimeType: blob.type,
        size: blob.size,
        timestamp: Date.now(),
        ...metadata,
      };

      // Get existing recordings
      const recordings = this.getRecordings();
      
      // Add new recording
      recordings.unshift(recording);
      
      // Check if we need to remove old recordings
      await this.manageStorage(recordings);
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(recordings));
      
      return recording;
    } catch (error) {
      console.error("Failed to save recording:", error);
      throw error;
    }
  }

  // Get all recordings
  getRecordings() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to get recordings:", error);
      return [];
    }
  }

  // Get single recording by ID
  getRecording(id) {
    const recordings = this.getRecordings();
    return recordings.find(rec => rec.id === id);
  }

  // Delete recording
  deleteRecording(id) {
    try {
      let recordings = this.getRecordings();
      recordings = recordings.filter(rec => rec.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(recordings));
      return true;
    } catch (error) {
      console.error("Failed to delete recording:", error);
      return false;
    }
  }

  // Clear all recordings
  clearAllRecordings() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error("Failed to clear recordings:", error);
      return false;
    }
  }

  // Convert blob to base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Convert base64 to blob
  base64ToBlob(base64, mimeType) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  }

  // Get total storage used
  getStorageUsed() {
    try {
      const recordings = this.getRecordings();
      return recordings.reduce((total, rec) => total + (rec.size || 0), 0);
    } catch (error) {
      return 0;
    }
  }

  // Get available storage space
  async getAvailableSpace() {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const total = estimate.total || this.maxStorageSize;
        const used = estimate.used || 0;
        return Math.min(total - used, this.maxStorageSize - this.getStorageUsed());
      }
    } catch (error) {
      console.debug("Storage API not available:", error);
    }
    return this.maxStorageSize - this.getStorageUsed();
  }

  // Manage storage - remove old recordings if needed
  async manageStorage(recordings) {
    let totalSize = recordings.reduce((total, rec) => total + (rec.size || 0), 0);
    const maxSize = this.maxStorageSize;
    
    // If total size exceeds max, remove oldest recordings
    while (totalSize > maxSize && recordings.length > 0) {
      const removed = recordings.pop();
      totalSize -= (removed.size || 0);
    }
    
    return recordings;
  }

  // Format bytes
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Export recording as download
  downloadRecording(recording, filename = null) {
    try {
      const blob = this.base64ToBlob(recording.blob, recording.mimeType);
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `recording_${recording.timestamp}.${this.getExtension(recording.mimeType)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch (error) {
      console.error("Failed to download recording:", error);
      return false;
    }
  }

  // Get file extension from MIME type
  getExtension(mimeType) {
    const extensions = {
      'video/webm': 'webm',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi'
    };
    return extensions[mimeType] || 'webm';
  }

  // Format duration
  formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export const localStorageService = new LocalStorageService();