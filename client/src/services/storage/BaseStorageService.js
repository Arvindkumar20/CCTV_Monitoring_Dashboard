// client/src/services/storage/LocalStorageService.js
// ✅ YEH SIRF BROWSER ME CHALTA HAI - LOCAL STORAGE USE KARTA HAI

export class LocalStorageService {
  constructor() {
    this.storageKey = 'camera_recordings';
  }

  // Save recording in browser localStorage
  async save(blob, metadata) {
    const id = `rec_${Date.now()}`;
    const base64Data = await this.blobToBase64(blob);
    
    const recording = {
      id,
      blob: base64Data,
      size: blob.size,
      ...metadata,
      storageType: 'local',
      timestamp: Date.now()
    };

    // Browser localStorage me save karo
    const recordings = this.getRecordings();
    recordings.unshift(recording);
    localStorage.setItem(this.storageKey, JSON.stringify(recordings));
    
    return recording;
  }

  // Browser localStorage se get karo
  getRecordings() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}