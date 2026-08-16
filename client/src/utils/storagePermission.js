// utils/storagePermission.js
export const requestStoragePermission = async () => {
  try {
    // Check if Storage API is available
    if (!navigator.storage || !navigator.storage.persist) {
      console.debug('Storage API not available, using localStorage');
      return true;
    }

    // Check if already persisted
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) {
      return true;
    }

    // Request persistence
    const granted = await navigator.storage.persist();
    return granted;
  } catch (error) {
    console.debug('Storage permission request failed:', error);
    return false;
  }
};

export const getStorageInfo = async () => {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      return {
        total: 1024 * 1024 * 1024, // 1GB fallback
        used: 0,
        available: 1024 * 1024 * 1024,
      };
    }

    const estimate = await navigator.storage.estimate();
    return {
      total: estimate.total || 1024 * 1024 * 1024,
      used: estimate.used || 0,
      available: (estimate.total || 0) - (estimate.used || 0),
    };
  } catch (error) {
    console.debug('Failed to get storage info:', error);
    return {
      total: 1024 * 1024 * 1024,
      used: 0,
      available: 1024 * 1024 * 1024,
    };
  }
};

// Check if user has granted storage permission
export const hasStoragePermission = async () => {
  try {
    if (!navigator.storage || !navigator.storage.persisted) {
      return true; // Assume granted if API not available
    }
    return await navigator.storage.persisted();
  } catch (error) {
    return false;
  }
};